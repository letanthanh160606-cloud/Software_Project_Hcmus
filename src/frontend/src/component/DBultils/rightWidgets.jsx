import React from 'react';
import fbicon from '../../assets/fblg.png';
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

// 1. Approval Requests Widget
export function ApprovalRequests() {
  const requests = [
    { id: 1, title: '[TA - P1] Archeology' },
    { id: 2, title: 'Ecology' },
    { id: 3, title: 'HR - IT dep.' },
    { id: 4, title: 'HR - FI dep.' },
    { id: 5, title: 'HR - FI dep.' },
    { id: 6, title: 'HR - FI dep.' },
    { id: 7, title: 'HR - FI dep.' },
    { id: 8, title: 'HR - FI dep.' },
    { id: 9, title: 'HR - FI dep.' },
    { id: 10, title: 'HR - FI dep.' }
  ];

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
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#554E43' }}>
          Approval Requests
        </h2>
        <span
          style={{
            fontSize: '13px',
            color: '#554E43',
            cursor: 'pointer',
            fontWeight: '500',
            opacity: 0.8,
            fontFamily: 'Satoshi'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
        >
          See all &gt;
        </span>
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
        {requests.map((req, idx) => (
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
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#554E43' }}>
              {req.title}
            </span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#FE7216',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              View request
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. My Calendar Widget
export function MyCalendar() {
  const events = [
    { id: 1, title: 'Writing content for PA01', date: '14 Jul, 2026', color: '#2ECC71' },
    { id: 2, title: 'Writing content for PA02', date: '28 Jul, 2026', color: '#3498DB' },
    { id: 3, title: 'Congregation speech', date: '14 Aug, 2026', color: '#FE7216' },
    { id: 4, title: 'Translation', date: '11 July, 2026', color: '#D35400' },
    { id: 5, title: 'Writing content for PA01', date: '14 July, 2026', color: '#2ECC71' },
    { id: 6, title: 'Writing content for PA02', date: '28 July, 2026', color: '#3498DB' }
  ];

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
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#554E43' }}>
          My Calendar
        </h2>
        <AddButton />
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
        {events.map((event) => (
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
        ))}
      </div>
    </div>
  );
}

// 3. Channel Widget
export function ChannelList() {
  const channels = [
    { id: 1, platform: 'Facebook', name: 'The Discreet Coven', status: 'Active' },
    { id: 2, platform: 'Facebook', name: 'The Alumni Congregation', status: 'Active' },
    { id: 3, platform: 'Facebook', name: 'The Discreet Coven', status: 'Active' },
    { id: 4, platform: 'Facebook', name: 'The Alumni Congregation', status: 'Inactive' },
    { id: 5, platform: 'Facebook', name: 'The Alumni Congregation', status: 'Inactive' }
  ];

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
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#554E43' }}>
          Channel
        </h2>
        <AddButton />
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
                  src={fbicon}
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
