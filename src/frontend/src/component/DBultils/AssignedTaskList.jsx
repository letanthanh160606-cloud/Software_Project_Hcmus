import React, { useState, useEffect } from 'react';

export default function AssignedTasksTable({ user }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchRealTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const workspaceId = user?.workspace_id || user?.workspace?.workspace_uuid || null;
        if (!workspaceId) return;

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`http://localhost:8000/workspaces/${workspaceId}/tasks`, { headers });
        if (res.ok) {
          const data = await res.json();
          const taskList = (Array.isArray(data) ? data : []).map((t, idx) => ({
            id: t.id,
            name: t.title || 'Untitled Task',
            date: t.due_date
              ? new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Ongoing',
            priority: t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : 'Medium',
            attachment: t.attachment_name || 'Document',
            assigneeAvatar: `https://i.pravatar.cc/100?img=${(idx % 10) + 1}`,
          }));
          setTasks(taskList);
        }
      } catch (err) {
        console.error('Error fetching assigned tasks:', err);
      }
    };

    fetchRealTasks();
  }, [user]);

  const getPriorityStyle = (priority) => {
    const p = String(priority || '').toLowerCase();
    if (p === 'low') {
      return { color: '#2ECC71', border: '1px solid #2ECC71', backgroundColor: '#EAFAF1' };
    }
    if (p === 'medium') {
      return { color: '#F39C12', border: '1px solid #F39C12', backgroundColor: '#FEF5E7' };
    }
    if (p === 'high') {
      return { color: '#E74C3C', border: '1px solid #E74C3C', backgroundColor: '#FDEDEC' };
    }
    return { color: '#7F8C8D', border: '1px solid #7F8C8D', backgroundColor: '#F4F6F6' };
  };

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
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#554E43' }}>{user?.role === 'member' ? 'Assigned Tasks' : 'Tasks Assigned to Others'}</h2>
        <span style={{ fontSize: '13px', color: '#554E43', cursor: 'pointer', fontWeight: '500' }}>See all &gt;</span>
      </div>

      {/* Table Header */}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ color: '#7E7A72', fontSize: '13px' }}>
            <th style={{ width: '30%', padding: '10px 5px', fontWeight: '600', borderBottom: '1px solid #E6DEC9' }}>Name</th>
            <th style={{ width: '25%', padding: '10px 5px', fontWeight: '600', borderBottom: '1px solid #E6DEC9' }}>Date</th>
            <th style={{ width: '16%', padding: '10px 5px', fontWeight: '600', borderBottom: '1px solid #E6DEC9' }}>Priority</th>
            <th style={{ width: '14%', padding: '10px 5px', fontWeight: '600', borderBottom: '1px solid #E6DEC9' }}>Attachment</th>
            <th style={{ width: '10%', padding: '10px 5px', fontWeight: '600', textAlign: 'right', borderBottom: '1px solid #E6DEC9' }}>Assignee</th>
          </tr>
        </thead>
      </table>

      <div className="custom-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} style={{ borderBottom: '1px solid #E6DEC9', color: '#888175', fontSize: '12px' }}>
                {/* Task Name */}
                <td style={{
                  width: '30%',
                  padding: '8px 5px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {task.name}
                </td>

                {/* Date */}
                <td style={{ width: '25%', padding: '8px 5px', whiteSpace: 'nowrap' }}>{task.date}</td>

                {/* Priority Badge */}
                <td style={{ width: '16%', padding: '8px 5px' }}>
                  <span style={{
                    padding: '3px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'inline-block',
                    ...getPriorityStyle(task.priority)
                  }}>
                    {task.priority}
                  </span>
                </td>

                {/* Attachment */}
                <td style={{ width: '14%', padding: '8px 5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.attachment}</td>

                {/* Assignee Avatar */}
                <td style={{ width: '10%', padding: '8px 5px', textAlign: 'right' }}>
                  <img
                    src={task.assigneeAvatar}
                    alt="Assignee"
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}