import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import fbicon from '../assets/fblg.png';
import linkedinicon from '../assets/linkedinlg.png';
import addIconImg from '../assets/AddButton.png';
import addMember from '../assets/addmember.png';
import infobg from '../assets/WSinfobg.png';

const formatTaskDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

const PLATFORM_LABELS = {
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
};

const PLATFORM_ICONS = {
  facebook: fbicon,
  linkedin: linkedinicon,
};

function platformLabel(platform) {
  return PLATFORM_LABELS[platform] || platform;
}

function platformIcon(platform) {
  return PLATFORM_ICONS[platform] || fbicon;
}


export default function WSmodule({ user }) {
  const isManager = user?.role === 'manager';

  const [approvalRequests, setApprovalRequests] = useState([]);
  const [approvalLoading, setApprovalLoading] = useState(true);

  const [distributorList, setDistributorList] = useState([]);
  const [distributorLoading, setDistributorLoading] = useState(true);

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true)

  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);

  const [workspaceDetail, setWorkspaceDetail] = useState(null);
  const [workspaceDetailLoading, setWorkspaceDetailLoading] = useState(true);

  const workspaceId = user?.workspace_id || user?.workspace?.workspace_id || null;


const fetchMembers = async () => {
  setMembersLoading(true);
  try {
    const token = localStorage.getItem('token');
    if (!workspaceId) {
      setMembers([]);
      return;
    }

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`http://localhost:8000/workspaces/${workspaceId}/members`, { headers });
    if (res.ok) {
      const data = await res.json();
      const mapped = (Array.isArray(data) ? data : []).map((m) => ({
        id: m.user_id,
        name: m.username,
        joined: 'Joined ' + new Date(m.joined_at).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'long', year: 'numeric'
        }),
        avatar: m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.username)}&background=FE7216&color=fff&size=40`
      }));
      setMembers(mapped);
    }
  } catch (err) {
    console.error('Failed to fetch members:', err);
  } finally {
    setMembersLoading(false);
  }
};

useEffect(() => {
  fetchMembers();
}, [user, workspaceId]);


useEffect(() => {
  const fetchWorkspaceDetail = async () => {
    setWorkspaceDetailLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!workspaceId) {
        console.warn('WSmodule: missing workspaceId on user object, skip fetching workspace detail', user);
        setWorkspaceDetail(null);
        return;
      }

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8000/workspaces/${workspaceId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setWorkspaceDetail({
          name: data.workspace_name,
          managerName: data.manager_name,
          workspaceId: data.workspace_id,
          createdAt: data.created_at
            ? new Date(data.created_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric'
              })
            : null,
          memberCount: data.member_count,
        });
      } else {
        console.error('Failed to fetch workspace detail, status:', res.status);
      }
    } catch (err) {
      console.error('Failed to fetch workspace detail:', err);
    } finally {
      setWorkspaceDetailLoading(false);
    }
  };

  fetchWorkspaceDetail();
}, [user, workspaceId]);

useEffect(() => {
  const fetchDistributorChannels = async () => {
    setDistributorLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!workspaceId) {
        setDistributorList([]);
        return;
      }

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(
        `http://localhost:8000/api/v1/distribution/channels?workspace_id=${workspaceId}`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.channels || []).map((c) => ({
          id: c.id,
          platform: platformLabel(c.platform),
          name: c.display_name,
          icon: platformIcon(c.platform),
          active: c.enabled_for_workspace
        }));
        setDistributorList(mapped);
      } else {
        console.error('Failed to fetch distributor channels, status:', res.status);
      }
    } catch (err) {
      console.error('Failed to fetch distributor channels:', err);
    } finally {
      setDistributorLoading(false);
    }
  };

  fetchDistributorChannels();
}, [user, workspaceId]);


  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!workspaceId) {
        setTasks([]);
        return;
      }

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8000/workspaces/${workspaceId}/tasks`, { headers });
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch tasks, status:', res.status);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user, workspaceId]);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showManageMemberModal, setShowManageMemberModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState(null);


  const [joinRequests, setJoinRequests] = useState([]);
  const [joinRequestsLoading, setJoinRequestsLoading] = useState(false);

  const fetchJoinRequests = async () => {
    if (!workspaceId) {
      setJoinRequests([]);
      return;
    }
    setJoinRequestsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8000/workspaces/${workspaceId}/join-requests`, { headers });
      if (res.ok) {
        const data = await res.json();
        setJoinRequests(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch join requests, status:', res.status);
      }
    } catch (err) {
      console.error('Failed to fetch join requests:', err);
    } finally {
      setJoinRequestsLoading(false);
    }
  };

  // Fetch pending join requests each time the modal is opened
  useEffect(() => {
    if (showJoinModal) {
      fetchJoinRequests();
    }
  }, [showJoinModal, workspaceId]);


  const handleAcceptJoinRequest = async (userId, username) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(
        `http://localhost:8000/workspaces/${workspaceId}/join-requests/${userId}/accept`,
        { method: 'PATCH', headers }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || 'Failed to accept join request');
        return;
      }

      setJoinRequests(prev => prev.filter(r => r.user_id !== userId));
      toast.success(`Accepted ${username}`);
      // Refresh member list since a new active member was added
      fetchMembers();
    } catch (err) {
      console.error('Failed to accept join request:', err);
      toast.error('Network error while accepting join request');
    }
  };


  const handleDenyJoinRequest = async (userId, username) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(
        `http://localhost:8000/workspaces/${workspaceId}/join-requests/${userId}`,
        { method: 'DELETE', headers }
      );

      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || 'Failed to decline join request');
        return;
      }

      setJoinRequests(prev => prev.filter(r => r.user_id !== userId));
      toast.error(`Declined ${username}`);
    } catch (err) {
      console.error('Failed to decline join request:', err);
      toast.error('Network error while declining join request');
    }
  };

  const handleToggleDistributor = async (id) => {
    const target = distributorList.find(item => item.id === id);
    if (!target) return;
    const nextActive = !target.active;

    // Optimistic update
    setDistributorList(prev =>
      prev.map(item =>
        item.id === id ? { ...item, active: nextActive } : item
      )
    );

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(
        `http://localhost:8000/api/v1/distribution/channels/${id}/toggle-workspace`,
        { method: 'PATCH', headers }
      );

      if (!res.ok) {
        // Rollback if the request failed
        setDistributorList(prev =>
          prev.map(item =>
            item.id === id ? { ...item, active: target.active } : item
          )
        );
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || 'Failed to update distributor status');
        return;
      }

      const data = await res.json();
      setDistributorList(prev =>
        prev.map(item =>
          item.id === id ? { ...item, active: data.enabled_for_workspace } : item
        )
      );

      toast(data.enabled_for_workspace ? 'Distributor activated' : 'Distributor deactivated', {
        icon: data.enabled_for_workspace ? '✅' : '⏸️'
      });
    } catch (err) {
      // Rollback on network error
      setDistributorList(prev =>
        prev.map(item =>
          item.id === id ? { ...item, active: target.active } : item
        )
      );
      console.error('Failed to toggle distributor:', err);
      toast.error('Network error while updating distributor status');
    }
  };


  const mapPostToRequest = (post) => ({
  id: post.id,
  title: post.title || (post.content ? post.content.slice(0, 40) : 'Untitled post'),
  content: post.content || '',
  status: post.status,
  authorId: post.author_id,
  attachment: post.attachment || null,
});

