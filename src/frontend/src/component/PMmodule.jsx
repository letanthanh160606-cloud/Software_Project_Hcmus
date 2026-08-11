import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import facebook from '../assets/fblg.png';
import linkedin from '../assets/linkedinlg.png';

// Dynamic Posts Data from Backend API
const businessPosts = [];

const individualPosts = [];

// ─────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────

const STATUS_STYLES = {
  Published: { bg: '#ECFDF3', color: '#12B76A', border: '1px solid #A6F4C5' },
  Failed:    { bg: '#FEF3F2', color: '#F04438', border: '1px solid #FECDCA' },
  Pending:   { bg: '#FFF6ED', color: '#F79009', border: '1px solid #FEDF89' },
  Drafts:    { bg: '#F2F4F7', color: '#667085', border: '1px solid #D0D5DD' },
  Rejected:  { bg: '#FEF3F2', color: '#D92D20', border: '1px solid #FECDCA' },
};

function getStatusColor(status) {
  return (STATUS_STYLES[status] || STATUS_STYLES.Drafts).color;
}

function PostThumbnail({ title , post, user }) {

  const isOwnerRole = user?.account_type === 'individual' ? true : post?.belongto === user?.role;
  const indicatorColor = isOwnerRole 
    ? getStatusColor(post?.status) 
    : 'rgba(52, 152, 219, 1)';

  return (
    <div
      style={{
        width: '35px',
        height: '35px',
        borderRadius: '5px',
        backgroundColor: 'lightgrey',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
        position: 'relative',
      }}
    >  
      <span style={{ fontSize: '20px', opacity: 1 }}>📄</span>

        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: '4px',
            backgroundColor: indicatorColor,
          }}
        />
    </div>
  );
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Drafts;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span
        style={{
          padding: '3px 10px',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: '600',
          backgroundColor: style.bg,
          color: style.color,
          border: style.border,
          fontFamily: 'Satoshi, system-ui, sans-serif',
          whiteSpace: 'nowrap',
        }}
      >
        {status || 'Drafts'}
      </span>
      {status === 'Failed' && (
        <span style={{ color: '#F04438', fontSize: '14px', lineHeight: 1 }}>⚠</span>
      )}
    </div>
  );
}

function PlatformIcons({ platforms }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {platforms.includes('linkedin') && (
        <img
          src={linkedin}
          alt="LinkedIn"
          style={{
            width: '16px',
            height: '16px',
            objectFit: 'contain'
          }}
        />
      )}
      {platforms.includes('facebook') && (
        <img
          src={facebook}
          alt="Facebook"
          style={{
            width: '16px',
            height: '16px',
            objectFit: 'contain'
          }}
        />
      )}
    </div>
  );
}

function FilterTab({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 16px',
        borderRadius: '20px',
        border: isActive ? 'none' : '1px solid rgba(0,0,0,0.1)',
        backgroundColor: isActive ? '#FE7216' : 'rgba(255,255,255,0.6)',
        color: isActive ? '#FFFFFF' : '#5C5C5C',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Satoshi, system-ui, sans-serif',
        transition: 'all 0.2s ease',
        outline: 'none',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'rgba(254,114,22,0.1)';
          e.currentTarget.style.borderColor = 'rgba(254,114,22,0.3)';
          e.currentTarget.style.color = '#FE7216';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.6)';
          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
          e.currentTarget.style.color = '#5C5C5C';
        }
      }}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────
// Sort Menu Component
// ─────────────────────────────────────────────────────

