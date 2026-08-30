import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
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
          transition: 'background-color 0.2s ease, border-color 0.2s ease'
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

function KBItem({ title, checked, disabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Checkbox dot */}
      <div
        style={{
          width: '14px',
          height: '14px',
          borderRadius: '4px',
          border: checked ? (disabled ? '2px solid #9ca3af' : '2px solid #FE7216') : '2px solid #d1d5db',
          backgroundColor: checked ? (disabled ? '#9ca3af' : '#FE7216') : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
      >
        {checked && (
          <svg 
            width="9" 
            height="7" 
            viewBox="0 0 9 7" 
            fill="none" 
            style={{ pointerEvents: 'none' }}
          >
            <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      
      <span style={{ fontSize: '13px', fontWeight: '500', color: disabled ? '#777' : '#1e1e1e', fontFamily: 'Satoshi, system-ui, sans-serif' }}>
        {title} 
      </span>
    </div>
  );
}

function PromptItem({ title, description, aiEnabled, selected, onSelect }) {
  return (
    <div 
      onClick={aiEnabled ? onSelect : undefined}
      style={{
        padding: '10px 12px',
        borderRadius: '10px',
        marginBottom: '6px',
        border: selected && aiEnabled ? '1.5px solid #22c55e' : '1px solid rgba(0,0,0,0.06)',
        backgroundColor: selected && aiEnabled ? 'rgba(34,197,94,0.06)' : 'transparent',
        cursor: aiEnabled ? 'pointer' : 'not-allowed',
        opacity: aiEnabled ? 1 : 0.5,
        transition: 'all 0.2s ease',
        userSelect: 'none'
      }}
    >
      <div style={{ fontSize: '13px', fontWeight: '600', color: aiEnabled ? '#1e1e1e' : '#777', fontFamily: 'Satoshi, system-ui, sans-serif' }}>
        {title}
      </div>
      <div style={{
        fontSize: '12px',
        color: aiEnabled ? '#7c7c7c' : '#aaa',
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


function SearchBar({ placeholder = 'Search', disabled = false, value = '', onChange }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: '10px',
      padding: '9px 14px',
      marginTop: '10px',
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'text',
      transition: 'opacity 0.2s ease',
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="6" cy="6" r="5" stroke="#9ca3af" strokeWidth="1.5" />
        <path d="M10 10L13 13" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          outline: 'none',
          fontSize: '13px',
          color: '#1e1e1e',
          fontFamily: 'Satoshi, system-ui, sans-serif',
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
    </div>
  );
}

export default function Contmodule() {
  const componentGap = '20px';

  // Platforms data dynamically fetched from Backend
  const [platforms, setPlatforms] = useState([]);

  React.useEffect(() => {
    const fetchChannels = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUserStr = localStorage.getItem('user');
        let workspaceId = null;
        if (savedUserStr) {
          try {
            const parsedUser = JSON.parse(savedUserStr);
            workspaceId = parsedUser?.workspace_id || parsedUser?.workspace?.workspace_uuid || null;
          } catch (e) {}
        }

        let url = 'http://localhost:8000/api/v1/distribution/channels';
        if (workspaceId) {
          url += `?workspace_id=${workspaceId}`;
        }

        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          const mapped = (data.channels || []).map((ch, idx) => ({
            id: ch.id,
            name: ch.platform === 'facebook' ? 'Facebook' : 'LinkedIn',
            account: ch.display_name,
            icon: ch.platform === 'facebook' ? facebook : linkedin,
            selected: idx === 0,
          }));
          setPlatforms(mapped);
        }
      } catch (err) {
        console.error('Error loading channels in Content module:', err);
      }
    };

    fetchChannels();
  }, []);

  const [aiEnabled, setAiEnabled] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [viewingKbItem, setViewingKbItem] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [kbSearch, setKbSearch] = useState('');
  const [promptSearch, setPromptSearch] = useState('');

  // Knowledge Base data with rich factual context
  const [kbItems, setKbItems] = useState([
    {
      id: 1,
      title: 'Omni Platform Overview',
      content: 'Omni Platforms is a unified social media management suite providing cross-platform publishing, RBAC approval workflows, analytics ingestion, and AI automation for enterprise teams and creators.',
      checked: false
    },
    {
      id: 2,
      title: 'Brand Voice Guidelines',
      content: 'Brand voice is innovative, professional, approachable, and data-backed. Use clear active voice, concise paragraphs, and meaningful business metrics.',
      checked: false
    },
    {
      id: 3,
      title: 'Q3 Product Roadmap',
      content: 'Key Q3 initiatives: Automated multi-account scheduling, granular engagement metrics tracking, real-time join request notifications, and AI post writer.',
      checked: false
    },
    {
      id: 4,
      title: 'Target Audience Persona',
      content: 'Audience consists of Marketing Managers, Social Media Specialists, Tech Founders, and Agency Leads seeking scalable automation.',
      checked: false
    },
    {
      id: 5,
      title: 'Security & Compliance FAQ',
      content: 'Enterprise-grade AES-256 Fernet token encryption, secure OAuth 2.0 flow, and dedicated PostgreSQL tenancy schema isolation.',
      checked: false
    }
  ]);

  // Prompt Templates with specialized instructions
  const promptTemplates = [
    {
      id: 1,
      title: 'LinkedIn Thought Leadership',
      description: 'Write an inspiring thought-leadership post for LinkedIn with a compelling hook, structured bullet points, and an engaging question to drive comments.'
    },
    {
      id: 2,
      title: 'Product Launch & Feature Announcement',
      description: 'Create an exciting product update post highlighting key user benefits, solving pain points, and inviting feedback.'
    },
    {
      id: 3,
      title: 'Educational Tip & Case Study',
      description: 'Break down an actionable industry tip or case study with structured takeaways and relevant hashtags.'
    }
  ];

  // Media drag state
  const [isDragging, setIsDragging] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleGenerateAI = async () => {
    if (!aiEnabled) {
      toast.error('Please enable AI toggle first.');
      return;
    }

    // 1. Gather all inputs
    const selectedTemplate = promptTemplates.find(pt => pt.id === selectedPromptId);
    const templateText = selectedTemplate ? selectedTemplate.description : null;
    const manualPromptText = promptInput.trim() || null;

    const checkedKbItems = kbItems.filter(k => k.checked);
    const kbContext = checkedKbItems.length > 0
      ? checkedKbItems.map(k => `${k.title}:\n${k.content || k.title}`).join('\n\n')
      : null;

    const existingTitleText = title.trim() || null;
    const existingContentText = body.trim() || null;

    const selectedPlatformNames = platforms
      .filter(p => p.selected)
      .map(p => p.name.toLowerCase());

    // 2. Validate empty state (Requirement: Show validation toast if all are empty)
    if (!templateText && !manualPromptText && !kbContext && !existingTitleText && !existingContentText) {
      toast.error('Please provide a prompt, select a Prompt Template or Knowledge Base, or enter some post content before generating.');
      return;
    }

    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('http://localhost:8000/posts/generate-ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt_template: templateText,
          manual_prompt: manualPromptText,
          knowledge_base_context: kbContext,
          existing_title: existingTitleText,
          existing_content: existingContentText,
          target_platforms: selectedPlatformNames.length > 0 ? selectedPlatformNames : ['linkedin'],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to generate AI content');
      }

      if (data.title && !title.trim()) {
        setTitle(data.title);
      }
      if (data.content) {
        setBody(data.content);
      }

      toast.success('Content generated with AI successfully!');
    } catch (err) {
      toast.error(err.message || 'AI generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreatePost = async (statusType = 'pending_review') => {
    if (!title.trim() && !body.trim()) {
      toast.error('Please enter a title or content for your post.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const savedUserStr = localStorage.getItem('user');
      let workspaceId = null;

      if (savedUserStr) {
        try {
          const parsedUser = JSON.parse(savedUserStr);
          workspaceId = parsedUser?.workspace_id || parsedUser?.workspace?.workspace_uuid || null;
        } catch (e) {
          console.error("Error parsing user for workspace_id", e);
        }
      }

      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const selectedPlatformNames = platforms
        .filter(p => p.selected)
        .map(p => p.name.toLowerCase());

      const response = await fetch('http://localhost:8000/posts', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          workspace_id: workspaceId,
          title: title.trim() || 'Untitled Post',
          content: body.trim(),
          status: statusType,
          target_platforms: selectedPlatformNames.length > 0 ? selectedPlatformNames : ['facebook'],
          seo_keywords: [],
          seo_hashtags: []
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const errMsg = data.detail ? (typeof data.detail === 'string' ? data.detail : data.detail[0]?.msg) : 'Failed to create post';
        throw new Error(errMsg);
      }

      if (statusType === 'draft' || data.status === 'draft') {
        toast.success('Post saved as draft successfully!');
      } else if (data.status === 'ready_for_distribution' || data.status === 'published') {
        toast.success('Post created successfully (Ready for distribution)!');
      } else {
        toast.success('Post submitted for review successfully (Pending)!');
      }
      setTitle('');
      setBody('');
      setMediaFiles([]);
    } catch (err) {
      toast.error(err.message || 'Error creating post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePlatform = (id) => {
    setPlatforms((prev) => prev.map((p) => p.id === id ? { ...p, selected: !p.selected } : p));
  };

  const toggleKB = (id) => {
    setKbItems((prev) => prev.map((k) => k.id === id ? { ...k, checked: !k.checked } : k));
  };

  const handleSelectPrompt = (pt) => {
    if (selectedPromptId === pt.id) {
      setSelectedPromptId(null);
    } else {
      setSelectedPromptId(pt.id);
      setPromptInput(pt.description);
    }
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
      width: '95%',
      gap: '20px',
      margin: '0px',
      padding: '0px'
    }}>
      {/* Right Panel (70%) */}
      <div style={{
        width: '75%',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '20px',
        padding: '20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
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
              Select Designated Platform
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
              paddingBottom: '4px' 
            }}
          >
            {platforms.length > 0 ? (
              platforms.map((p) => (
                <PlatformCard
                  key={p.id}
                  icon={p.icon}
                  platformName={p.name}
                  accountName={p.account}
                  selected={p.selected}
                  onToggle={() => togglePlatform(p.id)}
                />
              ))
            ) : (
              <div style={{ fontSize: '13px', color: '#8c8c8c', padding: '10px 0' }}>
                No connected platforms available. Connect a channel in Distribution to post.
              </div>
            )}
          </div>

          <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.07)', marginTop: '16px' }} />
        </div>

        {/* Post Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Post Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#5c5c5c', fontFamily: 'Satoshi, system-ui, sans-serif' }}>
              Post
            </span>
            <AIToggle enabled={aiEnabled} onToggle={() => setAiEnabled((prev) => !prev)} />
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
                : 'Enter your post content here...'
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
                placeholder="Manually enter your prompt or choose saved ones"
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
                type="button"
                onClick={handleGenerateAI}
                disabled={isGenerating}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isGenerating
                    ? '#9ca3af'
                    : 'linear-gradient(135deg, #FE7216 0%, #f59e0b 100%)',
                  color: '#fff',
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 14px rgba(254,114,22,0.35)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  opacity: isGenerating ? 0.8 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isGenerating) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(254,114,22,0.45)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(254,114,22,0.35)';
                }}
              >
                {/* Sparkle icon */}
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M6.5 1L7.5 5.5L12 6.5L7.5 7.5L6.5 12L5.5 7.5L1 6.5L5.5 5.5L6.5 1Z" fill="white" />
                </svg>
                {isGenerating ? 'Generating...' : '+ Generate'}
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
                onClick={() => handleCreatePost('pending_review')}
                disabled={isSubmitting}
                style={{
                  padding: '12px 0',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #FE7216 0%, #f59e0b 100%)',
                  color: '#fff',
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
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
                {isSubmitting ? 'Submitting...' : 'Submit'}
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2.5 6.5H10.5M7 3L10.5 6.5L7 10" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                onClick={() => handleCreatePost('draft')}
                disabled={isSubmitting}
                style={{
                  padding: '10px 0',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(0,0,0,0.1)',
                  background: 'rgba(255,255,255,0.8)',
                  color: '#1e1e1e',
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
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

      {/* Left Panel (25%): Knowledge Base & Prompt Template Widgets */}
      <div style={{
        width: '25%',
        borderRadius: '20px',
        padding: '0px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: componentGap
      }}>

        {/* Knowledge Base Card */}
        <div style={{
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
            <button
              disabled={!aiEnabled}
              style={{
                background: 'none', border: 'none', fontSize: '12px', color: aiEnabled ? '#5c5c5c' : '#9ca3af',
                cursor: aiEnabled ? 'pointer' : 'not-allowed', fontFamily: 'Satoshi, system-ui, sans-serif',
                display: 'flex', alignItems: 'center', gap: '3px', padding: 0,
                opacity: aiEnabled ? 1 : 0.6
              }}
            >
              Add
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M4 2.5L6.5 5L4 7.5" stroke={aiEnabled ? '#5c5c5c' : '#9ca3af'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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
              marginBottom: '10px',
            }}
          >
            {kbItems
              .filter(item => item.title.toLowerCase().includes(kbSearch.toLowerCase()) || (item.content || '').toLowerCase().includes(kbSearch.toLowerCase()))
              .map((item) => (
                <div 
                  key={item.id}
                  onClick={() => {
                    if (aiEnabled) toggleKB(item.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: 'rgba(254, 254, 254, 0.5)',
                    height: '25px',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    marginBottom: '8px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                    cursor: aiEnabled ? 'pointer' : 'not-allowed',
                    opacity: aiEnabled ? 1 : 0.5,
                    transition: 'all 0.2s ease',
                    userSelect: 'none',
                    position: 'relative'
                  }}  
                >
                  <KBItem title={item.title} checked={item.checked} disabled={!aiEnabled} />
                  
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (aiEnabled) setViewingKbItem(item);
                    }}
                    style={{ 
                      fontSize: '13px', 
                      color: aiEnabled ? '#FE7216' : '#9ca3af', 
                      fontWeight: '600', 
                      cursor: aiEnabled ? 'pointer' : 'not-allowed', 
                      fontFamily: 'Satoshi, system-ui, sans-serif',
                      flexShrink: 0,
                      position: 'absolute',
                      right: '15px'
                    }}
                  >
                    View
                  </span>
                </div>
            ))}
          </div>

          <div style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
            <SearchBar
              placeholder="Search Knowledge Base"
              disabled={!aiEnabled}
              value={kbSearch}
              onChange={(e) => setKbSearch(e.target.value)}
            />
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
            <button 
              disabled={!aiEnabled}
              style={{
                background: 'none', border: 'none', fontSize: '12px', color: aiEnabled ? '#5c5c5c' : '#9ca3af',
                cursor: aiEnabled ? 'pointer' : 'not-allowed', fontFamily: 'Satoshi, system-ui, sans-serif',
                display: 'flex', alignItems: 'center', gap: '3px', padding: 0,
                opacity: aiEnabled ? 1 : 0.6
              }}
            >
              Add
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M4 2.5L6.5 5L4 7.5" stroke={aiEnabled ? '#5c5c5c' : '#9ca3af'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'Satoshi, system-ui, sans-serif', marginBottom: '8px' }}>
            {aiEnabled ? 'choose your desired prompt' : 'enable AI to use'}
          </div>
          
          {promptTemplates
            .filter(pt => pt.title.toLowerCase().includes(promptSearch.toLowerCase()) || pt.description.toLowerCase().includes(promptSearch.toLowerCase()))
            .map((pt) => (
              <PromptItem 
                key={pt.id} 
                title={pt.title} 
                description={pt.description}
                aiEnabled={aiEnabled}
                selected={selectedPromptId === pt.id}
                onSelect={() => handleSelectPrompt(pt)}
              />
          ))}

          <SearchBar
            placeholder="Search Prompt Templates"
            disabled={!aiEnabled}
            value={promptSearch}
            onChange={(e) => setPromptSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Modal to view KB item detail when clicking View */}
      {viewingKbItem && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '24px 28px',
            width: '440px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            fontFamily: 'Satoshi, system-ui, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e1e1e' }}>{viewingKbItem.title}</h3>
              <button 
                onClick={() => setViewingKbItem(null)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888' }}
              >
                ✕
              </button>
            </div>
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '13px',
              color: '#334155',
              lineHeight: '1.6',
              maxHeight: '220px',
              overflowY: 'auto'
            }}>
              {viewingKbItem.content || `Knowledge base document contents and parameters for ${viewingKbItem.title}.`}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setViewingKbItem(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #FE7216 0%, #f59e0b 100%)',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