const fetchApprovalRequests = async () => {
  setApprovalLoading(true);
  try {
    const token = localStorage.getItem('token');
    if (!workspaceId) {
      setApprovalRequests([]);
      return;
    }
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`http://localhost:8000/workspaces/${workspaceId}/posts`, { headers });
    if (res.ok) {
      const data = await res.json();
      const posts = Array.isArray(data) ? data : [];
      setApprovalRequests(posts.map(mapPostToRequest));
    } else {
      console.error('Failed to fetch workspace posts, status:', res.status);
    }
  } catch (err) {
    console.error('Failed to fetch workspace posts:', err);
  } finally {
    setApprovalLoading(false);
  }
};

useEffect(() => {
  fetchApprovalRequests();
}, [user, workspaceId]);

const patchPost = async (id, payload) => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`http://localhost:8000/workspaces/${workspaceId}/posts/${id}`, {
    method: 'PATCH', headers, body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update the request');
  }
  return res.json();
};

const handleApprove = async (id) => {
  try {
    await patchPost(id, { status: 'ready_for_distribution' });
    setApprovalRequests(prev => prev.filter(r => r.id !== id));
    toast.success('Request Approved successfully');
  } catch (err) { toast.error(err.message); }
};

const handleDenyWithComment = async (id, comment) => {
  try {
    await patchPost(id, { status: 'rejected' });
    setApprovalRequests(prev => prev.filter(r => r.id !== id));
    toast.error(`Request Rejected: "${comment}"`);
  } catch (err) { toast.error(err.message); }
};

