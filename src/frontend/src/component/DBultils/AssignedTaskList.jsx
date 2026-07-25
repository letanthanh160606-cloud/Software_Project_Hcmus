import React, { useState, useEffect } from 'react';

export default function AssignedTasksTable() {
  const [tasks, setTasks] = useState([]);

  // Mock fetching BE data for demonstration
  useEffect(() => {
    // Replace this with your actual API fetch call:
    const mockBackendData = [
      {
        id: 1,
        name: '[SE - PAOO] Instructions on how ...',
        date: 'May 18, 2026 - May 19, 2026',
        priority: 'Low',
        attachment: 'Architecture.png',
        assigneeAvatar: 'https://i.pravatar.cc/100?img=1'
      },
      {
        id: 2,
        name: '[SE - PAOO] Instructions on how ...',
        date: 'May 18, 2026 - May 19, 2026',
        priority: 'Medium',
        attachment: 'Architecture.png',
        assigneeAvatar: 'https://i.pravatar.cc/100?img=2'
      },
      {
        id: 3,
        name: '[SE - PAOO] Instructions on how ...',
        date: 'May 18, 2026 - May 19, 2026',
        priority: 'High',
        attachment: 'Architecture.png',
        assigneeAvatar: 'https://i.pravatar.cc/100?img=3'
      },
      {
        id: 4,
        name: '[SE - PAOO] Instructions on how ...',
        date: 'May 18, 2026 - May 19, 2026',
        priority: 'Low',
        attachment: 'Architecture.png',
        assigneeAvatar: 'https://i.pravatar.cc/100?img=3'
      },
      {
        id: 5,
        name: '[SE - PAOO] Instructions on how ...',
        date: 'May 18, 2026 - May 19, 2026',
        priority: 'Low',
        attachment: 'Architecture.png',
        assigneeAvatar: 'https://i.pravatar.cc/100?img=3'
      },
      {
        id: 6,
        name: '[SE - PAOO] Instructions on how ...',
        date: 'May 18, 2026 - May 19, 2026',
        priority: 'Low',
        attachment: 'Architecture.png',
        assigneeAvatar: 'https://i.pravatar.cc/100?img=3'
      },
      {
        id: 7,
        name: '[SE - PAOO] Instructions on how ...',
        date: 'May 18, 2026 - May 19, 2026',
        priority: 'Low',
        attachment: 'Architecture.png',
        assigneeAvatar: 'https://i.pravatar.cc/100?img=3'
      },
      {
        id: 8,
        name: '[SE - PAOO] Instructions on how ...',
        date: 'May 18, 2026 - May 19, 2026',
        priority: 'Low',
        attachment: 'Architecture.png',
        assigneeAvatar: 'https://i.pravatar.cc/100?img=3'
      }
    ];

    setTasks(mockBackendData);
  }, []);

  // Helper function for dynamic Priority Badge styling
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Low':
        return { color: '#2ECC71', border: '1px solid #2ECC71', backgroundColor: '#EAFAF1' };
      case 'Medium':
        return { color: '#F39C12', border: '1px solid #F39C12', backgroundColor: '#FEF5E7' };
      case 'High':
        return { color: '#E74C3C', border: '1px solid #E74C3C', backgroundColor: '#FDEDEC' };
      default:
        return { color: '#7F8C8D', border: '1px solid #7F8C8D', backgroundColor: '#F4F6F6' };
    }
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
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#554E43' }}>Assigned Tasks</h2>
        <span style={{ fontSize: '14px', color: '#554E43', cursor: 'pointer', fontWeight: '500' }}>See all &gt;</span>
      </div>

      {/* Table Header */}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ color: '#7E7A72', fontSize: '14px' }}>
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
              <tr key={task.id} style={{ borderBottom: '1px solid #E6DEC9', color: '#888175', fontSize: '13px' }}>
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