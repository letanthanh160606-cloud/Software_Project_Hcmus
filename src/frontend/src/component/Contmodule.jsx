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
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1, paddingRight: '45px' }}>
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
      
      <span 
        title={title}
        style={{ 
          fontSize: '13px', 
          fontWeight: '500', 
          color: disabled ? '#777' : '#1e1e1e', 
          fontFamily: 'Satoshi, system-ui, sans-serif',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
          display: 'block'
        }}
      >
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

export default function Contmodule({ onNavigateTab }) {
  const componentGap = '20px';

  // Platforms data dynamically fetched from Backend
  const [platforms, setPlatforms] = useState([]);

  React.useEffect(() => {
    const fetchChannels = async () => {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
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

  // Knowledge Base & Prompt Templates loaded dynamically from Backend
  const [kbItems, setKbItems] = useState([]);
  const [promptTemplates, setPromptTemplates] = useState([]);

  React.useEffect(() => {
    const fetchPromptContextData = async () => {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      try {
        const kbRes = await fetch('http://localhost:8000/prompt-context/knowledge-bases', { headers });
        if (kbRes.ok) {
          const kbData = await kbRes.json();
          if (Array.isArray(kbData)) {
            setKbItems(kbData.map(item => {
              const cleanTitle = (item.title || 'Untitled Document').split('\n')[0].trim();
              return {
                id: item.id,
                title: cleanTitle.length > 80 ? cleanTitle.slice(0, 80) + '...' : cleanTitle,
                rawTitle: item.title,
                content: item.content || '',
                file_path: item.file_path || null,
                file_name: item.file_name || null,
                checked: false
              };
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching knowledge bases:', err);
      }

      try {
        const ptRes = await fetch('http://localhost:8000/prompt-context/prompt-templates', { headers });
        if (ptRes.ok) {
          const ptData = await ptRes.json();
          if (Array.isArray(ptData)) {
            setPromptTemplates(ptData.map(item => ({
              id: item.id,
              title: item.title,
              description: item.content || item.title
            })));
          }
        }
      } catch (err) {
        console.error('Error fetching prompt templates:', err);
      }
    };

    fetchPromptContextData();
  }, []);

  const handleDeleteKbItem = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this knowledge base document?')) return;
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8000/prompt-context/knowledge-bases/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok && res.status !== 204) {
        throw new Error(`Delete failed: ${res.status}`);
      }
      setKbItems(prev => prev.filter(k => k.id !== id));
      if (viewingKbItem?.id === id) setViewingKbItem(null);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Delete knowledge base failed.');
    }
  };

  // Media upload state
  const [draftPostId, setDraftPostId] = useState(() => (typeof window !== 'undefined' && window.crypto?.randomUUID ? window.crypto.randomUUID() : 'post_' + Math.random().toString(36).substring(2)));
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [selectedMediaFile, setSelectedMediaFile] = useState(null); // Raw file object
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null); // Public R2 URL
  const [mediaPreview, setMediaPreview] = useState(null); // Local blob URL for preview
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // SEO/GEO state
  const [isAnalyzingSeo, setIsAnalyzingSeo] = useState(false);
  const [seoResult, setSeoResult] = useState(null); // { seo_keywords[], hashtags[], geo_tip }
  const [showSeoPanel, setShowSeoPanel] = useState(false);
  const [appliedKeywords, setAppliedKeywords] = useState([]); // Track inserted keywords
  const [appliedHashtags, setAppliedHashtags] = useState([]); // Track inserted hashtags

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
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
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
          target_platforms: selectedPlatformNames.length > 0 ? selectedPlatformNames : (platforms.length > 0 ? [platforms[0].name.toLowerCase()] : []),
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

  // ──────────────────────────────────────────────────────────────────────────
  // Image Upload Handlers
  // ──────────────────────────────────────────────────────────────────────────

  const uploadFileToR2 = async (file) => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`http://localhost:8000/posts/upload-media-direct?post_id=${draftPostId}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to upload image');
    }

    const data = await res.json();
    return data.public_url;
  };

  const processMediaFile = async (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, WebP, and GIF images are supported.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be under 50MB.');
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setMediaPreview(localUrl);
    setSelectedMediaFile(file);
    setUploadedImageUrl(null);
    setIsUploadingMedia(true);

    try {
      const publicUrl = await uploadFileToR2(file);
      setUploadedImageUrl(publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleRemoveMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
    setSelectedMediaFile(null);
    setUploadedImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ──────────────────────────────────────────────────────────────────────────
  // SEO / GEO Handlers
  // ──────────────────────────────────────────────────────────────────────────

  const handleApplySEO = async () => {
    if (!title.trim() && !body.trim()) {
      toast.error('Please enter post content before applying GEO/SEO analysis.');
      return;
    }
    setIsAnalyzingSeo(true);
    setSeoResult(null);
    setShowSeoPanel(false);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const selectedPlatformNames = platforms
        .filter(p => p.selected)
        .map(p => p.name.toLowerCase());

      const res = await fetch('http://localhost:8000/posts/seo-suggest', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: title.trim() || null,
          content: body.trim() || null,
          target_platforms: selectedPlatformNames.length > 0 ? selectedPlatformNames : (platforms.length > 0 ? platforms.map(p => p.name.toLowerCase()) : []),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'SEO analysis failed');
      setSeoResult(data);
      setShowSeoPanel(true);
      setAppliedKeywords([]);
      setAppliedHashtags([]);
    } catch (err) {
      toast.error(err.message || 'GEO/SEO analysis failed');
    } finally {
      setIsAnalyzingSeo(false);
    }
  };

  const handleInsertKeyword = (keyword) => {
    if (appliedKeywords.includes(keyword)) return;
    setBody(prev => prev ? `${prev} ${keyword}` : keyword);
    setAppliedKeywords(prev => [...prev, keyword]);
  };

  const handleInsertHashtag = (tag) => {
    if (appliedHashtags.includes(tag)) return;
    setBody(prev => prev ? `${prev} ${tag}` : tag);
    setAppliedHashtags(prev => [...prev, tag]);
  };

  const handleApplyAllSEO = () => {
    if (!seoResult) return;
    const newKeywords = seoResult.seo_keywords.filter(k => !appliedKeywords.includes(k));
    const newHashtags = seoResult.hashtags.filter(h => !appliedHashtags.includes(h));
    const toInsert = [...newKeywords, ...newHashtags].join(' ');
    if (toInsert) setBody(prev => prev ? `${prev}\n\n${toInsert}` : toInsert);
    setAppliedKeywords(seoResult.seo_keywords);
    setAppliedHashtags(seoResult.hashtags);
    toast.success('All SEO keywords and hashtags applied!');
  };

  const handleCreatePost = async (statusType = 'pending_review') => {
    if (!title.trim() && !body.trim()) {
      toast.error('Please enter a title or content for your post.');
      return;
    }

    setIsSubmitting(true);
    try {
      // If user selected a file but it hasn't completed uploading, upload now
      let finalImageUrl = uploadedImageUrl;
      if (!finalImageUrl && selectedMediaFile) {
        try {
          finalImageUrl = await uploadFileToR2(selectedMediaFile);
          setUploadedImageUrl(finalImageUrl);
        } catch (uploadErr) {
          toast.error('Image upload failed: ' + (uploadErr.message || 'Please try uploading again'));
          setIsSubmitting(false);
          return;
        }
      }

      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
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
          id: (draftPostId && typeof draftPostId === 'string' && draftPostId.length === 36) ? draftPostId : null,
          workspace_id: workspaceId,
          title: title.trim() || 'Untitled Post',
          content: body.trim(),
          status: statusType,
          target_platforms: selectedPlatformNames.length > 0 ? selectedPlatformNames : (platforms.length > 0 ? [platforms[0].name.toLowerCase()] : []),
          seo_keywords: seoResult ? seoResult.seo_keywords : [],
          seo_hashtags: seoResult ? seoResult.hashtags : [],
          image_url: finalImageUrl || null,
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
        const newPostId = data.id || draftPostId;
        const selectedChannels = platforms.filter(p => p.selected);
        if (selectedChannels.length > 0) {
          const toastLoadingId = toast.loading('Publishing to selected channels...');
          try {
            const pubResults = await Promise.all(selectedChannels.map(async (ch) => {
              const pubRes = await fetch(`http://localhost:8000/api/v1/distribution/channels/publish/${newPostId}?platform=${ch.name.toLowerCase()}&channel_id=${ch.id}`, {
                method: 'POST',
                headers: headers,
              });
              return await pubRes.json();
            }));
            toast.dismiss(toastLoadingId);
            const pubNames = selectedChannels.map(c => c.account || c.name).join(', ');
            toast.success(`Published successfully to ${pubNames}!`);
          } catch (pubErr) {
            toast.dismiss(toastLoadingId);
            console.warn('Auto publish notice:', pubErr);
            toast.success('Post created (Ready in Post Management)!');
          }
        } else {
          toast.success('Post created successfully!');
        }
      } else {
        toast.success('Post submitted for review successfully (Pending)!');
      }
      // Reset all state on success & assign fresh draftPostId
      setDraftPostId(typeof window !== 'undefined' && window.crypto?.randomUUID ? window.crypto.randomUUID() : 'post_' + Math.random().toString(36).substring(2));
      setTitle('');
      setBody('');
      handleRemoveMedia();
      setSeoResult(null);
      setShowSeoPanel(false);
      setAppliedKeywords([]);
      setAppliedHashtags([]);
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
    if (files.length > 0) processMediaFile(files[0]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) processMediaFile(files[0]);
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
              onDragOver={(e) => { e.preventDefault(); if (!mediaPreview) setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !mediaPreview && fileInputRef.current?.click()}
              style={{
                flex: 1,
                minHeight: '100px',
                border: mediaPreview
                  ? '2px solid rgba(0,0,0,0.08)'
                  : `2px dashed ${isDragging ? '#FE7216' : 'rgba(0,0,0,0.12)'}`,
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: mediaPreview ? 'default' : 'pointer',
                backgroundColor: isDragging ? 'rgba(254,114,22,0.04)' : (mediaPreview ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.4)'),
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
                padding: '10px',
                boxSizing: 'border-box',
                height: '139px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {/* State 1: Image preview */}
              {mediaPreview ? (
                <>
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      borderRadius: '8px',
                    }}
                  />
                  {/* Overlay status badge */}
                  {isUploadingMedia && (
                    <div style={{
                      position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
                      background: 'rgba(0,0,0,0.65)', color: '#fff', borderRadius: '20px',
                      padding: '3px 10px', fontSize: '11px', fontFamily: 'Satoshi, system-ui, sans-serif',
                      whiteSpace: 'nowrap',
                    }}>
                      Uploading...
                    </div>
                  )}
                  {!isUploadingMedia && uploadedImageUrl && (
                    <div style={{
                      position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
                      background: 'rgba(34,197,94,0.85)', color: '#fff', borderRadius: '20px',
                      padding: '3px 10px', fontSize: '11px', fontFamily: 'Satoshi, system-ui, sans-serif',
                      whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Uploaded
                    </div>
                  )}
                  {/* Remove button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveMedia(); }}
                    style={{
                      position: 'absolute', top: '6px', right: '6px',
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: 'rgba(0,0,0,0.55)', border: 'none',
                      color: '#fff', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </>
              ) : (
                /* State 2: Empty drop zone */
                <>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    backgroundColor: 'rgba(254,114,22,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="10" width="14" height="4" rx="1.5" stroke="#FE7216" strokeWidth="1.4" />
                      <path d="M8 1V9M5 4L8 1L11 4" stroke="#FE7216" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
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
                disabled={isSubmitting || isUploadingMedia}
                style={{
                  padding: '12px 0',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #FE7216 0%, #f59e0b 100%)',
                  color: '#fff',
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: (isSubmitting || isUploadingMedia) ? 'not-allowed' : 'pointer',
                  opacity: (isSubmitting || isUploadingMedia) ? 0.7 : 1,
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
                {isSubmitting ? 'Submitting...' : isUploadingMedia ? 'Uploading media...' : 'Submit'}
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2.5 6.5H10.5M7 3L10.5 6.5L7 10" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                onClick={() => handleCreatePost('draft')}
                disabled={isSubmitting || isUploadingMedia}
                style={{
                  padding: '10px 0',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(0,0,0,0.1)',
                  background: 'rgba(255,255,255,0.8)',
                  color: '#1e1e1e',
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: (isSubmitting || isUploadingMedia) ? 'not-allowed' : 'pointer',
                  opacity: (isSubmitting || isUploadingMedia) ? 0.7 : 1,
                  width: '100%',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(254,114,22,0.05)'; e.currentTarget.style.borderColor = '#FE7216'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; }}
              >
                {isUploadingMedia ? 'Uploading...' : 'Save as Draft'}
              </button>

              <button
                onClick={handleApplySEO}
                disabled={isAnalyzingSeo}
                style={{
                  padding: '10px 0',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(0,0,0,0.1)',
                  background: isAnalyzingSeo ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.8)',
                  color: isAnalyzingSeo ? '#9ca3af' : '#1e1e1e',
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: isAnalyzingSeo ? 'not-allowed' : 'pointer',
                  width: '100%',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                }}
                onMouseEnter={(e) => { if (!isAnalyzingSeo) { e.currentTarget.style.backgroundColor = 'rgba(254,114,22,0.05)'; e.currentTarget.style.borderColor = '#FE7216'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isAnalyzingSeo ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; }}
              >
                {isAnalyzingSeo ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="6" cy="6" r="5" stroke="#9ca3af" strokeWidth="2" strokeDasharray="8 24" />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="5" cy="5" r="4" stroke="#1e1e1e" strokeWidth="1.4" />
                      <path d="M8.5 8.5L11 11" stroke="#1e1e1e" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    Apply GEO/SEO
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── SEO / GEO Result Panel ── */}
          {showSeoPanel && seoResult && (
            <div style={{
              borderRadius: '14px',
              border: '1.5px solid rgba(254,114,22,0.25)',
              backgroundColor: 'rgba(254,114,22,0.04)',
              padding: '16px',
              animation: 'fadeSlideIn 0.25s ease',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle cx="6.5" cy="6.5" r="5.5" stroke="#FE7216" strokeWidth="1.5" />
                    <path d="M11 11L14 14" stroke="#FE7216" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e1e1e', fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                    SEO / GEO Suggestions
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={handleApplyAllSEO}
                    style={{
                      padding: '5px 12px', borderRadius: '8px',
                      border: '1.5px solid #FE7216', background: '#FE7216',
                      color: '#fff', fontSize: '12px', fontWeight: '600',
                      fontFamily: 'Satoshi, system-ui, sans-serif', cursor: 'pointer',
                    }}
                  >
                    Apply All
                  </button>
                  <button
                    onClick={() => setShowSeoPanel(false)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#9ca3af', fontSize: '18px', lineHeight: 1, padding: '0 2px',
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* SEO Keywords */}
              {seoResult.seo_keywords.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#7c7c7c', fontFamily: 'Satoshi, system-ui, sans-serif', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    SEO Keywords
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {seoResult.seo_keywords.map((kw, i) => {
                      const applied = appliedKeywords.includes(kw);
                      return (
                        <button
                          key={i}
                          onClick={() => handleInsertKeyword(kw)}
                          title={applied ? 'Already inserted' : 'Click to insert into body'}
                          style={{
                            padding: '4px 10px', borderRadius: '20px',
                            border: applied ? '1.5px solid #22c55e' : '1.5px solid rgba(0,0,0,0.12)',
                            background: applied ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.9)',
                            color: applied ? '#16a34a' : '#1e1e1e',
                            fontSize: '12px', fontFamily: 'Satoshi, system-ui, sans-serif',
                            cursor: applied ? 'default' : 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {applied && '✓ '}{kw}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Hashtags */}
              {seoResult.hashtags.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#7c7c7c', fontFamily: 'Satoshi, system-ui, sans-serif', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Hashtags
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {seoResult.hashtags.map((tag, i) => {
                      const applied = appliedHashtags.includes(tag);
                      return (
                        <button
                          key={i}
                          onClick={() => handleInsertHashtag(tag)}
                          title={applied ? 'Already inserted' : 'Click to insert into body'}
                          style={{
                            padding: '4px 10px', borderRadius: '20px',
                            border: applied ? '1.5px solid #3b82f6' : '1.5px solid rgba(59,130,246,0.3)',
                            background: applied ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.04)',
                            color: applied ? '#1d4ed8' : '#3b82f6',
                            fontSize: '12px', fontFamily: 'Satoshi, system-ui, sans-serif',
                            cursor: applied ? 'default' : 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {applied && '✓ '}{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* GEO Tip */}
              {seoResult.geo_tip && (
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  borderRadius: '10px',
                  border: '1px solid rgba(0,0,0,0.07)',
                  padding: '10px 12px',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: '15px', flexShrink: 0 }}>💡</span>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#FE7216', fontFamily: 'Satoshi, system-ui, sans-serif', marginBottom: '3px' }}>
                      GEO TIP
                    </div>
                    <div style={{ fontSize: '12px', color: '#4b5563', fontFamily: 'Satoshi, system-ui, sans-serif', lineHeight: '1.5' }}>
                      {seoResult.geo_tip}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
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
              onClick={() => onNavigateTab?.('Prompt & Context')}
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
                    justifyContent: 'space-between',
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
                    position: 'relative',
                    overflow: 'hidden'
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
            {kbItems.filter(item => item.title.toLowerCase().includes(kbSearch.toLowerCase()) || (item.content || '').toLowerCase().includes(kbSearch.toLowerCase())).length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '30px 10px',
                fontSize: '12px',
                color: '#9ca3af',
                fontFamily: 'Satoshi, system-ui, sans-serif'
              }}>
                No knowledge base documents found.
              </div>
            )}
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
              onClick={() => onNavigateTab?.('Prompt & Context')}
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
          {promptTemplates.filter(pt => pt.title.toLowerCase().includes(promptSearch.toLowerCase()) || pt.description.toLowerCase().includes(promptSearch.toLowerCase())).length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '24px 10px',
              fontSize: '12px',
              color: '#9ca3af',
              fontFamily: 'Satoshi, system-ui, sans-serif'
            }}>
              No prompt templates found.
            </div>
          )}

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
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '28px',
            width: '480px',
            maxWidth: '90vw',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            fontFamily: 'Satoshi, system-ui, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e1e1e' }}>{viewingKbItem.title}</h3>
              <button 
                onClick={() => setViewingKbItem(null)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#7c7c7c' }}
              >
                ✕
              </button>
            </div>
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '14px',
              padding: '14px 16px',
              fontSize: '13px',
              color: '#334155',
              lineHeight: '1.6',
              maxHeight: '260px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap'
            }} className="custom-scroll">
              {viewingKbItem.content || (
                <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Không có nội dung văn bản trực tiếp. Vui lòng mở tệp đính kèm bên dưới.</span>
              )}
            </div>

            {viewingKbItem.file_path && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Attachment:</span>
                <a
                  href={viewingKbItem.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#C2410C',
                    backgroundColor: '#FFF7ED',
                    border: '1px solid #FE7216',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    textDecoration: 'none'
                  }}
                >
                  📎 {viewingKbItem.file_name || 'Open file'}
                </a>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <button
                onClick={(e) => handleDeleteKbItem(e, viewingKbItem.id)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid #fecaca',
                  backgroundColor: '#fef2f2',
                  color: '#ef4444',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Delete
              </button>
              <button
                onClick={() => setViewingKbItem(null)}
                style={{
                  padding: '10px 22px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#FE7216',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(254,114,22,0.3)'
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