const handleCancelRequest = async (id) => {
  try {
    await patchPost(id, { status: 'rejected' });
    setApprovalRequests(prev => prev.filter(r => r.id !== id));
    toast('Request Cancelled', { icon: 'ℹ️' });
  } catch (err) { toast.error(err.message); }
};

  const handleViewRequest = (req) => {
    setSelectedRequest(req);
    setShowRejectReason(false);
    setRejectComment('');
  };

  const getPriorityStyle = (priority) => {
    const p = String(priority || '').toLowerCase();
    const baseStyle = {
      padding: '3px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'inline-block'
    };
    if (p === 'low') {
      return { ...baseStyle, color: '#2ECC71', border: '1px solid #2ECC71', backgroundColor: '#EAFAF1' };
    }
    if (p === 'medium') {
      return { ...baseStyle, color: '#F39C12', border: '1px solid #F39C12', backgroundColor: '#FEF5E7' };
    }
    if (p === 'high') {
      return { ...baseStyle, color: '#E74C3C', border: '1px solid #E74C3C', backgroundColor: '#FDEDEC' };
    }
    return { ...baseStyle, color: '#7F8C8D', border: '1px solid #7F8C8D', backgroundColor: '#F4F6F6' };
  };

  return (
    <div style={{
      width: '97%',
      fontFamily: 'Satoshi, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#1e1e1e',
      margin: '0px', 
      padding: '0px',
    }}>
      {/* Outer Grid Frame: Left Workspace Container + Right Member Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
        alignItems: 'start',
        width: '100%',
      }}>

        {/* LEFT MAIN WORKSPACE CONTAINER */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: '75%',
          boxSizing: 'border-box'
        }}>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h1 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '700',
              color: '#443e36'
            }}>
              {isManager ? 'Manage Your Workspace' : 'Your Workspace'}
            </h1>

            {isManager && (
              <div
                onClick={() => setShowJoinModal(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.width = '120px';
                  e.currentTarget.querySelector('.jr-label').style.opacity = '1';
                  e.currentTarget.querySelector('.jr-label').style.maxWidth = '100px';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.width = '30px';
                  e.currentTarget.querySelector('.jr-label').style.opacity = '0';
                  e.currentTarget.querySelector('.jr-label').style.maxWidth = '0px';
                }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50px',
                  backgroundColor: '#FE7216',
                  cursor: 'pointer',
                  userSelect: 'none',
                  overflow: 'hidden',
                  transition: 'width 0.3s ease',
                  flexShrink: 0,
                  padding: '0 5px',
                  boxSizing: 'border-box'
                }}
              >
                <span
                  className="jr-label"
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    maxWidth: '0px',
                    overflow: 'hidden',
                    transition: 'opacity 0.25s ease 0.05s, max-width 0.3s ease',
                    marginRight: '6px'
                  }}
                >
                  Join Request
                </span>
                <img
                  src={addMember}
                  alt="Join Request"
                  style={{
                    width: '15px',
                    height: '15px',
                    objectFit: 'contain',
                    flexShrink: 0,
                    filter: 'brightness(0) invert(1)'
                  }}
                />
              </div>
            )}
          </div>

          {/* 1. Approval Request / Submitted Approval Request Section */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '15px',
            padding: '15px',
            display: 'flex',
            height: '300px',
            flexDirection: 'column'
          }}>
            {/* Section Title */}
            <h2 style={{
              margin: '0 0 14px 0',
              fontSize: '14px',
              fontWeight: '700',
              color: '#554e43'
            }}>
              {isManager ? 'Approval Request' : 'Submitted Approval Request'}
            </h2>

            {/* Table Header */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '13px'
            }}>
              <thead>
                <tr style={{ color: '#7c7c7c', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
                  <th style={{ padding: '10px 5px', fontWeight: '600', width: '30%' }}>Task title</th>
                  {isManager ? (
                    <th style={{ padding: '10px 5px', fontWeight: '600', textAlign: 'center', width: '27%' }}>Submitted by</th>
                  ) : (
                    <th style={{ padding: '10px 5px', fontWeight: '600', width: '27%' }}>Content</th>
                  )}
                  <th style={{ padding: '10px 5px', fontWeight: '600', width: '22%' }}>Attachment</th>
                  <th style={{ padding: '10px 5px', fontWeight: '600', textAlign: 'center', width: '21%' }}></th>
                </tr>
              </thead>
            </table>

            {/* Table Body (scrollable) */}
            <div className="custom-scroll" style={{
              overflowY: 'auto',
              flex: 1
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <tbody>
                  {approvalLoading ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '20px 0', textAlign: 'center', color: '#7c7c7c' }}>
                        Loading...
                      </td>
                    </tr>
                  ) : approvalRequests.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '20px 0', textAlign: 'center', color: '#7c7c7c' }}>
                        No pending requests.
                      </td>
                    </tr>
                  ) : (
                  approvalRequests.map((req) => (
                    <tr
                      key={req.id}
                      style={{
                        borderBottom: '1px solid rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      <td style={{ padding: '8px 5px', color: '#666666', fontWeight: '500', width: '30%' }}>
                        {req.title}
                      </td>

                      {isManager ? (
                        <td style={{ padding: '10px 5px', color: '#666666', width: '27%' }}>
                          {members.find(m => m.id === req.authorId)?.name || 'Member'}
                        </td>
                      ) : (
                        <td style={{ padding: '10px', color: '#7c7c7c', width: '27%' }}>
                          {req.content}
                        </td>
                      )}

                      <td style={{ padding: '10px', color: '#666666', width: '22%' }}>
                        {req.attachment ? (
                          <a
                            href={req.attachment.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            style={{ color: '#FE7216', fontWeight: '600', textDecoration: 'none' }}
                          >
                            Download
                          </a>
                        ) : (
                          <span style={{ color: '#b5b5b5' }}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '10px 0 10px 12px', textAlign: 'right', whiteSpace: 'nowrap', width: '21%' }}>
                        {isManager ? (
                          <button
                            onClick={() => handleViewRequest(req)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#FE7216',
                              fontWeight: '600',
                              fontSize: '13px',
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            View
                          </button>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                              onClick={() => handleViewRequest(req)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#FE7216',
                                fontWeight: '600',
                                fontSize: '13px',
                                cursor: 'pointer',
                                padding: 0
                              }}
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleCancelRequest(req.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#7c7c7c',
                                fontWeight: '500',
                                fontSize: '13px',
                                cursor: 'pointer',
                                padding: 0
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Middle Row Grid  */}
          <div style={{
            display: 'grid',
            width: '100%',
            gap: '20px',
            display: 'flex',
            flexDirection: 'row'
          }}>
            {/* Workspace Distributor Card */}
                        <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '16px',
              padding: '15px',
              display: 'flex',
              flexDirection: 'column',
              width: '48%', 
              height: '250px'
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px'
              }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#554e43' }}>
                  Workspace Distributor
                </h3>
                <span style={{ fontSize: '12px', color: '#554e43', cursor: 'pointer', fontWeight: '500' }}>
                  Details &gt;
                </span>
              </div>

              {/* Channel Items */}
              <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', overflowY: 'auto' }}>
                {distributorLoading ? (
                  <div style={{ fontSize: '12px', color: '#7c7c7c', textAlign: 'center', padding: '20px 0' }}>
                    Loading...
                  </div>
                ) : distributorList.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#7c7c7c', textAlign: 'center', padding: '20px 0' }}>
                    No distributor channels connected yet.
                  </div>
                ) : (
                distributorList.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: '8px',
                      borderBottom: '1px solid rgba(0,0,0,0.04)'
                    }}
                  >
                    {/* Left Icon & Label */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={item.icon} alt={item.platform} style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e1e1e', lineHeight: '1.2' }}>
                          {item.platform}
                        </div>
                        <div style={{ fontSize: '11px', color: '#7c7c7c', marginTop: '1px' }}>
                          {item.name}
                        </div>
                      </div>
                    </div>

                    {/* Manager: Switch Toggle | Member: Active Badge */}
                    {isManager ? (
                      <div
                        onClick={() => handleToggleDistributor(item.id)}
                        style={{
                          width: '38px',
                          height: '20px',
                          borderRadius: '10px',
                          backgroundColor: item.active ? '#22c55e' : '#cbd5e1',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease',
                          flexShrink: 0
                        }}
                      >
                        <div style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          backgroundColor: '#ffffff',
                          position: 'absolute',
                          top: '3px',
                          left: item.active ? '21px' : '3px',
                          transition: 'left 0.2s ease',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                        }} />
                      </div>
                    ) : (
                      <span style={{
                        backgroundColor: '#e6f4ea',
                        color: '#1e7e34',
                        border: '1px solid #a8dab5',
                        borderRadius: '6px',
                        padding: '1px 7px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        Active
                      </span>
                    )}
                  </div>
                ))
                )}
              </div>
            </div>

            {/* Workspace Details Card */}
            <div style={{
              position: 'relative',
              borderRadius: '15px',
              overflow: 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.50)',
              padding: '15px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '190px',
              width: '65%'
            }}>
              {/* Background Image Element */}
              <img
                src={infobg}
                alt="Workspace Info Background"
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
              {/* Title */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#443c33',
                }}>
                  Workspace<br />Details
                </h2>
              </div>

              {/* Metadata Bottom */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                marginTop: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                {workspaceDetailLoading ? (
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#554e43' }}>
                    Loading...
                  </div>
                ) : workspaceDetail ? (
                  <>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#554e43', marginBottom: '2px' }}>
                      {workspaceDetail.name}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#554e43' }}>
                      Managed by: {workspaceDetail.managerName}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#554e43' }}>
                      Workspace id: {workspaceDetail.workspaceId}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#554e43' }}>
                      Created: {workspaceDetail.createdAt}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#554e43' }}>
                    No workspace data
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Bottom Row: Tasks Card (Tasks Assigned to Others / My Tasks) */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '15px',
            padding: '15px',
            display: 'flex',
            height: '300px',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px'
            }}>
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#554e43' }}>
                {isManager ? 'Tasks Assigned to Others' : 'My Tasks'}
              </h2>

              {isManager ? (
                /* Orange Add Button */
                <button
                  onClick={() => setShowAddTaskModal(true)}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <img src={addIconImg} alt="Add task" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </button>
              ) : (
                /* See all Link */
                <span style={{ fontSize: '12px', color: '#554e43', fontWeight: '500', cursor: 'pointer' }}>
                  See all &gt;
                </span>
              )}
            </div>

            {/* Fixed Table Header */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '13px'
            }}>
              <thead>
                <tr style={{ color: '#7c7c7c', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
                  <th style={{ padding: '10px 5px', fontWeight: '600', width: isManager ? '35%' : '40%' }}>Name</th>
                  <th style={{ padding: '10px 5px', fontWeight: '600', width: '25%' }}>Date</th>
                  <th style={{ padding: '10px 5px', fontWeight: '600', textAlign: 'center', width: '15%' }}>Priority</th>
                  <th style={{ padding: '10px 5px', fontWeight: '600', width: isManager ? '15%' : '20%' }}>Attachment</th>
                  {isManager && (
                    <th style={{ padding: '10px 5px', fontWeight: '600', textAlign: 'center', width: '10%' }}>Assignee</th>
                  )}
                </tr>
              </thead>
            </table>

            {/* Scrollable Table Body */}
            <div className="custom-scroll" style={{
              overflowY: 'auto',
              flex: 1
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <tbody>
                  {tasksLoading ? (
                    <tr>
                      <td colSpan={isManager ? 5 : 4} style={{ padding: '14px 5px', color: '#7c7c7c', textAlign: 'center' }}>
                        Loading...
                      </td>
                    </tr>
                  ) : tasks.length === 0 ? (
                    <tr>
                      <td colSpan={isManager ? 5 : 4} style={{ padding: '14px 5px', color: '#7c7c7c', textAlign: 'center' }}>
                        {isManager ? 'No tasks assigned yet' : 'No tasks assigned to you'}
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr
                        key={task.id}
                        style={{
                          borderBottom: '1px solid rgba(0, 0, 0, 0.04)'
                        }}
                      >
                        {/* Name */}
                        <td style={{ padding: '8px 5px', color: '#666666', fontWeight: '500', width: isManager ? '35%' : '40%' }}>
                          {task.title}
                        </td>

                        {/* Date */}
                        <td style={{ padding: '10px 5px', color: '#666666', whiteSpace: 'nowrap', width: '25%' }}>
                          {formatTaskDate(task.due_date)}
                        </td>

                        {/* Priority */}
                        <td style={{ padding: '10px 5px', textAlign: 'center', width: '15%' }}>
                          {task.priority ? (
                            <span style={getPriorityStyle(task.priority)}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          ) : null}
                        </td>

                        {/* Attachment: download link instead of filename/logo */}
                        <td style={{ padding: '10px 5px', color: '#666666', width: isManager ? '15%' : '20%' }}>
                          {task.attachment ? (
                            <a
                              href={task.attachment.image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              style={{ color: '#FE7216', fontWeight: '600', textDecoration: 'none' }}
                            >
                              Download
                            </a>
                          ) : (
                            <span style={{ color: '#b5b5b5' }}>—</span>
                          )}
                        </td>

                        {/* Assignee: name text instead of avatar (Manager View) */}
                        {isManager && (
                          <td style={{ padding: '10px 5px', textAlign: 'center', width: '10%', color: '#666666' }}>
                            {task.assigned_to || 'Unassigned'}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR MEMBER CONTAINER */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(20px)',
          borderRadius: '15px',
          padding: '15px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          width: '25%',
          height: '500px'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2px'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#554e43' }}>
              Member
            </h3>
            <span
              onClick={() => setShowManageMemberModal(true)}
              style={{ fontSize: '12px', color: '#554e43', fontWeight: '500', cursor: 'pointer' }}
            >
              {isManager ? 'Manage >' : 'View >'}
            </span>
          </div>

          {/* Subtitle */}
          <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '14px' }}>
            {membersLoading ? 'Loading...' : `${members.length} Members`}
          </div>

          {/* Members List */}
          <div className="custom-scroll"
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            {members.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px 0',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e1e1e' }}>
                  {m.name}
                </span>
                <span style={{ fontSize: '10px', color: '#7c7c7c' }}>
                  {m.joined}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Join Request Modal (Manager View) --- */}
      {showJoinModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            width: '400px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Pending Join Requests</h3>
              <button onClick={() => setShowJoinModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {joinRequestsLoading ? (
                <div style={{ fontSize: '13px', color: '#7c7c7c', textAlign: 'center', padding: '20px 0' }}>
                  Loading...
                </div>
              ) : joinRequests.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#7c7c7c', textAlign: 'center', padding: '20px 0' }}>
                  No pending join requests.
                </div>
              ) : (
                joinRequests.map((req) => (
                  <div key={req.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{req.username}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleAcceptJoinRequest(req.user_id, req.username)} style={{ backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Accept</button>
                      <button onClick={() => handleDenyJoinRequest(req.user_id, req.username)} style={{ backgroundColor: '#e5e7eb', color: '#374151', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Decline</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* --- Invite Members Info Section --- */}
            <div style={{ marginTop: '20px', padding: '14px', backgroundColor: '#FFF7ED', borderRadius: '12px', border: '1px solid #FDBA74' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700', color: '#9A3412' }}>Share to Invite Members</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Workspace ID */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#78716C', minWidth: '85px' }}>Workspace ID</span>
                  <div
                    onClick={() => {
                      const val = workspaceId || 'N/A';
                      navigator.clipboard.writeText(val);
                      toast.success('Workspace ID copied!');
                    }}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#1e1e1e', fontFamily: 'monospace' }}>{workspaceId || 'N/A'}</span>
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>📋</span>
                  </div>
                </div>
                {/* PIN Password */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#78716C', minWidth: '85px' }}>PIN Password</span>
                  <div
                    onClick={() => {
                      const val = workspaceDetail?.pin || '••••••';
                      navigator.clipboard.writeText(val);
                      toast.success('PIN copied!');
                    }}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#1e1e1e', fontFamily: 'monospace' }}>{workspaceDetail?.pin || '••••••'}</span>
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>📋</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Add Task Modal (Manager View) --- */}
      {showAddTaskModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            width: '380px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Assign New Task</h3>
              <button onClick={() => setShowAddTaskModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              setShowAddTaskModal(false);
              toast.success('New Task Assigned successfully');
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Task Name</label>
                <input required placeholder="Enter task name..." style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Description</label>
                <textarea placeholder="Enter task description..." rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', fontSize: '13px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Priority</label>
                <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc' }}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#4b5563' }}>Attachment</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  multiple
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1.5px dashed #FE7216',
                    backgroundColor: '#FFF7ED',
                    color: '#C2410C',
                    boxSizing: 'border-box',
                    fontSize: '12px',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Assignee</label>
                <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '8px', padding: '8px' }}>
                  {(members).map((m) => {
                    const isSelected = selectedAssignee?.id === m.id || selectedAssignee?.name === m.name;
                    const avatarUrl = m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=FE7216&color=fff&size=40`;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedAssignee(m)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#FFF7ED' : '#f9fafb',
                          border: isSelected ? '1.5px solid #FE7216' : '1.5px solid transparent',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <img
                          src={avatarUrl}
                          alt={m.name}
                          style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e5e7eb', flexShrink: 0 }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: isSelected ? '700' : '500', color: isSelected ? '#FE7216' : '#1e1e1e' }}>
                          {m.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowAddTaskModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#FE7216', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Request Details Modal --- */}
      {selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            width: '440px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            fontFamily: 'Satoshi, system-ui, sans-serif'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e1e1e' }}>Post Details</h3>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setShowRejectReason(false);
                  setRejectComment('');
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#7c7c7c' }}
              >
                ✕
              </button>
            </div>

            {/* Post Details Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#7c7c7c', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Post Title
                </label>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e1e1e', backgroundColor: '#f9f9f9', padding: '10px 12px', borderRadius: '10px' }}>
                  {selectedRequest.title}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#7c7c7c', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Post Content
                </label>
                <div style={{ fontSize: '13px', color: '#4b5563', backgroundColor: '#f9f9f9', padding: '10px 12px', borderRadius: '10px', lineHeight: '1.5' }}>
                  {selectedRequest.content}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#7c7c7c', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Attachment
                  </label>
                  <div style={{ fontSize: '13px', color: '#1e1e1e', backgroundColor: '#f9f9f9', padding: '8px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {selectedRequest.attachment ? (
                      <a
                        href={selectedRequest.attachment.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        style={{ color: '#FE7216', fontWeight: '600', textDecoration: 'none' }}
                      >
                        📎 {selectedRequest.attachment.filename || 'Download attachment'}
                      </a>
                    ) : (
                      <span style={{ color: '#b5b5b5' }}>No attachment</span>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#7c7c7c', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Platform
                  </label>
                  <div style={{ fontSize: '13px', backgroundColor: '#f9f9f9', padding: '8px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {selectedRequest.platforms?.includes('linkedin') && (
                      <img src={linkedinicon} alt="LinkedIn" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                    )}
                    {selectedRequest.platforms?.includes('facebook') && (
                      <img src={fbicon} alt="Facebook" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                    )}
                    <span style={{ fontSize: '12px', color: '#4b5563', textTransform: 'capitalize' }}>
                      {selectedRequest.platforms?.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {isManager && selectedRequest.submittedByAvatar && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#7c7c7c', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Submitted By
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f9f9f9', padding: '8px 12px', borderRadius: '10px' }}>
                    <img src={selectedRequest.submittedByAvatar} alt="Submitter" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e1e1e' }}>Team Member</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions / Rejection Form */}
            {isManager ? (
              !showRejectReason ? (
                /* Manager Approve / Reject Options */
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setShowRejectReason(true)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '10px',
                      border: '1px solid #ef4444',
                      backgroundColor: 'transparent',
                      color: '#ef4444',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleApprove(selectedRequest.id);
                      setSelectedRequest(null);
                    }}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#FE7216',
                      color: '#ffffff',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Approve
                  </button>
                </div>
              ) : (
                /* Reject Comment Form */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!rejectComment.trim()) {
                      toast.error('Please enter a rejection comment');
                      return;
                    }
                    handleDenyWithComment(selectedRequest.id, rejectComment);
                    setSelectedRequest(null);
                    setShowRejectReason(false);
                    setRejectComment('');
                  }}
                  style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#ef4444', marginBottom: '6px' }}>
                      Rejection Reason (Required)
                    </label>
                    <textarea
                      required
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                      placeholder="Explain why this request is being rejected..."
                      style={{
                        width: '100%',
                        height: '70px',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '1px solid #f87171',
                        fontSize: '13px',
                        fontFamily: 'Satoshi, system-ui, sans-serif',
                        boxSizing: 'border-box',
                        resize: 'none'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setShowRejectReason(false)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#f3f4f6',
                        color: '#4b5563',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </form>
              )
            ) : (
              /* Member View Actions */
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleCancelRequest(selectedRequest.id);
                    setSelectedRequest(null);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel Request
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#FE7216',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Manage Members Modal --- */}
      {showManageMemberModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            width: '440px',
            maxHeight: '520px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{isManager ? 'Manage Members' : 'Workspace Members'}</h3>
              <button onClick={() => setShowManageMemberModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            {/* Member count */}
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '12px' }}>
              {(members.length > 0 ? members.length : 0)} members
            </div>

            {/* Scrollable list */}
            <div className="custom-scroll" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(members).map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 12px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '12px',
                    gap: '12px'
                  }}
                >
                  {/* Avatar */}
                  <img
                    src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=FE7216&color=fff&size=40`}
                    alt={m.name}
                    style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #FE7216', flexShrink: 0 }}
                  />

                  {/* Name + Joined */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e1e1e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{m.joined}</div>
                  </div>

                  {/* Kick button */}
                  {isManager && (
                    <button
                      onClick={() => {
                        toast.success(`${m.name} has been removed`);
                      }}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '8px',
                        border: '1px solid #FCA5A5',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                    >
                      Kick out
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}