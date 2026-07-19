import React, { useEffect, useState } from 'react';
import bg from '../assets/MainDBbg.png';
import dbicon from '../assets/dbicon.png';
import cticon from '../assets/cticon.png';
import sicon from '../assets/sicon.png';
import disicon from '../assets/disicon.png';
import caicon from '../assets/caicon.png';
import wsicon from '../assets/wsicon.png';
import pcicon from '../assets/pcicon.png';
import pmicon from '../assets/pmicon.png';

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);

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

  const menuItems = [
    { label: 'Dashboard', icon: <img src={dbicon} style={{ width: '18px', height: '18px', objectFit: 'contain'}}/> },
    { label: 'Content', icon: <img src={cticon} style={{ width: '18px', height: '18px', objectFit: 'contain'}}/> },
    { label: 'Statistics', icon: <img src={sicon} style={{ width: '18px', height: '18px', objectFit: 'contain'}}/> },
    { label: 'Distribution', icon: <img src={disicon} style={{ width: '18px', height: '18px', objectFit: 'contain'}}/> },
    { label: 'Calendar', icon: <img src={caicon} style={{ width: '18px', height: '18px', objectFit: 'contain'}}/> },
    { label: 'Team Workspace', icon: <img src={wsicon} style={{ width: '18px', height: '18px', objectFit: 'contain'}}/> },
    { label: 'Prompt & Context', icon: <img src={pcicon} style={{ width: '18px', height: '18px', objectFit: 'contain'}}/> },
    { label: 'Post Management', icon: <img src={pmicon} style={{ width: '18px', height: '18px', objectFit: 'contain'}}/> }
  ];

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
          <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', position: 'relative' }}>
            🔔<span style={{ position: 'absolute', top: 2, right: 2, width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#7c7c7c', letterSpacing: '0.5px' }}>MANAGER</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e1e1e' }}>{user?.username}</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', overflow: 'hidden' }}>
              <img src="https://via.placeholder.com/40" alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '12px', color: '#7c7c7c' }}>▼</span>
          </div>
        </div>
      </nav>

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
          {menuItems.map((item, index) => {
            const isActive = activeTab === index;
            return (
              <li key={index} style={{ width: '100%' }}>
                <button 
                  onClick={() => setActiveTab(index)}
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
                    
                    // 2. Dynamic properties conditional on the active element
                    fontWeight: isActive ? '500' : '400',
                    color: isActive ? '#1e1e1e' : '#5c5c5c',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255, 255, 255, 0)',
                    border: isActive ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0)',
                    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.03)' : 'none',

                    // 3. Smooth transition configuration
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
        minHeight: 'calc(100vh - 100px)', background: 'rgba(255, 255, 255, 0.35)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.25)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.03)',
        paddingLeft: '23px', paddingTop: '0px', boxSizing: 'border-box', height: '1000px'
      }}>
        <h2 style={{ fontFamily: 'Satoshi', fontWeight: '500', color: '#1e1e1e', paddingTop: '0px'}}>
          {menuItems[activeTab].label} Content Space
        </h2>

      </main>

    </div>
  );
}