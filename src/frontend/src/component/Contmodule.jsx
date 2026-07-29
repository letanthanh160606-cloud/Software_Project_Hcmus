import React, { useState, useRef } from 'react';
import facebook from '../assets/fblg.png';
import linkedin from '../assets/linkedinlg.png';

function AIToggle({ enabled, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: '13px', color: '#5c5c5c', fontFamily: 'Satoshi, system-ui, sans-serif' }}>
        Enable AI
      </span>
      {/* Track */}
      <div
        style={{
          width: '40px',
          height: '22px',
          borderRadius: '11px',
          backgroundColor: enabled ? '#22c55e' : '#d1d5db',
          position: 'relative',
          transition: 'background-color 0.25s ease',
          flexShrink: 0,
        }}
      >
        {/* Thumb */}
        <div
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#fff',
            position: 'absolute',
            top: '3px',
            left: enabled ? '21px' : '3px',
            transition: 'left 0.25s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </div>
    </div>
  );
}

function PlatformCard({ icon, platformName, accountName, selected, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        borderRadius: '12px',
        border: selected ? '1.5px solid #FE7216' : '1.5px solid rgba(0,0,0,0.08)',
        backgroundColor: selected ? 'rgba(254,114,22,0.06)' : 'rgba(255,255,255,0.7)',
        cursor: 'pointer',
        minWidth: '160px',
        flex: '1',
        transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: selected ? '0 2px 8px rgba(254,114,22,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
        userSelect: 'none',
      }}
    >
      {/* Checkbox */}
      <div
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '5px',
          border: selected ? '2px solid #FE7216' : '2px solid #d1d5db',
          backgroundColor: selected ? '#FE7216' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        }}
      >
        {selected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <img src={icon} alt={platformName} style={{ width: '20px', height: '20px', objectFit: 'contain', flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e1e1e', fontFamily: 'Satoshi, system-ui, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {platformName}
        </div>
        <div style={{ fontSize: '11px', color: '#7c7c7c', fontFamily: 'Satoshi, system-ui, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {accountName}
        </div>
      </div>
    </div>
  );
}

function KBItem({ title, aiEnabled, checked, onCheck }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Checkbox dot */}
        <div
          onClick={onCheck}
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '4px',
            border: checked ? (aiEnabled ? '2px solid #FE7216' : '2px solid #9ca3af') : '2px solid #d1d5db',
            backgroundColor: checked ? (aiEnabled ? '#FE7216' : '#9ca3af') : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          {checked && (
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#1e1e1e', fontFamily: 'Satoshi, system-ui, sans-serif' }}>
          {title}
        </span>
      </div>
      <span style={{ fontSize: '12px', color: '#FE7216', fontWeight: '600', cursor: 'pointer', fontFamily: 'Satoshi, system-ui, sans-serif' }}>
        View
      </span>
    </div>
  );
}

function PromptItem({ title, description }) {
  return (
    <div style={{
      padding: '8px 0',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      cursor: 'pointer',
    }}>
      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e1e1e', fontFamily: 'Satoshi, system-ui, sans-serif' }}>
        {title}
      </div>
      <div style={{
        fontSize: '12px',
        color: '#7c7c7c',
        fontFamily: 'Satoshi, system-ui, sans-serif',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        marginTop: '2px',
      }}>
        {description}
      </div>
    </div>
  );
}


function SearchBar({ placeholder = 'Search' }) {
  const [value, setValue] = React.useState('');
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: '10px',
      padding: '9px 14px',
      marginTop: '10px',
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="6" cy="6" r="5" stroke="#9ca3af" strokeWidth="1.5" />
        <path d="M10 10L13 13" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          outline: 'none',
          fontSize: '13px',
          color: '#1e1e1e',
          fontFamily: 'Satoshi, system-ui, sans-serif',
        }}
      />
    </div>
  );
}

