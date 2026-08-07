import React, { useState } from 'react';
import toast from 'react-hot-toast';
import fbicon from '../assets/fblg.png';
import linkedinicon from '../assets/linkedinlg.png';
import addIconImg from '../assets/AddButton.png';
import addMember from '../assets/addmember.png';
import infobg from '../assets/WSinfobg.png';

export default function WSmodule({ user }) {
  const isManager = user?.role === 'manager';

  const [approvalRequests, setApprovalRequests] = useState([
    {
      id: 1,
      title: '[SE - PA00] Project Proposal',
      submittedByAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      content: 'Introduction to Archi...',
      attachment: 'Architecture.png',
      platforms: ['linkedin', 'facebook']
    },
    {
      id: 2,
      title: '[BA - TA11] Introduction to Microeco...',
      submittedByAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      content: 'Introduction to Archi...',
      attachment: 'Architecture.png',
      platforms: ['facebook']
    },
    {
      id: 3,
      title: '[SE - PA00] Project Proposal',
      submittedByAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      content: 'Introduction to Archi...',
      attachment: 'Architecture.png',
      platforms: ['facebook']
    },
    {
      id: 4,
      title: '[BA - TA11] Introduction to Microeco...',
      submittedByAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      content: 'Introduction to Archi...',
      attachment: 'Architecture.png',
      platforms: ['linkedin', 'facebook']
    },
    {
      id: 5,
      title: '[SE - PA00] Project Proposal',
      submittedByAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      content: 'Introduction to Archi...',
      attachment: 'Architecture.png',
      platforms: ['linkedin']
    },
    {
      id: 6,
      title: '[SE - PA00] Project Proposal',
      submittedByAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      content: 'Introduction to Archi...',
      attachment: 'Architecture.png',
      platforms: ['linkedin']
    },
    {
      id: 7,
      title: '[SE - PA00] Project Proposal',
      submittedByAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      content: 'Introduction to Archi...',
      attachment: 'Architecture.png',
      platforms: ['linkedin']
    },
    {
      id: 8,
      title: '[SE - PA00] Project Proposal',
      submittedByAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      content: 'Introduction to Archi...',
      attachment: 'Architecture.png',
      platforms: ['linkedin']
    }
  ]);

  const [distributorList, setDistributorList] = useState([
    { id: 1, platform: 'Facebook', name: 'The Discreet Coven', icon: fbicon, active: true },
    { id: 2, platform: 'Facebook', name: 'The Discreet Coven', icon: fbicon, active: true },
    { id: 3, platform: 'Facebook', name: 'The Discreet Coven', icon: fbicon, active: true },
    { id: 4, platform: 'Facebook', name: 'The Discreet Coven', icon: fbicon, active: false },
    { id: 5, platform: 'Facebook', name: 'The Discreet Coven', icon: fbicon, active: false },
    { id: 6, platform: 'Facebook', name: 'The Discreet Coven', icon: fbicon, active: false },
    { id: 7, platform: 'Facebook', name: 'The Discreet Coven', icon: fbicon, active: false },
    { id: 8, platform: 'Facebook', name: 'The Discreet Coven', icon: fbicon, active: false },
    { id: 9, platform: 'Facebook', name: 'The Discreet Coven', icon: fbicon, active: false }
  ]);

  const [tasks] = useState([
    {
      id: 1,
      name: isManager
        ? '[SE - PA00] Instructions on how to...'
        : '[SE - PA00] Instructions on how to crea...',
      date: 'May 18, 2026 - May 19, 2026',
      priority: 'Low',
      attachment: 'Architecture.png',
      assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      platform: null
    },
    {
      id: 2,
      name: isManager
        ? '[SE - PA00] Instructions on how to...'
        : '[SE - PA00] Instructions on how to crea...',
      date: 'May 18, 2026 - May 19, 2026',
      priority: 'Medium',
      attachment: 'Architecture.png',
      assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      platform: null
    },
    {
      id: 3,
      name: isManager
        ? '[SE - PA00] Instructions on how to...'
        : '[SE - PA00] Instructions on how to crea...',
      date: 'May 18, 2026 - May 19, 2026',
      priority: 'Medium',
      attachment: 'Architecture.png',
      assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      platform: null
    },
    {
      id: 4,
      name: isManager
        ? '[SE - PA00] Instructions on how to...'
        : '[SE - PA00] Instructions on how to crea...',
      date: 'May 18, 2026 - May 19, 2026',
      priority: 'High',
      attachment: 'Architecture.png',
      assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      platform: null
    },
    {
      id: 5,
      name: isManager
        ? '[SE - PA00] Instructions on how to...'
        : 'Here is the step-by-step framework that actu...',
      date: isManager ? 'May 18, 2026 - May 19, 2026' : 'Monday, May 18, 2025',
      priority: isManager ? 'High' : null,
      attachment: 'Architecture.png',
      assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      platform: isManager ? null : 'linkedin'
    }
  ]);

  const members = [
    { id: 1, name: 'Draco Malfoy', joined: 'Joined 14 June 2025' },
    { id: 2, name: 'Fenrir Greyback', joined: 'Joined 14 June 2025' },
    { id: 3, name: 'Fenrir Greyback', joined: 'Joined 14 June 2025' },
    { id: 4, name: 'Fenrir Greyback', joined: 'Joined 14 June 2025' },
    { id: 5, name: 'Fenrir Greyback', joined: 'Joined 14 June 2025' },
    { id: 6, name: 'Fenrir Greyback', joined: 'Joined 14 June 2025' },
    { id: 7, name: 'Fenrir Greyback', joined: 'Joined 14 June 2025' },
    { id: 8, name: 'Fenrir Greyback', joined: 'Joined 14 June 2025' },
    { id: 9, name: 'Fenrir Greyback', joined: 'Joined 14 June 2025' },
    { id: 10, name: 'Fenrir Greyback', joined: 'Joined 14 June 2025' }
  ];

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectComment, setRejectComment] = useState('');

  const handleToggleDistributor = (id) => {
    const target = distributorList.find(item => item.id === id);
    if (!target) return;
    const nextActive = !target.active;

    setDistributorList(prev =>
      prev.map(item =>
        item.id === id ? { ...item, active: nextActive } : item
      )
    );

    toast(nextActive ? 'Distributor activated' : 'Distributor deactivated', {
      icon: nextActive ? '✅' : '⏸️'
    });
  };

  const handleApprove = (id) => {
    setApprovalRequests(prev => prev.filter(r => r.id !== id));
    toast.success('Request Approved successfully');
  };

  const handleDeny = (id) => {
    setApprovalRequests(prev => prev.filter(r => r.id !== id));
    toast.error('Request Denied');
  };

  const handleDenyWithComment = (id, comment) => {
    setApprovalRequests(prev => prev.filter(r => r.id !== id));
    toast.error(`Request Rejected: "${comment}"`);
  };

  const handleCancelRequest = (id) => {
    setApprovalRequests(prev => prev.filter(r => r.id !== id));
    toast('Request Cancelled', { icon: 'ℹ️' });
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
      width: '100%',
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
          width: '70%',
          boxSizing: 'border-box'
        }}>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h1 style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: '700',
              color: '#443e36',
              letterSpacing: '-0.2px'
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
                    fontSize: '12px',
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
                    width: '18px',
                    height: '18px',
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
                  <th style={{ padding: '10px 5px', fontWeight: '600', width: '28%' }}>Task title</th>
                  {isManager ? (
                    <th style={{ padding: '10px 5px', fontWeight: '600', textAlign: 'center', width: '25%' }}>Submitted by</th>
                  ) : (
                    <th style={{ padding: '10px 5px', fontWeight: '600', width: '25%' }}>Content</th>
                  )}
                  <th style={{ padding: '10px 5px', fontWeight: '600', width: '18%' }}>Attachment</th>
                  <th style={{ padding: '10px 5px', fontWeight: '600', textAlign: 'center', width: '12%' }}>Platform</th>
                  <th style={{ padding: '10px 5px', fontWeight: '600', textAlign: 'center', width: '20%' }}></th>
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
                  {approvalRequests.map((req) => (
                    <tr
                      key={req.id}
                      style={{
                        borderBottom: '1px solid rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      <td style={{ padding: '8px 5px', color: '#666666', fontWeight: '500', width: '28%' }}>
                        {req.title}
                      </td>

                      {isManager ? (
                        <td style={{ padding: '10px 5px', textAlign: 'center', width: '25%' }}>
                          <img
                            src={req.submittedByAvatar}
                            alt="Submitter"
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              display: 'inline-block',
                              verticalAlign: 'middle'
                            }}
                          />
                        </td>
                      ) : (
                        <td style={{ padding: '10px', color: '#7c7c7c', width: '25%' }}>
                          {req.content}
                        </td>
                      )}

                      <td style={{ padding: '10px', color: '#666666', width: '18%' }}>
                        {req.attachment}
                      </td>

                      <td style={{ padding: '10px', textAlign: 'center', width: '12%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          {req.platforms.includes('linkedin') && (
                            <img src={linkedinicon} alt="LinkedIn" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                          )}
                          {req.platforms.includes('facebook') && (
                            <img src={fbicon} alt="Facebook" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '10px 0 10px 12px', textAlign: 'right', whiteSpace: 'nowrap', width: '20%' }}>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Middle Row Grid  */}
          <div style={{
            display: 'grid',
            width: '100%',
            gap: '24px',
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
                {distributorList.map((item) => (
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
                ))}
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
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#554e43', marginBottom: '2px' }}>
                  Marketing Dept.
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#554e43' }}>
                  Managed by: Harry Potter
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#554e43' }}>
                  Workspace id: 46345346
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#554e43' }}>
                  Created: 8 February 2024
                </div>
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
                  {tasks.map((task) => (
                    <tr
                      key={task.id}
                      style={{
                        borderBottom: '1px solid rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      {/* Name */}
                      <td style={{ padding: '8px 5px', color: '#666666', fontWeight: '500', width: isManager ? '35%' : '40%' }}>
                        {task.name}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '10px 5px', color: '#666666', whiteSpace: 'nowrap', width: '25%' }}>
                        {task.date}
                      </td>

                      {/* Priority */}
                      <td style={{ padding: '10px 5px', textAlign: 'center', width: '15%' }}>
                        {task.priority ? (
                          <span style={getPriorityStyle(task.priority)}>
                            {task.priority}
                          </span>
                        ) : null}
                      </td>

                      {/* Attachment */}
                      <td style={{ padding: '10px 5px', color: '#666666', width: isManager ? '15%' : '20%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{task.attachment}</span>
                          {!isManager && task.platform === 'linkedin' && (
                            <img src={linkedinicon} alt="LinkedIn" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                          )}
                        </div>
                      </td>

                      {/* Assignee Avatar (Manager View) */}
                      {isManager && (
                        <td style={{ padding: '10px 5px', textAlign: 'center', width: '10%' }}>
                          <img
                            src={task.assigneeAvatar}
                            alt="Assignee"
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              display: 'inline-block',
                              verticalAlign: 'middle'
                            }}
                          />
                        </td>
                      )}
                    </tr>
                  ))}
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
          width: '24%',
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
            <span style={{ fontSize: '12px', color: '#554e43', fontWeight: '500', cursor: 'pointer' }}>
              {isManager ? 'Manage >' : 'View >'}
            </span>
          </div>

          {/* Subtitle */}
          <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '14px' }}>
            45 Members
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
              {['Nymphadora Tonks', 'Remus Lupin', 'Sirius Black'].map((name, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{name}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setShowJoinModal(false); toast.success(`Accepted ${name}`); }} style={{ backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Accept</button>
                    <button onClick={() => { setShowJoinModal(false); toast.error(`Declined ${name}`); }} style={{ backgroundColor: '#e5e7eb', color: '#374151', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Decline</button>
                  </div>
                </div>
              ))}
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
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Priority</label>
                <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc' }}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
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
                    📎 {selectedRequest.attachment}
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
    </div>
  );
}
