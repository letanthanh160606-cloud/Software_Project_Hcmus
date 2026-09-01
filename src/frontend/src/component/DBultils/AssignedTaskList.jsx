import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AssignedTasksTable({ user }) {
  const [tasks, setTasks] = useState([]);
  const [showAllModal, setShowAllModal] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isManager = user?.role === 'manager' || user?.account_type === 'business';

  const fetchRealTasks = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const workspaceId = user?.workspace_id || user?.workspace?.workspace_uuid || null;
      if (!workspaceId) return;

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8000/workspaces/${workspaceId}/tasks`, { headers });
      if (res.ok) {
        const data = await res.json();
        const taskList = (Array.isArray(data) ? data : []).map((t, idx) => {
          const rawStatus = (t.status || 'todo').toLowerCase();
          const displayStatus = (rawStatus === 'done' || rawStatus === 'completed') ? 'Done' : 'Doing';

          return {
            id: t.id,
            name: t.title || 'Untitled Task',
            content: t.content || '',
            status: displayStatus,
            date: t.due_date
              ? new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Ongoing',
            priority: t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : 'Medium',
            attachment: t.attachment?.image_url ? (t.attachment.image_url.split('/').pop() || 'Attachment') : (t.attachment_name || 'Document'),
            attachmentUrl: t.attachment?.image_url || null,
            assigneeName: t.assigned_user?.username || 'Member',
            assigneeAvatar: t.assigned_user?.avatar || `https://i.pravatar.cc/100?img=${(idx % 10) + 1}`,
          };
        });
        setTasks(taskList);
      }
    } catch (err) {
      console.error('Error fetching assigned tasks:', err);
    }
  };

  useEffect(() => {
    fetchRealTasks();
  }, [user]);

  const handleDeleteTask = async (taskId) => {
    if (!isManager) {
      toast.error('Only managers have permission to delete tasks.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    const workspaceId = user?.workspace_id || user?.workspace?.workspace_uuid || null;
    if (!workspaceId) return;

    setDeletingTaskId(taskId);
    try {
      const res = await fetch(`http://localhost:8000/workspaces/${workspaceId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
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

  const handleMarkDone = async (taskId) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    const workspaceId = user?.workspace_id || user?.workspace?.workspace_uuid || null;
    if (!workspaceId) return;

    setUpdatingTaskId(taskId);
    try {
      const res = await fetch(`http://localhost:8000/workspaces/${workspaceId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: 'done' })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to mark task as done');
      }
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: 'Done' } : t));
      toast.success('Task marked as Done!');
    } catch (err) {
      toast.error(err.message || 'Error updating task status');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getPriorityStyle = (priority) => {
    const p = String(priority || '').toLowerCase();
    if (p === 'low') {
      return { color: '#2ECC71', border: '1px solid #2ECC71', backgroundColor: '#EAFAF1' };
    }
    if (p === 'medium') {
      return { color: '#F39C12', border: '1px solid #F39C12', backgroundColor: '#FEF5E7' };
    }
    if (p === 'high' || p === 'urgent') {
      return { color: '#E74C3C', border: '1px solid #E74C3C', backgroundColor: '#FDEDEC' };
    }
    return { color: '#7F8C8D', border: '1px solid #7F8C8D', backgroundColor: '#F4F6F6' };
  };

  const getStatusStyle = (status) => {
    if (status === 'Done') {
      return { color: '#16a34a', border: '1px solid #86efac', backgroundColor: '#f0fdf4' };
    }
    return { color: '#2563eb', border: '1px solid #93c5fd', backgroundColor: '#eff6ff' };
  };

  const filteredModalTasks = tasks.filter((t) =>
    (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.assigneeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.status || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      width: '100%',
      height: '100%',
      borderRadius: '15px',
      padding: '15px',
      boxSizing: 'border-box',
      fontFamily: 'Satoshi, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#554E43' }}>
          {user?.role === 'member' ? 'Assigned Tasks' : 'Tasks Assigned to Others'}
        </h2>
        <span
          onClick={() => setShowAllModal(true)}
          style={{ fontSize: '13px', color: '#FE7216', cursor: 'pointer', fontWeight: '600', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.75'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          See all &gt;
        </span>
      </div>

      {/* Table Header */}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ color: '#7E7A72', fontSize: '13px' }}>
            <th style={{ width: '28%', padding: '10px 5px', fontWeight: '600', borderBottom: '1px solid #E6DEC9' }}>Name</th>
            <th style={{ width: '18%', padding: '10px 5px', fontWeight: '600', borderBottom: '1px solid #E6DEC9' }}>Date</th>
            <th style={{ width: '14%', padding: '10px 5px', fontWeight: '600', textAlign: 'center', borderBottom: '1px solid #E6DEC9' }}>Status</th>
            <th style={{ width: '14%', padding: '10px 5px', fontWeight: '600', textAlign: 'center', borderBottom: '1px solid #E6DEC9' }}>Priority</th>
            <th style={{ width: '14%', padding: '10px 5px', fontWeight: '600', borderBottom: '1px solid #E6DEC9' }}>Attachment</th>
            <th style={{ width: '12%', padding: '10px 5px', fontWeight: '600', textAlign: 'center', borderBottom: '1px solid #E6DEC9' }}>
              {user?.role === 'member' ? 'Action' : 'Assignee'}
            </th>
          </tr>
        </thead>
      </table>

      <div className="custom-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#9ca3af', fontSize: '13px' }}>
            No assigned tasks found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} style={{ borderBottom: '1px solid #E6DEC9', color: '#888175', fontSize: '12px' }}>
                  {/* Task Name */}
                  <td style={{
                    width: '28%',
                    padding: '8px 5px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    <span title={task.name}>{task.name}</span>
                  </td>

                  {/* Date */}
                  <td style={{ width: '18%', padding: '8px 5px', whiteSpace: 'nowrap' }}>{task.date}</td>

                  {/* Status Badge (Doing / Done) */}
                  <td style={{ width: '14%', padding: '8px 5px', textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      display: 'inline-block',
                      ...getStatusStyle(task.status)
                    }}>
                      {task.status}
                    </span>
                  </td>

                  {/* Priority Badge */}
                  <td style={{ width: '14%', padding: '8px 5px', textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'inline-block',
                      ...getPriorityStyle(task.priority)
                    }}>
                      {task.priority}
                    </span>
                  </td>

                  {/* Attachment */}
                  <td style={{ width: '14%', padding: '8px 5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.attachmentUrl ? (
                      <a href={task.attachmentUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#FE7216', textDecoration: 'none', fontWeight: '600' }}>
                        {task.attachment} ↗
                      </a>
                    ) : (
                      task.attachment
                    )}
                  </td>

                  {/* Assignee Avatar (Manager) or Done Button (Member) */}
                  <td style={{ width: '12%', padding: '8px 5px', textAlign: 'center' }}>
                    {user?.role === 'member' ? (
                      task.status === 'Done' ? (
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
                            padding: '3px 8px',
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
                    ) : (
                      <img
                        src={task.assigneeAvatar}
                        alt={task.assigneeName}
                        title={task.assigneeName}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', display: 'inline-block' }}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* See All Tasks Modal */}
      {showAllModal && (
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
          zIndex: 9999,
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
                  {user?.role === 'member' ? 'Assigned Tasks' : 'Tasks Assigned to Others'}
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
                onClick={() => setShowAllModal(false)}
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
                placeholder="Search tasks by name, status (Doing/Done), or assignee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                    <th style={{ width: '12%', padding: '14px 8px', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                    <th style={{ width: '12%', padding: '14px 8px', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Priority</th>
                    <th style={{ width: '14%', padding: '14px 8px', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Attachment</th>
                    <th style={{ width: '12%', padding: '14px 8px', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Assignee</th>
                    <th style={{ width: '10%', padding: '14px 8px', fontWeight: '700', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModalTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8', fontSize: '13px' }}>
                        No matching tasks found.
                      </td>
                    </tr>
                  ) : (
                    filteredModalTasks.map((task) => (
                      <tr key={task.id} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '13px' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span title={task.name}>{task.name}</span>
                        </td>
                        <td style={{ padding: '12px 8px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {task.date}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            display: 'inline-block',
                            ...getStatusStyle(task.status)
                          }}>
                            {task.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            display: 'inline-block',
                            ...getPriorityStyle(task.priority)
                          }}>
                            {task.priority}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {task.attachmentUrl ? (
                            <a
                              href={task.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#FE7216', textDecoration: 'none', fontWeight: '600' }}
                            >
                              📎 {task.attachment}
                            </a>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>None</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                              src={task.assigneeAvatar}
                              alt={task.assigneeName}
                              style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <span style={{ fontSize: '12px', fontWeight: '500', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {task.assigneeName}
                            </span>
                          </div>
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
                            task.status === 'Done' ? (
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
                    ))
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
                onClick={() => setShowAllModal(false)}
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
