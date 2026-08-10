import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import bg from '../assets/MainDBbg.png';
import dbicon from '../assets/dbicon.png';
import cticon from '../assets/cticon.png';
import sicon from '../assets/sicon.png';
import disicon from '../assets/disicon.png';
import caicon from '../assets/caicon.png';
import wsicon from '../assets/wsicon.png';
import pcicon from '../assets/pcicon.png';
import pmicon from '../assets/pmicon.png';
import DBmodule from '../component/DBmodule.jsx';
import Contmodule from '../component/Contmodule.jsx';
import Stamodule from '../component/Stamodule.jsx';
import Calenmodule from '../component/Calenmodule.jsx';
import WSmodule from '../component/WSmodule.jsx';
import PMmodule from '../component/PMmodule.jsx';

export default function MainDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Error parsing user data", err);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/signin');
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread_count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notifications?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const getRelativeTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  };

  // Poll unread count every 60 seconds for business accounts
  useEffect(() => {
    if (user?.account_type !== 'business') return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch full notification list when dropdown opens
  useEffect(() => {
    if (isNotifOpen) {
      fetchNotifications();
    }
  }, [isNotifOpen]);

  const menuItems = [
    { label: 'Dashboard', roles: ['all'], icon: <img src={dbicon} style={{ width: '18px', height: '18px', objectFit: 'contain' }} /> },
    { label: 'Content', roles: ['all'], icon: <img src={cticon} style={{ width: '18px', height: '18px', objectFit: 'contain' }} /> },
    { label: 'Statistics', roles: ['all'], icon: <img src={sicon} style={{ width: '18px', height: '18px', objectFit: 'contain' }} /> },
    { label: 'Distribution', roles: ['individual', 'manager'], icon: <img src={disicon} style={{ width: '18px', height: '18px', objectFit: 'contain' }} /> },
    { label: 'Calendar', roles: ['all'], icon: <img src={caicon} style={{ width: '18px', height: '18px', objectFit: 'contain' }} /> },
    { label: 'Team Workspace', roles: ['member', 'manager'], icon: <img src={wsicon} style={{ width: '18px', height: '18px', objectFit: 'contain' }} /> },
    { label: 'Prompt & Context', roles: ['all'], icon: <img src={pcicon} style={{ width: '18px', height: '18px', objectFit: 'contain' }} /> },
    { label: 'Post Management', roles: ['all'], icon: <img src={pmicon} style={{ width: '18px', height: '18px', objectFit: 'contain' }} /> }
  ];

  const visibleMenuItems = menuItems.filter(
    (item) => item.roles.includes('all') || item.roles.includes(user?.role)
  );

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Background Image Layer */}
      <img
        src={bg}
        alt="Background"
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, objectFit: 'cover' }}
      />

      {/* Fixed Top Utility Bar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '70px', zIndex: 100,
        display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: '0px 40px', boxSizing: 'border-box', fontFamily: 'Satoshi, system-ui, sans-serif', backdropFilter: 'blur(50px)'
      }}>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e1e1e' }}>Omni Platforms</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>

          {(user?.account_type === 'business') && (
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen((prev) => !prev)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', position: 'relative', padding: '4px' }}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 0, right: -2,
                    minWidth: '18px', height: '18px', padding: '0 5px',
                    backgroundColor: '#ef4444', borderRadius: '9px',
                    color: '#fff', fontSize: '11px', fontWeight: '700',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1, boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                  }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div style={{
                  position: 'absolute',
                  top: '42px',
                  right: 0,
                  width: '340px',
                  maxHeight: '440px',
                  backgroundColor: 'rgba(255, 255, 255, 0.97)',
                  backdropFilter: 'blur(24px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                  zIndex: 300,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                }}>
                  {/* Header */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px 18px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)',
                  }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#1e1e1e' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        style={{
                          background: 'none', border: 'none', fontSize: '12px',
                          color: '#FE7216', fontWeight: '600', cursor: 'pointer',
                          fontFamily: 'Satoshi, system-ui, sans-serif',
                          padding: '4px 8px', borderRadius: '6px',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(254,114,22,0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div style={{ overflowY: 'auto', maxHeight: '370px', padding: '6px' }}>
                    {notifications.length === 0 ? (
                      <div style={{
                        padding: '40px 20px', textAlign: 'center',
                        color: '#9c9c9c', fontSize: '13px',
                      }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</div>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => { if (!notif.is_read) markAsRead(notif.id); }}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: '12px',
                            padding: '12px 14px', borderRadius: '10px',
                            cursor: notif.is_read ? 'default' : 'pointer',
                            backgroundColor: notif.is_read ? 'transparent' : 'rgba(254, 114, 22, 0.04)',
                            borderLeft: notif.is_read ? '3px solid transparent' : '3px solid #FE7216',
                            transition: 'background-color 0.15s ease',
                            marginBottom: '2px',
                          }}
                          onMouseEnter={(e) => { if (!notif.is_read) e.currentTarget.style.backgroundColor = 'rgba(254, 114, 22, 0.08)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = notif.is_read ? 'transparent' : 'rgba(254, 114, 22, 0.04)'; }}
                        >
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px',
                            backgroundColor: notif.type === 'due_soon' ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)',
                          }}>
                            {notif.type === 'due_soon' ? '⏰' : '📋'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '13px', color: '#1e1e1e', lineHeight: '1.4',
                              fontWeight: notif.is_read ? '400' : '600',
                              overflow: 'hidden', textOverflow: 'ellipsis',
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            }}>
                              {notif.message}
                            </div>
                            <div style={{ fontSize: '11px', color: '#9c9c9c', marginTop: '4px' }}>
                              {getRelativeTime(notif.created_at)}
                            </div>
                          </div>
                          {!notif.is_read && (
                            <div style={{
                              width: '8px', height: '8px', borderRadius: '50%',
                              backgroundColor: '#FE7216', flexShrink: 0, marginTop: '6px',
                            }} />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Avatar Dropdown Container */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#7c7c7c', letterSpacing: '0.5px' }}>{user?.role ? user.role.toUpperCase() : 'USER'}</div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e1e1e' }}>{user?.username || 'Account'}</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FE7216', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '16px' }}>
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={{ fontSize: '12px', color: '#7c7c7c', transition: 'transform 0.2s ease', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </div>

            {/* Dropdown Box */}
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '50px',
                right: 0,
                width: '180px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '14px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
                padding: '6px',
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setShowAccountModal(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#1e1e1e',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 4 0 0 0-4-4H8a4 4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Account Details
                </button>

                <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.06)', margin: '4px 0' }} />

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#ef4444',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Account Details Modal */}
      {showAccountModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '400px',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            fontFamily: 'Satoshi, system-ui, sans-serif',
            position: 'relative',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e1e1e' }}>Account Details</h3>
              <button
                onClick={() => setShowAccountModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  color: '#7c7c7c',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '50%'
                }}
              >
                ✕
              </button>
            </div>

            {/* Account Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FE7216 0%, #f59e0b 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '24px', fontWeight: '700'
                }}>
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e1e1e' }}>{user?.username || 'N/A'}</div>
                  <div style={{ fontSize: '13px', color: '#7c7c7c' }}>{user?.email || 'No email specified'}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#7c7c7c', fontWeight: '600', marginBottom: '4px' }}>ROLE</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#FE7216' }}>{user?.role ? user.role.toUpperCase() : 'USER'}</div>
                </div>

                <div style={{ backgroundColor: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#7c7c7c', fontWeight: '600', marginBottom: '4px' }}>ACCOUNT TYPE</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e1e1e' }}>{user?.account_type ? user.account_type.toUpperCase() : 'STANDARD'}</div>
                </div>
              </div>

              {user?.id && (
                <div style={{ backgroundColor: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#7c7c7c', fontWeight: '600', marginBottom: '4px' }}>USER ID</div>
                  <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#5c5c5c' }}>{user.id}</div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAccountModal(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#FE7216',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(254,114,22,0.3)'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Left Navigation Sidebar */}
      <aside style={{
        position: 'fixed', top: '70px', left: 0, bottom: 0, width: '260px', zIndex: 90,
        paddingLeft: '24px', paddingRight: '24px', boxSizing: 'border-box'
      }}>
        <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.08)', marginBottom: '24px', marginTop: 0 }} />

        <ul style={{
          display: 'flex', flexDirection: 'column', gap: '10px',
          fontFamily: 'Satoshi, system-ui, sans-serif', padding: 0, margin: 0, listStyle: 'none'
        }}>
          {visibleMenuItems.map((item) => {
            const isActive = activeTab === item.label;

            return (
              <li key={item.label} style={{ width: '100%' }}>
                <button
                  onClick={() => setActiveTab(item.label)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '14px',
                    width: '100%',
                    fontSize: '15px',
                    fontFamily: 'Satoshi',
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: 'none',

                    // Dynamic active styles
                    fontWeight: isActive ? '500' : '400',
                    color: isActive ? '#1e1e1e' : '#5c5c5c',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255, 255, 255, 0)',
                    border: isActive ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0)',
                    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.03)' : 'none',

                    transition: 'background-color 0.25s ease, border-color 0.25s ease, color 0.2s ease, box-shadow 0.25s ease'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Panel Window */}
      <main style={{
        marginTop: '70px', marginLeft: '260px', marginRight: '24px', marginBottom: '24px',
        minHeight: 'calc(100vh - 100px)', padding: '0px', boxSizing: 'border-box', height: '100%', overflow: 'hidden'
      }}>
        <div style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: '500', color: '#1e1e1e', width: '100%', padding: '0px' }}>
          {activeTab === 'Dashboard' ? (
            <DBmodule user={user} />
          ) : activeTab === 'Content' ? (
            <Contmodule />
          ) : activeTab === 'Statistics' ? (
            <Stamodule user={user} />
          ) : activeTab === 'Calendar' ? (
            <Calenmodule user={user} userRole={user?.role} />
          ) : activeTab === 'Team Workspace' ? (
            <WSmodule user={user} userRole={user?.role} />
          ) : activeTab === 'Post Management' ? (
            <PMmodule user={user} />
          ) : (
            <div style={{ backgroundColor: 'black', color: '#5c5c5c' }}>
              <h2 style={{ padding: '0px', margin: '0px' }}>{activeTab} Module</h2>
            </div>
          )}
        </div>

      </main>

    </div>
  );
}