function SortMenu({ sortBy, onSort }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions = [
    { key: 'date-desc', label: 'Date (Newest)' },
    { key: 'date-asc', label: 'Date (Oldest)' },
    { key: 'engagement-desc', label: 'Engagement (High)' },
    { key: 'engagement-asc', label: 'Engagement (Low)' },
    { key: 'title-asc', label: 'Title (A-Z)' },
    { key: 'title-desc', label: 'Title (Z-A)' },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '10px',
          border: '1px solid rgba(0,0,0,0.12)',
          backgroundColor: 'rgba(255,255,255,0.7)',
          color: '#1E1E1E',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          fontFamily: 'Satoshi, system-ui, sans-serif',
          transition: 'border-color 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(254,114,22,0.4)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)')}
      >
        Sort by ⇅
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '38px',
            right: 0,
            width: '180px',
            backgroundColor: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(20px)',
            borderRadius: '14px',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            padding: '6px',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                onSort(opt.key);
                setOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: sortBy === opt.key ? '700' : '500',
                color: sortBy === opt.key ? '#FE7216' : '#1E1E1E',
                backgroundColor: sortBy === opt.key ? 'rgba(254,114,22,0.06)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'Satoshi, system-ui, sans-serif',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (sortBy !== opt.key) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)';
              }}
              onMouseLeave={(e) => {
                if (sortBy !== opt.key) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {opt.label}
              {sortBy === opt.key && <span style={{ fontSize: '11px' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Main PMmodule Component
// ─────────────────────────────────────────────────────

export default function PMmodule({ user }) {
  const role = (user?.role || 'individual').toLowerCase();
  const accountType = (user?.account_type || 'personal').toLowerCase();
  const isBusiness = user?.account_type === 'business';

  const [activeFilter, setActiveFilter] = useState('All Posts');
  const [sortBy, setSortBy] = useState('date-desc');
  const [realPosts, setRealPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectedPlatforms, setConnectedPlatforms] = useState(['facebook']);
  const [primaryPlatform, setPrimaryPlatform] = useState('facebook');

  useEffect(() => {
    const fetchConnectedChannels = async () => {
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
        if (workspaceId) url += `?workspace_id=${workspaceId}`;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          const pList = (data.channels || []).map(c => c.platform);
          if (pList.length > 0) {
            setConnectedPlatforms(pList);
            setPrimaryPlatform(pList[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching connected channels in PMmodule:', err);
      }
    };
    fetchConnectedChannels();
  }, [user]);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const workspaceId = user?.workspace_id || user?.workspace?.workspace_uuid || null;

        let url = 'http://localhost:8000/posts';
        if (workspaceId) {
          url = `http://localhost:8000/workspaces/${workspaceId}/posts`;
        }

        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          const mapped = (Array.isArray(data) ? data : []).map((p) => {
            let statusLabel = 'Drafts';
            if (p.status === 'draft') statusLabel = 'Drafts';
            else if (p.status === 'pending_review') statusLabel = 'Pending';
            else if (p.status === 'rejected') statusLabel = 'Rejected';
            else if (p.status === 'ready_for_distribution' || p.status === 'published') statusLabel = 'Published';
            else if (p.status === 'failed') statusLabel = 'Failed';

            const createdDate = p.created_at
              ? new Date(p.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }) + ' - ' + new Date(p.created_at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—';

            return {
              id: p.id,
              title: p.title || 'Untitled Post',
              content: p.content || '',
              thumbnail: null,
              platforms: connectedPlatforms.length > 0 ? connectedPlatforms : ['facebook'],
              status: statusLabel,
              publishedDate: p.published_at || createdDate,
              engagement: 0,
              belongto: p.author_id === user?.users_uuid ? user?.role : 'member',
            };
          });
          setRealPosts(mapped);
        }
      } catch (err) {
        console.error('Error fetching posts in PMmodule:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user, connectedPlatforms]);

  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishToFacebook = async (postId) => {
    setIsPublishing(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const token = localStorage.getItem('token');
      const targetPlat = primaryPlatform || 'facebook';
      const res = await fetch(`http://localhost:8000/api/v1/distribution/channels/publish/${postId}?platform=${targetPlat}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Publish failed');
      }
      const platformName = data.platform === 'linkedin' ? 'LinkedIn' : 'Facebook';
      toast.success(data.message || `Post published to ${platformName} successfully!`);
      const publishedUrl = data.linkedin_post_url || data.facebook_post_url;
      if (publishedUrl) {
        setSelectedPost((prev) => prev ? { 
          ...prev, 
          status: 'Published', 
          facebook_post_url: publishedUrl,
          linkedin_post_url: publishedUrl
        } : null);
      } else {
        setSelectedPost(null);
      }
      // Reload posts list
      const savedUserStr = localStorage.getItem('user');
      const parsedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      const workspaceId = user?.workspace_id || parsedUser?.workspace_id || null;
      let url = 'http://localhost:8000/posts';
      if (workspaceId) url = `http://localhost:8000/workspaces/${workspaceId}/posts`;
      const reloadRes = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (reloadRes.ok) {
        const reloadData = await reloadRes.json();
        setRealPosts((Array.isArray(reloadData) ? reloadData : []).map(p => ({
          id: p.id,
          title: p.title || 'Untitled Post',
          content: p.content || '',
          thumbnail: null,
          platforms: ['facebook'],
          status: p.status === 'ready_for_distribution' ? 'Published' : 'Drafts',
          publishedDate: p.published_at ? new Date(p.published_at).toLocaleString() : '—',
          engagement: 0,
          belongto: p.author_id === user?.users_uuid ? user?.role : 'member',
        })));
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        toast.error('Quá thời gian chờ phản hồi từ máy chủ (Timeout 30s). Vui lòng thử lại!');
      } else if (err.message === 'Failed to fetch') {
        toast.error('Không thể kết nối đến Máy chủ (Backend). Vui lòng kiểm tra lại dịch vụ Backend!');
      } else {
        toast.error(err.message || 'Lỗi khi xuất bản bài viết');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const filters = ['All Posts', 'Drafts', 'Pending', 'Rejected', 'Published', 'Failed'];

  // Dynamic dataset from Backend API
  const rawPosts = realPosts;

  // Apply status filter
  const filteredPosts =
    activeFilter === 'All Posts'
      ? rawPosts
      : rawPosts.filter((p) => p.status === activeFilter);

  // Apply sorting
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc': {
        if (a.publishedDate === '—') return 1;
        if (b.publishedDate === '—') return -1;
        return new Date(b.publishedDate.replace(' - ', ' ')) - new Date(a.publishedDate.replace(' - ', ' '));
      }
      case 'date-asc': {
        if (a.publishedDate === '—') return 1;
        if (b.publishedDate === '—') return -1;
        return new Date(a.publishedDate.replace(' - ', ' ')) - new Date(b.publishedDate.replace(' - ', ' '));
      }
      case 'engagement-desc':
        return b.engagement - a.engagement;
      case 'engagement-asc':
        return a.engagement - b.engagement;
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  const [selectedPost, setSelectedPost] = useState(null);

  const handleRowClick = (post) => {
    setSelectedPost(post);
  };

  return (
    <div
      style={{
        width: '97%',
        fontFamily: 'Satoshi, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: '0px',
        padding: '0px',
        boxSizing: 'border-box',
      }}
    >
      {/* Main Container */}
      <div
        style={{
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '20px',
          padding: '20px',
          boxSizing: 'border-box',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxHeight: 'calc(100vh - 94px)',
        }}
      >
        {/* Title */}
        <h2
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '700',
            color: '#443e36',
          }}
        >
          Post Activity
        </h2>
        <div style={{
            gap: '20px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(255,255,255,0.5)',
            borderRadius: '15px',
            padding: '15px',
            height: '100%',
            overflowY: 'auto'
        }}>
            {/* Filter Tabs + Sort Row */}
            <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
            >
            {/* Filter Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {filters.map((f) => (
                <FilterTab
                    key={f}
                    label={f}
                    isActive={activeFilter === f}
                    onClick={() => setActiveFilter(f)}
                />
                ))}
            </div>

            {/* Sort Button */}
            <SortMenu sortBy={sortBy} onSort={setSortBy} />
            </div>

            {/* Table Header */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0
            }}>
                <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: isBusiness
                    ? '2.5fr 0.8fr 0.8fr 1.5fr 0.8fr'
                    : '3fr 0.8fr 0.8fr 1.5fr 0.8fr',
                    padding: '0 16px 10px 16px',
                    marginBottom: '0px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#7E7A72',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
                }}
                >
                <div>Post Preview</div>
                <div>Platforms</div>
                <div>Status</div>
                <div>Published Date</div>
                <div style={{ textAlign: 'right' }}>Engagement</div>
                </div>

                {/* Table Body (Scrollable) */}
                <div
                className="custom-scroll"
                style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                }}
                >
                {sortedPosts.length > 0 ? (
                    sortedPosts.map((post) => (
                    <div
                        key={post.id}
                        onClick={() => handleRowClick(post)}
                        style={{
                        display: 'grid',
                        gridTemplateColumns: isBusiness
                            ? '2.5fr 0.8fr 0.8fr 1.5fr 0.8fr'
                            : '3fr 0.8fr 0.8fr 1.5fr 0.8fr',
                        padding: '7px 16px',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                        position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >   
                        {/* Post Preview: Thumbnail + Title + Workspace Tag */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <PostThumbnail post={post} user={user}/>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                            <span
                            style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#1E1E1E',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                            >
                            {post.title}
                            </span> 
                        </div>
                        </div>

                        {/* Platforms */}
                        <div>
                        <PlatformIcons platforms={post.platforms} />
                        </div>

                        {/* Status */}
                        <div>
                        <StatusBadge status={post.status} />
                        </div>

                        {/* Published Date */}
                        <div
                        style={{
                            fontSize: '12px',
                            color: '#7E7A72',
                            fontWeight: '500',
                        }}
                        >
                        {post.publishedDate}
                        </div>

                        {/* Engagement */}
                        <div
                        style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#1E1E1E',
                            textAlign: 'right',
                        }}
                        >
                        {post.engagement > 0 ? post.engagement.toLocaleString() : '—'}
                        </div>
                    </div>
                    ))
                ) : (
                    <div
                    style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#7E7A72',
                        fontSize: '14px',
                        fontWeight: '500',
                    }}
                    >
                    No posts found for "{activeFilter}" filter.
                    </div>
                )}
                </div>
            </div>
        </div>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div
          onClick={() => setSelectedPost(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              width: '90%',
              maxWidth: '560px',
              padding: '24px 28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', pb: '12px', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <StatusBadge status={selectedPost.status} />
                <span style={{ fontSize: '12px', color: '#64748b' }}>Created: {selectedPost.publishedDate}</span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: '#64748b',
                }}
              >
                ✕
              </button>
            </div>

            {/* Post Title */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>
                Post Title
              </label>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                {selectedPost.title}
              </h3>
            </div>

            {/* Platforms */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>
                Target Platforms
              </label>
              <div style={{ marginTop: '6px' }}>
                <PlatformIcons platforms={selectedPost.platforms} />
              </div>
            </div>

            {/* Post Body Content */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>
                Content
              </label>
              <div
                style={{
                  marginTop: '6px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '14px',
                  color: '#334155',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  minHeight: '100px',
                  maxHeight: '240px',
                  overflowY: 'auto',
                }}
              >
                {selectedPost.content || selectedPost.title || 'No content provided.'}
              </div>
            </div>

            {/* Published Social Link */}
            {selectedPost.status === 'Published' && (
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#166534', letterSpacing: '0.5px' }}>
                  {primaryPlatform === 'linkedin' ? 'LinkedIn Post Link' : 'Facebook Post Link'}
                </label>
                <div style={{
                  marginTop: '6px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>🔗</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#166534' }}>
                        {primaryPlatform === 'linkedin' ? 'LinkedIn Channel' : 'Omni Laptop Shop'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#15803d', wordBreak: 'break-all' }}>
                        {selectedPost.linkedin_post_url || selectedPost.facebook_post_url || (primaryPlatform === 'linkedin' ? 'linkedin.com/feed/' : 'facebook.com/profile.php?id=61593303653577')}
                      </span>
                    </div>
                  </div>
                  <a
                    href={selectedPost.linkedin_post_url || selectedPost.facebook_post_url || (primaryPlatform === 'linkedin' ? 'https://www.linkedin.com/feed/' : 'https://www.facebook.com/profile.php?id=61593303653577')}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      backgroundColor: primaryPlatform === 'linkedin' ? '#0A66C2' : '#1877F2',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '700',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: primaryPlatform === 'linkedin' ? '0 4px 10px rgba(10,102,194,0.25)' : '0 4px 10px rgba(24,119,242,0.25)',
                    }}
                  >
                    View on {primaryPlatform === 'linkedin' ? 'LinkedIn' : 'Facebook'} ↗
                  </a>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={() => setSelectedPost(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>

              <button
                onClick={() => handlePublishToFacebook(selectedPost.id)}
                disabled={isPublishing}
                style={{
                  padding: '8px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: primaryPlatform === 'linkedin'
                    ? 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)'
                    : 'linear-gradient(135deg, #1877F2 0%, #0056b3 100%)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: isPublishing ? 'not-allowed' : 'pointer',
                  opacity: isPublishing ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: primaryPlatform === 'linkedin'
                    ? '0 4px 12px rgba(10,102,194,0.3)'
                    : '0 4px 12px rgba(24,119,242,0.3)',
                }}
              >
                {isPublishing ? 'Publishing...' : `Publish to ${primaryPlatform === 'linkedin' ? 'LinkedIn' : 'Facebook'}`}
                {primaryPlatform === 'linkedin' ? (
                  <img src={linkedin} alt="LinkedIn" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