export default function Contmodule() {
  const componentGap = '20px';

  // Platforms data
  const [platforms, setPlatforms] = useState([
    { id: 1, name: 'Facebook', account: 'The Discreet Coven', icon: facebook, selected: true },
    { id: 2, name: 'Facebook', account: 'The Deep Blue Abyssal', icon: facebook, selected: false },
    { id: 3, name: 'LinkedIn', account: 'Statch', icon: linkedin, selected: false },
    { id: 4, name: 'LinkedIn', account: 'Statch', icon: linkedin, selected: false },
    { id: 5, name: 'LinkedIn', account: 'Statch', icon: linkedin, selected: false },
    { id: 6, name: 'LinkedIn', account: 'Statch', icon: linkedin, selected: false },
    { id: 7, name: 'LinkedIn', account: 'Statch', icon: linkedin, selected: false }
  ]);

  const [aiEnabled, setAiEnabled] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [promptInput, setPromptInput] = useState('');

  // KB data
  const [kbItems, setKbItems] = useState([
    { id: 1, title: 'BA Anual Analysis', checked: false },
    { id: 2, title: 'BA Anual Analysis', checked: false },
    { id: 3, title: 'BA Anual Analysis', checked: false },
    { id: 4, title: 'BA Anual Analysis', checked: false },
    { id: 5, title: 'BA Anual Analysis', checked: false },
    { id: 6, title: 'BA Anual Analysis', checked: false },
    { id: 7, title: 'BA Anual Analysis', checked: false },
    { id: 8, title: 'BA Anual Analysis', checked: false }
  ]);

  // Prompt data
  const promptTemplates = [
    { id: 1, title: 'BA Anual Analysis', description: 'As a senior BA, put this business under close inspect...' },
    { id: 2, title: 'BA Anual Analysis', description: 'As a senior BA, put this business under close inspect...' },
    { id: 3, title: 'BA Anual Analysis', description: 'As a senior BA, put this business under close inspect...' },
  ];

  // Media drag state
  const [isDragging, setIsDragging] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const fileInputRef = useRef(null);

  const togglePlatform = (id) => {
    setPlatforms((prev) => prev.map((p) => p.id === id ? { ...p, selected: !p.selected } : p));
  };

  const toggleKB = (id) => {
    setKbItems((prev) => prev.map((k) => k.id === id ? { ...k, checked: !k.checked } : k));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setMediaFiles((prev) => [...prev, ...files]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles((prev) => [...prev, ...files]);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      gap: componentGap,
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        gap: '24px',
        margin: '0px', 
        padding: '0px'
      }}>
        <div style={{
          width: '70%',
          minHeight: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '20px',
          padding: '20px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: componentGap,
        }}>

          {/* Platform Selector Row */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#5c5c5c', fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                Select Designated Flatform
              </span>
              <button style={{
                background: 'none',
                border: 'none',
                fontSize: '13px',
                color: '#5c5c5c',
                cursor: 'pointer',
                fontFamily: 'Satoshi, system-ui, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0,
              }}>
                Add
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M4.5 3L7.5 6L4.5 9" stroke="#5c5c5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Platform Cards */}
            <div 
              className="custom-scroll" 
              style={{ 
                display: 'flex', 
                gap: '12px', 
                flexDirection: 'row', 
                overflowX: 'auto',
                padding: '8px 0' // Prevents focus rings or card shadows from getting clipped
              }}
            >
              {platforms.map((p) => (
                <div 
                  key={p.id} 
                  style={{ 
                    width: '240px',
                    minWidth: '240px',
                    flexShrink: 0 
                  }}
                >
                  <PlatformCard
                    icon={p.icon}
                    platformName={p.name}
                    accountName={p.account}
                    selected={p.selected}
                    onToggle={() => togglePlatform(p.id)}
                  />
                </div>
              ))}
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.07)', marginTop: '16px' }} />
          </div>

          {/* Post Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {/* Post Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e1e1e', fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                Post
              </span>
              <AIToggle enabled={aiEnabled} onToggle={() => setAiEnabled((v) => !v)} />
            </div>

            {/* Title Input */}
            <input
              type="text"
              placeholder="Enter the title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid rgba(0,0,0,0.09)',
                backgroundColor: 'rgba(255,255,255,0.8)',
                fontSize: '13px',
                color: '#1e1e1e',
                fontFamily: 'Satoshi, system-ui, sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => { e.target.style.borderColor = aiEnabled ? '#22c55e' : '#FE7216'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.09)'; }}
            />

            {/* Body Textarea */}
            <textarea
              placeholder={
                aiEnabled
                  ? 'Have an idea but don\'t know how to write it properly?\nTry our AI content generation feature from your original idea!'
                  : 'Have an idea but don\'t know how to write it properly?\nTry our AI content generation feature from your original idea!'
              }
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{
                width: '100%',
                minHeight: '160px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1.5px solid rgba(0,0,0,0.09)',
                backgroundColor: 'rgba(255,255,255,0.8)',
                fontSize: '13px',
                color: '#1e1e1e',
                fontFamily: 'Satoshi, system-ui, sans-serif',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                lineHeight: '1.6',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => { e.target.style.borderColor = aiEnabled ? '#22c55e' : '#FE7216'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.09)'; }}
            />

            {/* AI Prompt Row */}
            {aiEnabled && (
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                animation: 'fadeSlideIn 0.25s ease',
              }}>
                <input
                  type="text"
                  placeholder="Manually enter your prompt or choose save ones"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid rgba(0,0,0,0.09)',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    fontSize: '13px',
                    color: '#1e1e1e',
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#22c55e'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.09)'; }}
                />
                <button
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #FE7216 0%, #f59e0b 100%)',
                    color: '#fff',
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 14px rgba(254,114,22,0.35)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(254,114,22,0.45)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(254,114,22,0.35)'; }}
                >
                  {/* Sparkle icon */}
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M6.5 1L7.5 5.5L12 6.5L7.5 7.5L6.5 12L5.5 7.5L1 6.5L5.5 5.5L6.5 1Z" fill="white" />
                  </svg>
                  Generate
                </button>
              </div>
            )}

            {/* Media + Action row */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginTop: '4px' }}>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  flex: 1,
                  minHeight: '100px',
                  border: `2px dashed ${isDragging ? '#FE7216' : 'rgba(0,0,0,0.12)'}`,
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  backgroundColor: isDragging ? 'rgba(254,114,22,0.04)' : 'rgba(255,255,255,0.4)',
                  transition: 'border-color 0.2s ease, background-color 0.2s ease',
                  padding: '16px',
                  boxSizing: 'border-box',
                  height: '139px'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                {/* Upload icon */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(254,114,22,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="10" width="14" height="4" rx="1.5" stroke="#FE7216" strokeWidth="1.4" />
                    <path d="M8 1V9M5 4L8 1L11 4" stroke="#FE7216" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {mediaFiles.length > 0 ? (
                  <span style={{ fontSize: '12px', color: '#1e1e1e', fontFamily: 'Satoshi, system-ui, sans-serif', fontWeight: '600' }}>
                    {mediaFiles.length} file{mediaFiles.length > 1 ? 's' : ''} selected
                  </span>
                ) : (
                  <>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e1e1e', fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                      Drag &amp; drop media here
                    </span>
                    <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                      or click to browse files (JPEG, PNG up to 50MB)
                    </span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '140px' }}>
                <button
                  style={{
                    padding: '12px 0',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #FE7216 0%, #f59e0b 100%)',
                    color: '#fff',
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(254,114,22,0.3)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(254,114,22,0.42)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(254,114,22,0.3)'; }}
                >
                  Submit
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2.5 6.5H10.5M7 3L10.5 6.5L7 10" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <button
                  style={{
                    padding: '10px 0',
                    borderRadius: '10px',
                    border: '1.5px solid rgba(0,0,0,0.1)',
                    background: 'rgba(255,255,255,0.8)',
                    color: '#1e1e1e',
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background-color 0.15s ease, border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(254,114,22,0.05)'; e.currentTarget.style.borderColor = '#FE7216'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; }}
                >
                  Save as Draft
                </button>

                <button
                  style={{
                    padding: '10px 0',
                    borderRadius: '10px',
                    border: '1.5px solid rgba(0,0,0,0.1)',
                    background: 'rgba(255,255,255,0.8)',
                    color: '#1e1e1e',
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background-color 0.15s ease, border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(254,114,22,0.05)'; e.currentTarget.style.borderColor = '#FE7216'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; }}
                >
                  Apply GEO/SEO
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{
          width: '25%',
          borderRadius: '15px',
          padding: '0px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: componentGap
        }}>

          {/* Knowledge Base Card */}
          <div 
          style={{
            backgroundColor: 'rgba(255,255,255,0.5)',
            borderRadius: '15px',
            padding: '15px',
            boxSizing: 'border-box',
            height: '325px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e1e1e', fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                Knowledge Base
              </span>
              <button style={{
                background: 'none', border: 'none', fontSize: '12px', color: '#5c5c5c',
                cursor: 'pointer', fontFamily: 'Satoshi, system-ui, sans-serif',
                display: 'flex', alignItems: 'center', gap: '3px', padding: 0,
              }}>
                Add
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M4 2.5L6.5 5L4 7.5" stroke="#5c5c5c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'Satoshi, system-ui, sans-serif', marginBottom: '8px' }}>
              {aiEnabled ? 'choose your context' : 'enable AI to use'}
            </div>

              <div 
                  className="custom-scroll"
                  style={{
                    flex: 1,           
                    overflowY: 'auto',  
                    paddingRight: '4px',
                    marginBottom: '10px'
                  }}
                >
                  {kbItems.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => aiEnabled && toggleKB(item.id)}
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
                      <span
                        style={{
                          fontFamily: 'Satoshi',
                          fontSize: '13px'
                        }}
                      >{item.title}</span>
                    
                      <div
                        style={{
                          marginLeft: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          disabled={!aiEnabled}
                          onChange={() => toggleKB(item.id)}
                          style={{
                            cursor: aiEnabled ? 'pointer' : 'not-allowed',
                            accentColor: '#fcfcfc'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
                  <SearchBar placeholder="Search" />
                </div>
          </div>

          {/* Prompt Template Card */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.5)',
            borderRadius: '16px',
            padding: '16px',
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e1e1e', fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                Prompt Template
              </span>
              <button style={{
                background: 'none', border: 'none', fontSize: '12px', color: '#5c5c5c',
                cursor: 'pointer', fontFamily: 'Satoshi, system-ui, sans-serif',
                display: 'flex', alignItems: 'center', gap: '3px', padding: 0,
              }}>
                Add
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M4 2.5L6.5 5L4 7.5" stroke="#5c5c5c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'Satoshi, system-ui, sans-serif', marginBottom: '8px' }}>
              choose your desired prompt
            </div>
            
            
            {promptTemplates.map((pt) => (
              <PromptItem key={pt.id} title={pt.title} description={pt.description} />
            ))}

            <SearchBar placeholder="Search" />
          </div>
        </div>
      </div>

      {/* Fade-slide animation */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
