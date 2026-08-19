import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import bg from '../assets/Signinupbg.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function PendingPage() {
  const navigate = useNavigate();
  const [ownerEmail, setOwnerEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Attempt to fetch the workspace manager's email so we can show the contact address.
  // The /auth/me endpoint returns the current user; the workspace data (if any) is stored
  // in localStorage from the registration response.
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) return;
    try {
      const user = JSON.parse(raw);
      // workspace object is stored at registration time even for pending members
      if (user?.workspace?.manager_email) {
        setOwnerEmail(user.workspace.manager_email);
        setLoading(false);
        return;
      }
    } catch (_) { /* ignore */ }

    // Fallback: try to get manager info from backend using stored workspace_id hint
    // For now just finish loading without an email
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/signin');
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Satoshi, system-ui, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Background */}
      <img
        src={bg}
        alt="Background"
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          objectFit: 'cover', zIndex: -1,
        }}
      />

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#ffffff',
        borderRadius: '28px',
        padding: '44px 40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}>

        {/* Icon */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #FE7216 0%, #f59e0b 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px',
          boxShadow: '0 8px 24px rgba(254,114,22,0.3)',
        }}>
          🔒
        </div>

        {/* Brand */}
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#CC4D08', letterSpacing: '0.3px' }}>
          Omni Platforms
        </div>

        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{
            margin: 0, fontSize: '22px', fontWeight: '800', color: '#1e1e1e', lineHeight: 1.2,
          }}>
            Workspace Access Pending
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>
            Your request to join the workspace is awaiting approval from the workspace owner.
          </p>
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(0,0,0,0.07)' }} />

        {/* Contact block */}
        <div style={{
          width: '100%',
          backgroundColor: 'rgba(254,114,22,0.06)',
          border: '1px solid rgba(254,114,22,0.18)',
          borderRadius: '14px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#9c9c9c', letterSpacing: '0.8px' }}>
            CONTACT OWNER
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>
            Workspace Access Denied. Please contact the owner via{' '}
            {loading ? (
              <span style={{ color: '#9c9c9c' }}>loading…</span>
            ) : ownerEmail ? (
              <a
                href={`mailto:${ownerEmail}`}
                style={{
                  color: '#FE7216', fontWeight: '700',
                  textDecoration: 'none', wordBreak: 'break-all',
                }}
              >
                {ownerEmail}
              </a>
            ) : (
              <span style={{ color: '#6b7280', fontStyle: 'italic' }}>
                your workspace administrator
              </span>
            )}
          </p>
        </div>

        {/* Log out button */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            height: '44px',
            borderRadius: '14px',
            border: 'none',
            background: 'linear-gradient(90deg, #F5820D 0%, #FA4A06 100%)',
            color: '#fff',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            fontFamily: 'Satoshi, system-ui, sans-serif',
            boxShadow: '0 4px 14px rgba(245,130,13,0.3)',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Log Out
        </button>

        <p style={{ margin: 0, fontSize: '12px', color: '#9c9c9c' }}>
          Once approved, log in again to access the dashboard.
        </p>
      </div>
    </div>
  );
}
