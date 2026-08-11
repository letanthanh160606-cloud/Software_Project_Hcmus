import React, { useState, useEffect } from 'react';
import fbicon from '../../assets/fblg.png';

export default function RecentlyApproveP({ user }) {
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRealPosts = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const workspaceId = user?.workspace_id || user?.workspace?.workspace_uuid || null;
        let url = 'http://localhost:8000/posts';
        if (workspaceId) url = `http://localhost:8000/workspaces/${workspaceId}/posts`;

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          const postsList = Array.isArray(data) ? data : [];
          setApprovedPosts(postsList.map(p => ({
            id: p.id,
            name: p.title || 'Untitled Post',
            PublisedDate: p.published_at
              ? new Date(p.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : (p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'),
            attachment: 'Content Document',
            Flatform: fbicon,
          })));
        }
      } catch (err) {
        console.error('Error fetching recent posts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealPosts();
  }, [user]);

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
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#554E43' }}>{user?.role === 'manager' ? 'Recently Approved' : 'Recent'} Posts</h2>
        <span style={{ fontSize: '13px', color: '#554E43', cursor: 'pointer', fontWeight: '500' }}>See all &gt;</span>
      </div>

      {/* Table Header (Static) */}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ color: '#7E7A72', fontSize: '13px' }}>
            <th style={{ width: '40%', padding: '10px 5px', fontWeight: '600', borderBottom: '1px solid #E6DEC9' }}>Name</th>
            <th style={{ width: '25%', padding: '10px 5px', fontWeight: '600', borderBottom: '1px solid #E6DEC9' }}>Published Date</th>
            <th style={{ width: '18%', padding: '10px 5px', fontWeight: '600', borderBottom: '1px solid #E6DEC9' }}>Attachment</th>
            <th style={{ width: '12%', padding: '10px 5px', fontWeight: '600', textAlign: 'right', borderBottom: '1px solid #E6DEC9' }}>Flatform</th>
          </tr>
        </thead>
      </table>

      {/* Table Body */}
      <div className="custom-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
          <tbody>
            {approvedPosts.map((post) => (
              <tr key={post.id} style={{ borderBottom: '1px solid #E6DEC9', color: '#888175', fontSize: '12px' }}>
                {/* Task Name */}
                <td style={{
                  width: '40%',
                  padding: '8px 5px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {post.name}
                </td>
                
                <td style={{ width: '25%', padding: '8px 5px', whiteSpace: 'nowrap' }}>{post.PublisedDate}</td>

                {/* Attachment */}
                <td style={{ width: '18%', padding: '8px 5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.attachment}</td>

                {/* Assignee Avatar */}
                <td style={{ width: '12%', padding: '8px 5px', textAlign: 'right' }}>
                  <img
                    src={post.Flatform}
                    alt="Flatform"
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