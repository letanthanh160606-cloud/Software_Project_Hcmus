import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import facebookIcon from '../assets/fblg.png';
import linkedinIcon from '../assets/linkedinlg.png';

function EnableToggle({ enabled, onToggle, disabled = false }) {
  return (
    <div
      onClick={() => {
        if (!disabled && onToggle) onToggle();
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {/* Toggle Track */}
      <div
        style={{
          width: '38px',
          height: '20px',
          borderRadius: '10px',
          backgroundColor: enabled ? '#22c55e' : '#cbd5e1',
          position: 'relative',
          transition: 'background-color 0.25s ease',
          flexShrink: 0,
        }}
      >
        {/* Toggle Thumb */}
        <div
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            position: 'absolute',
            top: '3px',
            left: enabled ? '21px' : '3px',
            transition: 'left 0.25s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </div>
      <span style={{ fontSize: '12px', color: '#5c5c5c', fontFamily: 'Satoshi, system-ui, sans-serif' }}>
        Enable for Workspace
      </span>
    </div>
  );
}

export default function Dismodule({ user }) {
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Add New Channel
  const [channelName, setChannelName] = useState('');
  const [platform, setPlatform] = useState('facebook');
  const [note, setNote] = useState('');

  // Edit Modal State
  const [editingChannel, setEditingChannel] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNote, setEditNote] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const token = localStorage.getItem('token');
  const userRole = user?.role || 'individual';
  const workspaceId = user?.workspace_id || user?.workspace?.workspace_uuid || null;
  const isManager = userRole === 'manager';
  const isMember = userRole === 'member';

  // 1. Fetch connected channels from Backend API
  const fetchChannels = async () => {
    setIsLoading(true);
    try {
      let url = 'http://localhost:8000/api/v1/distribution/channels';
      if (workspaceId) {
        url += `?workspace_id=${workspaceId}`;
      }

      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch connected channels');
      }

      setChannels(data.channels || []);
    } catch (err) {
      console.error('Error fetching channels:', err);
      toast.error(err.message || 'Error fetching channels');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [workspaceId]);

  // 2. Initiate OAuth Connection
  const handleConnectChannel = async (e) => {
    e.preventDefault();

    if (isMember) {
      toast.error('Workspace Members cannot add new channels. Contact your Manager.');
      return;
    }

    setIsSubmitting(true);
    try {
      let initiateUrl = `http://localhost:8000/api/v1/distribution/channels/connect/initiate?platform=${platform}`;
      if (note.trim()) {
        initiateUrl += `&note=${encodeURIComponent(note.trim())}`;
      }
      if (channelName.trim()) {
        initiateUrl += `&channel_name=${encodeURIComponent(channelName.trim())}`;
      }
      if (workspaceId) {
        initiateUrl += `&workspace_id=${workspaceId}`;
      }

      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(initiateUrl, { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to initiate channel connection');
      }

      toast.success(`Initiating ${platform.toUpperCase()} connection...`);

      // If mock redirect URL is returned (Dev mode), trigger callback directly for seamless UX
      if (data.authorization_url.includes('callback?code=')) {
        const callbackRes = await fetch(data.authorization_url, { headers });
        const callbackData = await callbackRes.json();

        if (!callbackRes.ok) {
          throw new Error(callbackData.detail || 'Callback token exchange failed');
        }

        toast.success(`Channel '${callbackData.display_name}' connected successfully!`);
        setChannelName('');
        setNote('');
        fetchChannels();
      } else {
        // Real OAuth redirect to Facebook/LinkedIn authorization dialog
        window.location.href = data.authorization_url;
      }
    } catch (err) {
      toast.error(err.message || 'Connection failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Toggle Enable for Workspace
  const handleToggleWorkspace = async (channelId, currentVal) => {
    if (!isManager) {
      toast.error('Only Workspace Managers can toggle workspace availability.');
      return;
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `http://localhost:8000/api/v1/distribution/channels/${channelId}/toggle-workspace`,
        { method: 'PATCH', headers }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to toggle workspace availability');
      }

      toast.success(data.message || 'Updated workspace visibility');
      // Optimistic state update
      setChannels((prev) =>
        prev.map((c) => (c.id === channelId ? { ...c, enabled_for_workspace: data.enabled_for_workspace } : c))
      );
    } catch (err) {
      toast.error(err.message || 'Error updating channel');
    }
  };

  // 4. Delete / Disconnect Channel
  const handleDeleteChannel = async (channelId) => {
    if (isMember) {
      toast.error('Workspace Members cannot disconnect channels.');
      return;
    }

    if (!window.confirm('Are you sure you want to disconnect this channel?')) {
      return;
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:8000/api/v1/distribution/channels/${channelId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const data = await response.json();
        // 409 Conflict Guard handling
        throw new Error(data.detail || 'Failed to disconnect channel');
      }

      toast.success('Channel disconnected successfully!');
      setActiveMenuId(null);
      fetchChannels();
    } catch (err) {
      toast.error(err.message || 'Error disconnecting channel');
    }
  };

  // 5. Update Channel Name / Note
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingChannel) return;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:8000/api/v1/distribution/channels/${editingChannel.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          display_name: editName.trim() || undefined,
          note: editNote.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update channel');
      }

      toast.success('Channel updated successfully!');
      setEditingChannel(null);
      fetchChannels();
    } catch (err) {
      toast.error(err.message || 'Error updating channel');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '16 January 2025';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        gap: '24px',
        fontFamily: 'Satoshi, system-ui, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      {/* LEFT PANEL: Connected Channels (70%) */}
      <div
        style={{
          width: '70%',
          backgroundColor: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(16px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          padding: '24px 28px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e1e1e' }}>Connected Channels</h2>
          <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
            {channels.length} {channels.length === 1 ? 'Channel' : 'Channels'}
          </span>
        </div>

        {/* Channels List */}
        {isLoading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
            Loading connected channels...
          </div>
        ) : channels.length === 0 ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              borderRadius: '16px',
              border: '1.5px dashed rgba(0, 0, 0, 0.08)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(254, 114, 22, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 4V20M4 12H20"
                  stroke="#FE7216"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600', color: '#1e1e1e' }}>
              No Channels Connected Yet
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Use the form on the right to connect your Facebook Page or LinkedIn Account.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {channels.map((channel) => (
              <div
                key={channel.id}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  borderRadius: '14px',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  padding: '14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                  position: 'relative',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Top Row: Icon, Name, Status, Kebab Menu */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Platform Icon */}
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: channel.platform === 'facebook' ? '#1877F2' : '#0A66C2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={channel.platform === 'facebook' ? facebookIcon : linkedinIcon}
                        alt={channel.platform}
                        style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                      />
                    </div>

                    {/* Title & Status Capsule */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e1e1e' }}>
                          {channel.display_name}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: channel.status === 'active' ? '#dcfce7' : '#f1f5f9',
                            color: channel.status === 'active' ? '#166534' : '#64748b',
                            textTransform: 'capitalize',
                          }}
                        >
                          {channel.status}
                        </span>
                      </div>
                      {channel.note && (
                        <span style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                          {channel.note}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Kebab 3-dots Menu Button */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === channel.id ? null : channel.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        color: '#64748b',
                        fontSize: '18px',
                        borderRadius: '6px',
                      }}
                    >
                      ⋮
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenuId === channel.id && (
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '28px',
                          backgroundColor: '#ffffff',
                          borderRadius: '10px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                          border: '1px solid rgba(0,0,0,0.08)',
                          zIndex: 50,
                          width: '150px',
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          onClick={() => {
                            setEditingChannel(channel);
                            setEditName(channel.display_name);
                            setEditNote(channel.note || '');
                            setActiveMenuId(null);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            fontSize: '13px',
                            cursor: 'pointer',
                            color: '#1e1e1e',
                            fontWeight: '500',
                          }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                        >
                          ✏️ Edit Note/Name
                        </button>
                        <button
                          onClick={() => handleDeleteChannel(channel.id)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            fontSize: '13px',
                            cursor: 'pointer',
                            color: '#ef4444',
                            fontWeight: '500',
                          }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = '#fef2f2')}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                        >
                          🗑️ Disconnect
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Enable Toggle & Date */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px dashed rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Enable for Workspace Toggle (Shown for Manager / Workspace channels) */}
                  {channel.owner_type === 'workspace' && isManager ? (
                    <EnableToggle
                      enabled={channel.enabled_for_workspace}
                      onToggle={() => handleToggleWorkspace(channel.id, channel.enabled_for_workspace)}
                    />
                  ) : (
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {channel.owner_type === 'workspace' ? 'Workspace Channel' : 'Personal Channel'}
                    </span>
                  )}

                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Added {formatDate(channel.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Add New Channel Form (30%) */}
      <div
        style={{
          width: '30%',
          backgroundColor: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(16px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          padding: '24px 24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
          boxSizing: 'border-box',
          height: 'fit-content',
        }}
      >
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#1e1e1e' }}>
          Add New Channel
        </h2>

        <form onSubmit={handleConnectChannel} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Channel Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Channel name</label>
            <input
              type="text"
              placeholder="e.g. The United Congregation Of Optimus"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(255,255,255,0.9)',
                fontSize: '13px',
                color: '#1e1e1e',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Channel Type (Radio selection: Facebook vs LinkedIn) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Channel type</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Facebook Radio */}
              <label
                onClick={() => setPlatform('facebook')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: platform === 'facebook' ? '1.5px solid #FE7216' : '1.5px solid rgba(0,0,0,0.1)',
                  backgroundColor: platform === 'facebook' ? 'rgba(254,114,22,0.06)' : 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#1e1e1e',
                  userSelect: 'none',
                }}
              >
                <img src={facebookIcon} alt="FB" style={{ width: '18px', height: '18px' }} />
                <span>Facebook</span>
                <input
                  type="radio"
                  name="platform"
                  checked={platform === 'facebook'}
                  onChange={() => setPlatform('facebook')}
                  style={{ marginLeft: 'auto', accentColor: '#FE7216' }}
                />
              </label>

              {/* LinkedIn Radio */}
              <label
                onClick={() => setPlatform('linkedin')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: platform === 'linkedin' ? '1.5px solid #FE7216' : '1.5px solid rgba(0,0,0,0.1)',
                  backgroundColor: platform === 'linkedin' ? 'rgba(254,114,22,0.06)' : 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#1e1e1e',
                  userSelect: 'none',
                }}
              >
                <img src={linkedinIcon} alt="LI" style={{ width: '18px', height: '18px' }} />
                <span>LinkedIn</span>
                <input
                  type="radio"
                  name="platform"
                  checked={platform === 'linkedin'}
                  onChange={() => setPlatform('linkedin')}
                  style={{ marginLeft: 'auto', accentColor: '#FE7216' }}
                />
              </label>
            </div>
          </div>

          {/* Note Textarea */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Note</label>
            <textarea
              placeholder="Add optional internal notes about this channel..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(255,255,255,0.9)',
                fontSize: '13px',
                color: '#1e1e1e',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Form Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => {
                setChannelName('');
                setNote('');
              }}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '10px',
                border: '1.5px solid rgba(0,0,0,0.1)',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isMember}
              style={{
                flex: 1.5,
                padding: '10px 0',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #FE7216 0%, #f59e0b 100%)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '700',
                cursor: isSubmitting || isMember ? 'not-allowed' : 'pointer',
                opacity: isSubmitting || isMember ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(254,114,22,0.3)',
              }}
            >
              {isSubmitting ? 'Connecting...' : 'Connect and Save'}
            </button>
          </div>
        </form>
      </div>

      {/* Edit Modal */}
      {editingChannel && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '24px 28px',
              width: '400px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>Edit Channel Information</h3>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Channel Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    marginTop: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Note</label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    marginTop: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingChannel(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#FE7216',
                    color: '#fff',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
