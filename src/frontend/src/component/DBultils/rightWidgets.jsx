import React, { useState, useEffect } from 'react';
import fbicon from '../../assets/fblg.png';
import linkedinicon from '../../assets/linkedinlg.png';
import AddIcon from '../../assets/AddButton.png'

const AddButton = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      padding: '0px',
      outline: 'none',
      transition: 'background-color 0.2s, transform 0.1s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px) scale(1.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0px) scale(1)';
    }}
  >
    <img
      src={AddIcon}
      alt="Add"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        pointerEvents: 'none'
      }}
    />
  </button>
);

// 1. Approval Requests Widget (For Business: Manager / Member)
export function ApprovalRequests({ user, onNavigateTab }) {
  const isIndividual = user?.account_type === 'individual' || user?.role === 'individual';
  if (isIndividual) return null;

  const [requests, setRequests] = useState([]);
  const isMember = user?.role === 'member';

  const widgetTitle = isMember ? 'Pending Approvals' : 'Approval Requests';
  const actionLabel = 'View request';
  const emptyMessage = isMember ? 'No posts pending approval.' : 'No pending approval requests.';

  useEffect(() => {
    const fetchPendingPosts = async () => {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        const workspaceId = user?.workspace_id || user?.workspace?.workspace_uuid || null;
        let url = 'http://localhost:8000/posts';
        if (workspaceId && !isIndividual) url = `http://localhost:8000/workspaces/${workspaceId}/posts`;

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          const filtered = list.filter(p => p.status === 'pending_review');
          setRequests(filtered.slice(0, 5).map(p => ({
            id: p.id,
            title: p.title || 'Untitled Post',
          })));
        }
      } catch (err) {
        console.error('Error fetching pending posts:', err);
      }
    };
    fetchPendingPosts();
  }, [user, isIndividual, isMember]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      fontFamily: 'Satoshi, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#554E43' }}>
          {widgetTitle}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AddButton onClick={() => onNavigateTab && onNavigateTab(isIndividual ? 'Content' : 'Post Management')} />
        </div>
      </div>

      {/* Requests List */}
      <div 
        className="custom-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '4px',
          minHeight: '0px'
      }}>
        {requests.length > 0 ? (
          requests.map((req) => (
            <div
              key={req.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(254, 254, 254, 0.5)',
                height: '25px',
                borderRadius: '8px',
                padding: '10px 12px',
                marginBottom: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
            >
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#554E43',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '180px'
              }}>
                {req.title}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#FE7216',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  whiteSpace: 'nowrap',
                  marginLeft: '8px'
                }}
                onClick={() => onNavigateTab && onNavigateTab(isIndividual ? 'Content' : 'Post Management')}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                {actionLabel}
              </span>
            </div>
          ))
        ) : (
          <div style={{ padding: '30px 0', textAlign: 'center', color: '#7E7A72', fontSize: '12px', fontWeight: '500' }}>
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}

// 2. My Calendar Widget
export function MyCalendar({ user, onNavigateTab }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchRealEvents = async () => {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        const workspaceId = user?.workspace_id || user?.workspace?.workspace_uuid || null;
        if (!workspaceId) return;

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`http://localhost:8000/workspaces/${workspaceId}/tasks`, { headers });
        if (res.ok) {
          const data = await res.json();
          const colorMap = { high: '#E74C3C', medium: '#3498DB', low: '#2ECC71' };
          const list = (Array.isArray(data) ? data : []).map(t => ({
            id: t.id,
            title: t.title || 'Untitled Task',
            date: t.due_date ? new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Ongoing',
            color: colorMap[t.priority?.toLowerCase()] || '#FE7216',
          }));
          setEvents(list);
        }
      } catch (err) {
        console.error('Error fetching calendar events:', err);
      }
    };
    fetchRealEvents();
  }, [user]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      fontFamily: 'Satoshi, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#554E43' }}>
          My Calendar
        </h2>
        <AddButton onClick={() => onNavigateTab && onNavigateTab('Calendar')} />
      </div>

      {/* Events Scroll Container */}
      <div
        className="custom-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '4px',
          minHeight: 0
        }}
      >
        {events.length > 0 ? (
          events.map((event) => (
            <div
              key={event.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '8px',
                padding: '10px 12px',
                marginBottom: '8px',
                position: 'relative',
                overflow: 'hidden',
                height: '25px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                backgroundColor: event.color
              }} />
              <span style={{
                fontSize: '13px',
                color: '#554E43',
                fontWeight: '500',
                marginLeft: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '160px'
              }}>
                {event.title}
              </span>
              <span style={{
                fontSize: '12px',
                color: '#7E7A72',
                marginLeft: 'auto',
                whiteSpace: 'nowrap'
              }}>
                {event.date}
              </span>
            </div>
          ))
        ) : (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#7E7A72', fontSize: '12px', fontWeight: '500' }}>
            No calendar tasks scheduled.
          </div>
        )}
      </div>
    </div>
  );
}

// 3. Channel Widget
export function ChannelList({ user, onNavigateTab }) {
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const fetchRealChannels = async () => {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        const workspaceId = user?.workspace_id || user?.workspace?.workspace_uuid || null;
        let url = 'http://localhost:8000/api/v1/distribution/channels';
        if (workspaceId) url += `?workspace_id=${workspaceId}`;

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          const channelList = (data.channels || []).map(c => ({
            id: c.id,
            platform: c.platform.charAt(0).toUpperCase() + c.platform.slice(1),
            name: c.display_name || 'Social Channel',
            status: c.status === 'active' ? 'Active' : 'Inactive',
          }));
          setChannels(channelList);
        }
      } catch (err) {
        console.error('Error fetching dashboard channels:', err);
      }
    };
    fetchRealChannels();
  }, [user]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      fontFamily: 'Satoshi, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#554E43' }}>
          Channel
        </h2>
        <AddButton onClick={() => onNavigateTab && onNavigateTab('Distribution')} />
      </div>

      {/* Channels Scroll Container */}
      <div
        className="custom-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '4px',
          minHeight: 0
        }}
      >
        {channels.map((chan) => (
          <div
            key={chan.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(254, 254, 254, 0.5)',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                <img
                  src={chan.platform?.toLowerCase() === 'linkedin' ? linkedinicon : fbicon}
                  alt={chan.platform}
                  style={{ width: '12px', height: '12px', objectFit: 'contain' }}
                />
                <span style={{ fontSize: '11px', color: '#7E7A72', fontWeight: '500' }}>
                  {chan.platform}
                </span>
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#554E43',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '150px'
              }}>
                {chan.name}
              </span>
            </div>
            
            {/* Status Badge */}
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: '6px',
              textTransform: 'capitalize',
              backgroundColor: chan.status === 'Active' ? '#EAFAF1' : '#FDEDEC',
              color: chan.status === 'Active' ? '#2ECC71' : '#E74C3C'
            }}>
              {chan.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
