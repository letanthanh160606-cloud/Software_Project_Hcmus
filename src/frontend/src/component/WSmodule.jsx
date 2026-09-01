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


export default function WSmodule({ user, userRole, openJoinRequestsTrigger }) {
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

  const [postReviews, setPostReviews] = useState([]);

  const workspaceId = user?.workspace_id || user?.workspace?.workspace_id || null;


const fetchMembers = async () => {
  setMembersLoading(true);
  try {
    const access_token = localStorage.getItem('access_token');
    if (!workspaceId) {
      setMembers([]);
      return;
    }

    const headers = { 'Content-Type': 'application/json' };
    if (access_token) headers['Authorization'] = `Bearer ${access_token}`;

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
      const access_token = localStorage.getItem('access_token');
      if (!workspaceId) {
        console.warn('WSmodule: missing workspaceId on user object, skip fetching workspace detail', user);
        setWorkspaceDetail(null);
        return;
      }

      const headers = { 'Content-Type': 'application/json' };
      if (access_token) headers['Authorization'] = `Bearer ${access_token}`;

      const res = await fetch(`http://localhost:8000/workspaces/${workspaceId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setWorkspaceDetail({
          name: data.workspace_name,
          managerName: data.manager_name,
          workspaceId: data.workspace_id,
          pin: data.pin || '',
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
      const access_token = localStorage.getItem('access_token');
      if (!workspaceId) {
        setDistributorList([]);
        return;
      }

      const headers = { 'Content-Type': 'application/json' };
      if (access_token) headers['Authorization'] = `Bearer ${access_token}`;

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
      const access_token = localStorage.getItem('access_token');
      if (!workspaceId) {
        setTasks([]);
        return;
      }

      const headers = { 'Content-Type': 'application/json' };
      if (access_token) headers['Authorization'] = `Bearer ${access_token}`;

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
  const [showAllTasksModal, setShowAllTasksModal] = useState(false);
  const [tasksSearchQuery, setTasksSearchQuery] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [showManageMemberModal, setShowManageMemberModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState(null);

  const formatTaskDate = (dateStr) => {
    if (!dateStr) return 'Ongoing';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusStyle = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'done' || s === 'completed') {
      return { color: '#16a34a', border: '1px solid #86efac', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', display: 'inline-block' };
    }
    return { color: '#2563eb', border: '1px solid #93c5fd', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', display: 'inline-block' };
  };

  const handleMarkDone = async (taskId) => {
    const access_token = localStorage.getItem('access_token');
    const headers = { 'Content-Type': 'application/json' };
    if (access_token) headers['Authorization'] = `Bearer ${access_token}`;

    setUpdatingTaskId(taskId);
    try {
      const res = await fetch(`http://localhost:8000/workspaces/${workspaceId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'done' })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to mark task as done');
      }
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: 'done' } : t));
      toast.success('Task marked as Done!');
    } catch (err) {
      toast.error(err.message || 'Error updating task status');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!isManager) {
      toast.error('Only managers have permission to delete tasks.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    const access_token = localStorage.getItem('access_token');
    const headers = {};
    if (access_token) headers['Authorization'] = `Bearer ${access_token}`;

    setDeletingTaskId(taskId);
    try {
      const res = await fetch(`http://localhost:8000/workspaces/${workspaceId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to delete task');
      }
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Error deleting task');
    } finally {
      setDeletingTaskId(null);
    }
  };

  const filteredAllTasks = tasks.filter((t) =>
    (t.title || '').toLowerCase().includes(tasksSearchQuery.toLowerCase()) ||
    (t.assigned_to || '').toLowerCase().includes(tasksSearchQuery.toLowerCase()) ||
    (t.status || '').toLowerCase().includes(tasksSearchQuery.toLowerCase())
  );

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('low');
  const [newTaskFile, setNewTaskFile] = useState(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const resetAddTaskForm = () => {
  setNewTaskTitle('');
  setNewTaskContent('');
  setNewTaskPriority('low');
  setNewTaskDueDate('');
  setNewTaskFile(null);
  setSelectedAssignee(null);
  };

  const handleCreateTask = async (e) => {
  e.preventDefault();
  if (isCreatingTask) return;
  if (!selectedAssignee) {
    toast.error('Please select an assignee');
    return;
  }
  setIsCreatingTask(true);
  try {
    const access_token = localStorage.getItem('access_token');
    const headers = { 'Content-Type': 'application/json' };
    if (access_token) headers['Authorization'] = `Bearer ${access_token}`;

    const payload = {
      title: newTaskTitle,
      content: newTaskContent,
      priority: newTaskPriority,
      assigned_to: selectedAssignee.id,
      file_name: newTaskFile ? newTaskFile.name : null,
      content_type: newTaskFile ? newTaskFile.type : null,
      due_date: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : null,
    };

    const res = await fetch(`http://localhost:8000/workspaces/${workspaceId}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create task');
    }

    const data = await res.json();

    if (newTaskFile && data.upload_url) {
      const uploadRes = await fetch(data.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': newTaskFile.type },
        body: newTaskFile,
      });
      if (!uploadRes.ok) {
        toast.error('Task created but file upload failed');
      }
    }

    toast.success('New Task Assigned successfully');
    setShowAddTaskModal(false);
    resetAddTaskForm();
    fetchTasks();
  } catch (err) {
    toast.error(err.message || 'Failed to create task');
  } finally {
    setIsCreatingTask(false);
  }
  };


  const [joinRequests, setJoinRequests] = useState([]);
  const [joinRequestsLoading, setJoinRequestsLoading] = useState(false);

  const fetchJoinRequests = async () => {
    if (!workspaceId) {
      setJoinRequests([]);
      return;
    }
    setJoinRequestsLoading(true);
    try {
      const access_token = localStorage.getItem('access_token');
      const headers = { 'Content-Type': 'application/json' };
      if (access_token) headers['Authorization'] = `Bearer ${access_token}`;

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

  useEffect(() => {
    if (isManager && workspaceId) {
      fetchJoinRequests();
    }
  }, [isManager, workspaceId]);

  useEffect(() => {
    if (openJoinRequestsTrigger) {
      setShowJoinModal(true);
      fetchJoinRequests();
    }
  }, [openJoinRequestsTrigger]);

  useEffect(() => {
    if (showJoinModal) {
      fetchJoinRequests();
    }
  }, [showJoinModal, workspaceId]);

  const fetchPostReviews = async (postId) => {
  try {
    const access_token = localStorage.getItem('access_token');
    const headers = { 'Content-Type': 'application/json' };
    if (access_token) headers['Authorization'] = `Bearer ${access_token}`;

    const res = await fetch(`http://localhost:8000/workspaces/${workspaceId}/posts/${postId}/reviews`, { headers });
    if (res.ok) {
      setPostReviews(await res.json());
    } else {
      setPostReviews([]);
    }
  } catch (err) {
    console.error('Failed to fetch post reviews:', err);
    setPostReviews([]);
  }
};



  const handleAcceptJoinRequest = async (userId, username) => {
    try {
      const access_token = localStorage.getItem('access_token');
      const headers = { 'Content-Type': 'application/json' };
      if (access_token) headers['Authorization'] = `Bearer ${access_token}`;

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
      const access_token = localStorage.getItem('access_token');
      const headers = { 'Content-Type': 'application/json' };
      if (access_token) headers['Authorization'] = `Bearer ${access_token}`;

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
      const access_token = localStorage.getItem('access_token');
      const headers = { 'Content-Type': 'application/json' };
      if (access_token) headers['Authorization'] = `Bearer ${access_token}`;

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
    const access_token = localStorage.getItem('access_token');
    if (!workspaceId) {
      setApprovalRequests([]);
      return;
    }
    const headers = { 'Content-Type': 'application/json' };
    if (access_token) headers['Authorization'] = `Bearer ${access_token}`;

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
  const access_token = localStorage.getItem('access_token');
  const headers = { 'Content-Type': 'application/json' };
  if (access_token) headers['Authorization'] = `Bearer ${access_token}`;

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
    const access_token = localStorage.getItem('access_token');
    const headers = { 'Content-Type': 'application/json' };
    if (access_token) headers['Authorization'] = `Bearer ${access_token}`;
    const res = await fetch(
      `http://localhost:8000/workspaces/${workspaceId}/posts/${id}/reviews?comment=${encodeURIComponent(comment)}`,
      { method: 'POST', headers }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to save rejection reason');
    }
    setApprovalRequests(prev => prev.filter(r => r.id !== id));
    toast.error(`Request Rejected: "${comment}"`);
  } catch (err) { toast.error(err.message); }
};

const handleCancelRequest = async (id) => {
  try {
    await patchPost(id, { status: 'cancel' }); 
    setApprovalRequests(prev => prev.filter(r => r.id !== id));
    toast('Request Cancelled', { icon: 'ℹ️' });
  } catch (err) { toast.error(err.message); }
};

  const handleViewRequest = (req) => {
    setSelectedRequest(req);
    setShowRejectReason(false);
    setRejectComment('');
    fetchPostReviews(req.id);
  };

  const handleKickMember = async (userId, username) => {
  try {
    const access_token = localStorage.getItem('access_token');
    const headers = { 'Content-Type': 'application/json' };
    if (access_token) headers['Authorization'] = `Bearer ${access_token}`;

    const res = await fetch(
      `http://localhost:8000/workspaces/${workspaceId}/members/${userId}`,
      { method: 'DELETE', headers }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.detail || 'Failed to remove member');
      return;
    }

    setMembers(prev => prev.filter(m => m.id !== userId));
    toast.success(`${username} has been removed`);
  } catch (err) {
    console.error('Failed to remove member:', err);
    toast.error('Network error while removing member');
  }
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
              <div style={{ position: 'relative' }}>
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
                {joinRequests.length > 0 && (
                  <span
                    onClick={() => setShowJoinModal(true)}
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      minWidth: '17px',
                      height: '17px',
                      backgroundColor: '#EF4444',
                      color: '#fff',
                      borderRadius: '9px',
                      fontSize: '10px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                      border: '2px solid #fff',
                      boxShadow: '0 2px 5px rgba(239,68,68,0.4)',
                      cursor: 'pointer',
                      zIndex: 3
                    }}
                  >
                    {joinRequests.length}
                  </span>
                )}
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
              fontSize: '13px',
              tableLayout: 'fixed'
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
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', tableLayout: 'fixed' }}>
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
                      <td style={{ padding: '8px 5px', color: '#666666', fontWeight: '500', width: '30%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.title}>
                        {req.title}
                      </td>

                      {isManager ? (
                        <td style={{ padding: '10px 5px', color: '#666666', width: '27%', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={members.find(m => m.id === req.authorId)?.name || 'Member'}>
                          {members.find(m => m.id === req.authorId)?.name || 'Member'}
                        </td>
                      ) : (
                        <td style={{ padding: '10px 5px', color: '#7c7c7c', width: '27%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.content}>
                          {req.content || '—'}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  onClick={() => setShowAllTasksModal(true)}
                  style={{ fontSize: '12px', color: '#FE7216', fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.75'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  See all &gt;
                </span>

                {isManager && (
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
                )}
              </div>
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
                  <th style={{ padding: '10px 5px', fontWeight: '600', width: '28%' }}>Name</th>
                  <th style={{ padding: '10px 5px', fontWeight: '600', width: '18%' }}>Date</th>
                  <th style={{ padding: '10px 5px', fontWeight: '600', textAlign: 'center', width: '14%' }}>Status</th>
                  <th style={{ padding: '10px 5px', fontWeight: '600', textAlign: 'center', width: '14%' }}>Priority</th>
                  <th style={{ padding: '10px 5px', fontWeight: '600', width: '14%' }}>Attachment</th>
                  <th style={{ padding: '10px 5px', fontWeight: '600', textAlign: 'center', width: '12%' }}>
                    {isManager ? 'Assignee' : 'Action'}
                  </th>
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
                      <td colSpan={6} style={{ padding: '14px 5px', color: '#7c7c7c', textAlign: 'center' }}>
                        Loading...
                      </td>
                    </tr>
                  ) : tasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '14px 5px', color: '#7c7c7c', textAlign: 'center' }}>
                        {isManager ? 'No tasks assigned yet' : 'No tasks assigned to you'}
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => {
                      const isTaskDone = (task.status || '').toLowerCase() === 'done' || (task.status || '').toLowerCase() === 'completed';
                      return (
                        <tr
                          key={task.id}
                          style={{
                            borderBottom: '1px solid rgba(0, 0, 0, 0.04)'
                          }}
                        >
                          {/* Name */}
                          <td style={{ padding: '8px 5px', color: '#666666', fontWeight: '500', width: '28%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <span title={task.title}>{task.title}</span>
                          </td>

                          {/* Date */}
                          <td style={{ padding: '10px 5px', color: '#666666', whiteSpace: 'nowrap', width: '18%' }}>
                            {formatTaskDate(task.due_date)}
                          </td>

                          {/* Status */}
                          <td style={{ padding: '10px 5px', textAlign: 'center', width: '14%' }}>
                            <span style={getStatusStyle(task.status)}>
                              {isTaskDone ? 'Done' : 'Doing'}
                            </span>
                          </td>

                          {/* Priority */}
                          <td style={{ padding: '10px 5px', textAlign: 'center', width: '14%' }}>
                            {task.priority ? (
                              <span style={getPriorityStyle(task.priority)}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                            ) : null}
                          </td>

                          {/* Attachment */}
                          <td style={{ padding: '10px 5px', color: '#666666', width: '14%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {task.attachment ? (
                              <a
                                href={task.attachment.image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={task.attachment.image_url.split('/').pop()}
                                style={{ color: '#FE7216', fontWeight: '600', textDecoration: 'none' }}
                              >
                                Download ↗
                              </a>
                            ) : (
                              <span style={{ color: '#b5b5b5' }}>—</span>
                            )}
                          </td>

                          {/* Assignee (Manager) or Action Done button (Member) */}
                          <td style={{ padding: '10px 5px', textAlign: 'center', width: '12%' }}>
                            {isManager ? (
                              <span style={{ color: '#666666', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {task.assigned_to || 'Unassigned'}
                              </span>
                            ) : (
                              isTaskDone ? (
                                <span style={{
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  color: '#16a34a',
                                  backgroundColor: '#f0fdf4',
                                  border: '1px solid #bbf7d0',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px'
                                }}>
                                  ✓ Done
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleMarkDone(task.id)}
                                  disabled={updatingTaskId === task.id}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid #86efac',
                                    backgroundColor: '#f0fdf4',
                                    color: '#16a34a',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    cursor: updatingTaskId === task.id ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#16a34a'; e.currentTarget.style.color = '#ffffff'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; e.currentTarget.style.color = '#16a34a'; }}
                                >
                                  {updatingTaskId === task.id ? '...' : '✓ Done'}
                                </button>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isManager && joinRequests.length > 0 && (
                <span
                  onClick={() => setShowJoinModal(true)}
                  style={{
                    fontSize: '11px',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    border: '1px solid #FCA5A5',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Click to review join requests"
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EF4444' }}></span>
                  {joinRequests.length} Pending
                </span>
              )}
              <span
                onClick={() => setShowManageMemberModal(true)}
                style={{ fontSize: '12px', color: '#554e43', fontWeight: '500', cursor: 'pointer' }}
              >
                {isManager ? 'Manage >' : 'View >'}
              </span>
            </div>
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
                      const val = workspaceDetail?.pin || '';
                      if (val) {
                        navigator.clipboard.writeText(val);
                        toast.success('PIN copied!');
                      }
                    }}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#FE7216', fontFamily: 'monospace', letterSpacing: '1px' }}>
                      {workspaceDetail?.pin || 'N/A'}
                    </span>
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
            <form onSubmit={handleCreateTask}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Task Name</label>
                <input required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder='Enter task name...'
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Description</label>
                <textarea
                value={newTaskContent}
                onChange={(e) => setNewTaskContent(e.target.value)}
                rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', fontSize: '13px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Priority</label>
                <select 
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc' }}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Due Date</label>
                <input
                  type="datetime-local"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#4b5563' }}>Attachment</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e)=>setNewTaskFile(e.target.files[0] || null)}
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
                <button type="button" onClick={() => { setShowAddTaskModal(false); resetAddTaskForm(); }} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isCreatingTask} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#FE7216', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                  {isCreatingTask ? 'Assigning...' : 'Assign'}
                </button>
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

            {/* Member count & Pending notice */}
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '12px' }}>
              {(members.length > 0 ? members.length : 0)} active members
            </div>

            {/* Pending Requests Banner inside Manage Members modal */}
            {isManager && joinRequests.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#FFF7ED',
                border: '1px solid #FDBA74',
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '14px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#9A3412' }}>
                  🔔 {joinRequests.length} pending join {joinRequests.length === 1 ? 'request' : 'requests'} awaiting approval
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowManageMemberModal(false);
                    setShowJoinModal(true);
                  }}
                  style={{
                    backgroundColor: '#FE7216',
                    color: '#fff',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Review
                </button>
              </div>
            )}

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
                        handleKickMember(m.id, m.name);
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

      {/* --- See All Tasks Modal --- */}
      {showAllTasksModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          fontFamily: 'Satoshi, system-ui, sans-serif'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            width: '92%',
            maxWidth: '880px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                  {isManager ? 'Tasks Assigned to Others' : 'My Tasks'}
                </h3>
                <span style={{
                  backgroundColor: '#fff7ed',
                  color: '#ea580c',
                  border: '1px solid #ffedd5',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  {tasks.length} tasks
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAllTasksModal(false)}
                style={{
                  border: 'none',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  fontSize: '16px',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Search filter */}
            <div style={{ padding: '14px 24px', borderBottom: '1px solid #f8fafc', backgroundColor: '#fafafa' }}>
              <input
                type="text"
                placeholder="Search tasks by title, status (Doing/Done), or assignee..."
                value={tasksSearchQuery}
                onChange={(e) => setTasksSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            {/* Modal Body: Task Table */}
            <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ width: '24%', padding: '14px 8px', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Task Name</th>
                    <th style={{ width: '16%', padding: '14px 8px', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Due Date</th>
                    <th style={{ width: '12%', padding: '14px 8px', fontWeight: '700', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                    <th style={{ width: '12%', padding: '14px 8px', fontWeight: '700', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Priority</th>
                    <th style={{ width: '14%', padding: '14px 8px', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Attachment</th>
                    <th style={{ width: '12%', padding: '14px 8px', fontWeight: '700', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Assignee</th>
                    <th style={{ width: '10%', padding: '14px 8px', fontWeight: '700', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAllTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8', fontSize: '13px' }}>
                        No matching tasks found.
                      </td>
                    </tr>
                  ) : (
                    filteredAllTasks.map((task) => {
                      const isTaskDone = (task.status || '').toLowerCase() === 'done' || (task.status || '').toLowerCase() === 'completed';
                      return (
                        <tr key={task.id} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '13px' }}>
                          <td style={{ padding: '12px 8px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <span title={task.title}>{task.title}</span>
                          </td>
                          <td style={{ padding: '12px 8px', color: '#64748b', whiteSpace: 'nowrap' }}>
                            {formatTaskDate(task.due_date)}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <span style={getStatusStyle(task.status)}>
                              {isTaskDone ? 'Done' : 'Doing'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <span style={getPriorityStyle(task.priority)}>
                              {task.priority ? (task.priority.charAt(0).toUpperCase() + task.priority.slice(1)) : 'Medium'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {task.attachment ? (
                              <a
                                href={task.attachment.image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={task.attachment.image_url.split('/').pop()}
                                style={{ color: '#FE7216', textDecoration: 'none', fontWeight: '600' }}
                              >
                                📎 Download ↗
                              </a>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>None</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: '500', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {task.assigned_to || 'Unassigned'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            {isManager ? (
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id)}
                                disabled={deletingTaskId === task.id}
                                title="Delete Task"
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '8px',
                                  border: '1px solid #fecaca',
                                  backgroundColor: '#fef2f2',
                                  color: '#dc2626',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: deletingTaskId === task.id ? 'not-allowed' : 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; e.currentTarget.style.color = '#ffffff'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                              >
                                {deletingTaskId === task.id ? '...' : '🗑 Delete'}
                              </button>
                            ) : (
                              isTaskDone ? (
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  color: '#16a34a',
                                  backgroundColor: '#f0fdf4',
                                  border: '1px solid #bbf7d0',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px'
                                }}>
                                  ✓ Done
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleMarkDone(task.id)}
                                  disabled={updatingTaskId === task.id}
                                  title="Mark Task as Done"
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #86efac',
                                    backgroundColor: '#f0fdf4',
                                    color: '#16a34a',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: updatingTaskId === task.id ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#16a34a'; e.currentTarget.style.color = '#ffffff'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; e.currentTarget.style.color = '#16a34a'; }}
                                >
                                  {updatingTaskId === task.id ? '...' : '✓ Done'}
                                </button>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: '#fafafa'
            }}>
              <button
                type="button"
                onClick={() => setShowAllTasksModal(false)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}