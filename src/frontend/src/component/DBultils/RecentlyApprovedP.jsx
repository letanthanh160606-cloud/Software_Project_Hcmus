import React, { useState, useEffect } from 'react';
import fbicon from '../../assets/fblg.png';

export default function RecentlyApproveP() {
  const [approvedPosts, setApprovedPosts] = useState([]);

  useEffect(() => {
    const mockBackendData = [
      {
        id: 1,
        name: '[SE - PAOO] Instructions on how ...',
        PublisedDate: 'May 18, 2026 - May 19, 2026',
        attachment: 'Architecture.png',
        Flatform: fbicon
      },{
        id: 2,
        name: '[SE - PAOO] Instructions on how ...',
        PublisedDate: 'May 18, 2026 - May 19, 2026',
        attachment: 'Architecture.png',
        Flatform: fbicon
      },{
        id: 3,
        name: '[SE - PAOO] Instructions on how ...',
        PublisedDate: 'May 18, 2026 - May 19, 2026',
        attachment: 'Architecture.png',
        Flatform: fbicon
      },{
        id: 4,
        name: '[SE - PAOO] Instructions on how ...',
        PublisedDate: 'May 18, 2026 - May 19, 2026',
        attachment: 'Architecture.png',
        Flatform: fbicon
      },{
        id: 5,
        name: '[SE - PAOO] Instructions on how ...',
        PublisedDate: 'May 18, 2026 - May 19, 2026',
        attachment: 'Architecture.png',
        Flatform: fbicon
      }
    ];

    setApprovedPosts(mockBackendData);
  }, []);

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
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#554E43' }}>Recently Approved Posts</h2>
        <span style={{ fontSize: '14px', color: '#554E43', cursor: 'pointer', fontWeight: '500' }}>See all &gt;</span>
      </div>

      {/* Table Header (Static) */}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ color: '#7E7A72', fontSize: '14px' }}>
            <th style={{ width: '40%', padding: '10px 5px', fontWeight: '600', borderBottom: '1px solid #E6DEC9' }}>Name</th>
            <th style={{ width: '25%', padding: '10px 5px', fontWeight: '600', borderBottom: '1px solid #E6DEC9' }}>Published Date</th>
            <th style={{ width: '18%', padding: '10px 5px', fontWeight: '600', borderBottom: '1px solid #E6DEC9' }}>Attachment</th>
            <th style={{ width: '12%', padding: '10px 5px', fontWeight: '600', textAlign: 'right', borderBottom: '1px solid #E6DEC9' }}>Flatform</th>
          </tr>
        </thead>
      </table>

      {/* Table Body (Scrollable) */}
      <div className="custom-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
          <tbody>
            {approvedPosts.map((post) => (
              <tr key={post.id} style={{ borderBottom: '1px solid #E6DEC9', color: '#888175', fontSize: '13px' }}>
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