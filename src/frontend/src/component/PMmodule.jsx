import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import facebook from '../assets/fblg.png';
import linkedin from '../assets/linkedinlg.png';

// Mock Data
const businessPosts = [
  {
    id: 1,
    title: 'Q3 Marketing Campaign Launch',
    thumbnail: null,
    platforms: ['linkedin', 'facebook'],
    status: 'Published',
    publishedDate: 'Oct 24, 2023 - 09:00 AM',
    engagement: 12456,
    belongto: 'member',
  },
  {
    id: 2,
    title: 'Weekly Industry Insights Infographic',
    thumbnail: null,
    platforms: ['linkedin', 'facebook'],
    status: 'Failed',
    publishedDate: 'Oct 24, 2023 - 09:00 AM',
    engagement: 12456,
    belongto: 'member',
  },
  {
    id: 3,
    title: 'Webinar Announcement: Future of AI',
    thumbnail: null,
    platforms: ['linkedin', 'facebook'],
    status: 'Pending',
    publishedDate: 'Oct 24, 2023 - 09:00 AM',
    engagement: 12456,
    belongto: 'manager',
  },
  {
    id: 4,
    title: 'Product Update: Version 3.0 Release',
    thumbnail: null,
    platforms: ['facebook'],
    status: 'Published',
    publishedDate: 'Oct 22, 2023 - 02:30 PM',
    engagement: 8320,
    belongto: 'manager',
  },
  {
    id: 5,
    title: 'Employee Spotlight: Engineering Team',
    thumbnail: null,
    platforms: ['linkedin'],
    status: 'Drafts',
    publishedDate: '—',
    engagement: 0,
    belongto: 'manager',
  },
  {
    id: 6,
    title: 'Holiday Greetings From Our Team',
    thumbnail: null,
    platforms: ['facebook', 'linkedin'],
    status: 'Rejected',
    publishedDate: '—',
    engagement: 0,
    belongto: 'member',
  },
  {
    id: 7,
    title: 'Case Study: Client Success Story',
    thumbnail: null,
    platforms: ['linkedin'],
    status: 'Published',
    publishedDate: 'Oct 20, 2023 - 10:00 AM',
    engagement: 19842,
    belongto: 'member',
  },
  {
    id: 8,
    title: 'Recruitment Drive: Open Positions',
    thumbnail: null,
    platforms: ['linkedin', 'facebook'],
    status: 'Pending',
    publishedDate: 'Oct 19, 2023 - 11:00 AM',
    engagement: 5210,
    belongto: 'member',
  },{
    id: 9,
    title: 'Recruitment Drive: Open Positions',
    thumbnail: null,
    platforms: ['linkedin', 'facebook'],
    status: 'Pending',
    publishedDate: 'Oct 19, 2023 - 11:00 AM',
    engagement: 5210,
    belongto: 'manager',
  },{
    id: 10,
    title: 'Recruitment Drive: Open Positions',
    thumbnail: null,
    platforms: ['linkedin', 'facebook'],
    status: 'Pending',
    publishedDate: 'Oct 19, 2023 - 11:00 AM',
    engagement: 5210,
    belongto: 'manager',
  },{
    id: 11,
    title: 'Recruitment Drive: Open Positions',
    thumbnail: null,
    platforms: ['linkedin', 'facebook'],
    status: 'Pending',
    publishedDate: 'Oct 19, 2023 - 11:00 AM',
    engagement: 5210,
    belongto: 'member',
  },{
    id: 12,
    title: 'Recruitment Drive: Open Positions',
    thumbnail: null,
    platforms: ['linkedin', 'facebook'],
    status: 'Pending',
    publishedDate: 'Oct 19, 2023 - 11:00 AM',
    engagement: 5210,
    belongto: 'manager',
  },{
    id: 13,
    title: 'Recruitment Drive: Open Positions',
    thumbnail: null,
    platforms: ['linkedin', 'facebook'],
    status: 'Pending',
    publishedDate: 'Oct 19, 2023 - 11:00 AM',
    engagement: 5210,
    belongto: 'manager',
  },
];

const individualPosts = [
  {
    id: 1,
    title: 'Q3 Marketing Campaign Launch',
    thumbnail: null,
    platforms: ['linkedin', 'facebook'],
    status: 'Published',
    publishedDate: 'Oct 24, 2023 - 09:00 AM',
    engagement: 12456,
  },
  {
    id: 2,
    title: 'Weekly Industry Insights Infographic',
    thumbnail: null,
    platforms: ['linkedin', 'facebook'],
    status: 'Failed',
    publishedDate: 'Oct 24, 2023 - 09:00 AM',
    engagement: 12456,
  },
  {
    id: 3,
    title: 'Webinar Announcement: Future of AI',
    thumbnail: null,
    platforms: ['linkedin', 'facebook'],
    status: 'Pending',
    publishedDate: 'Oct 24, 2023 - 09:00 AM',
    engagement: 12456,
  },
  {
    id: 4,
    title: 'My Personal Brand Update',
    thumbnail: null,
    platforms: ['linkedin'],
    status: 'Published',
    publishedDate: 'Oct 21, 2023 - 04:15 PM',
    engagement: 3980,
  },
  {
    id: 5,
    title: 'Portfolio Showcase: Recent Work',
    thumbnail: null,
    platforms: ['facebook'],
    status: 'Drafts',
    publishedDate: '—',
    engagement: 0,
  },
  {
    id: 6,
    title: 'Year In Review: Growth Summary',
    thumbnail: null,
    platforms: ['linkedin', 'facebook'],
    status: 'Rejected',
    publishedDate: '—',
    engagement: 0,
  },
  {
    id: 7,
    title: 'Year In Review: Growth Summary',
    thumbnail: null,
    platforms: ['linkedin', 'facebook'],
    status: 'Rejected',
    publishedDate: '—',
    engagement: 0,
  },
  {
    id: 8,
    title: 'Year In Review: Growth Summary',
    thumbnail: null,
    platforms: ['linkedin', 'facebook'],
    status: 'Rejected',
    publishedDate: '—',
    engagement: 0,
  },
  {
    id: 9,
    title: 'Year In Review: Growth Summary',
    thumbnail: null,
    platforms: ['linkedin', 'facebook'],
    status: 'Rejected',
    publishedDate: '—',
    engagement: 0,
  },
  {
    id: 10,
    title: 'Year sdsdsd Review: Growth Summary',
    thumbnail: null,
    platforms: ['linkedin', 'facebook'],
    status: 'Rejected',
    publishedDate: '—',
    engagement: 0,
  },
];

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

  const isOwnerRole = post?.belongto === user?.role;
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

  const filters = ['All Posts', 'Drafts', 'Pending', 'Rejected', 'Published', 'Failed'];

  // Choose dataset based on account type
  const rawPosts = isBusiness ? businessPosts : individualPosts;

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

  const handleRowClick = (post) => {
    toast(`Viewing post: ${post.title}`, { icon: '📋' });
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
                        {user?.role !== 'individual' && <PostThumbnail post={post} user={user}/>}
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
    </div>
  );
}
