import React, { useState, useEffect, useCallback } from 'react';

// ============================================================
// CONFIG
// ============================================================
// Đổi lại nếu backend chạy ở địa chỉ khác (hoặc dùng import.meta.env.VITE_API_URL)
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

function getAuthToken() {
  return localStorage.getItem('access_token');
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}


const suggestedTags = [
  { label: 'Technology', color: '#00bcd4' },
  { label: 'BA', color: '#ef4444' },
  { label: 'Marketing', color: '#a855f7' },
  { label: 'Writing', color: '#3b82f6' },
  { label: 'SEO', color: '#eab308' },
  { label: 'Financial', color: '#d946ef' },
  { label: 'Environment', color: '#22c55e' },
  { label: 'Guidelines', color: '#3b82f6' },
  { label: 'Product', color: '#8b5cf6' },
  { label: 'Persona', color: '#64748b' }
];

const FALLBACK_COLOR_PALETTE = [
  '#00bcd4', '#ef4444', '#a855f7', '#3b82f6', '#eab308',
  '#d946ef', '#22c55e', '#8b5cf6', '#64748b', '#f97316'
];

// Gán màu ổn định cho những tag chưa có trong suggestedTags (dựa theo hash tên tag)
function getColorForLabel(label) {
  const known = suggestedTags.find(t => t.label.toLowerCase() === label.toLowerCase());
  if (known) return known.color;
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % FALLBACK_COLOR_PALETTE.length;
  return FALLBACK_COLOR_PALETTE[idx];
}

// "Technology, SEO" -> [{label:'Technology', color:'#00bcd4'}, {label:'SEO', color:'#eab308'}]
function tagStringToTags(tagString) {
  if (!tagString) return [];
  return tagString
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(label => ({ label, color: getColorForLabel(label) }));
}

// [{label:'Technology'}, {label:'SEO'}] -> "Technology, SEO"
function tagsToTagString(tagsArray) {
  return (tagsArray || []).map(t => t.label).join(', ');
}

// Chuẩn hoá 1 record PromptTemplate trả về từ API sang dạng UI đang dùng
function mapApiTemplateToUi(item) {
  return {
    id: item.id,
    title: item.title,
    content: item.content,
    tags: tagStringToTags(item.tag),
    created_at: formatDate(item.created_at)
  };
}

// ============================================================
// API CALLS - Prompt Template (có backend thật: /prompt-context/prompt-templates)
// ============================================================
async function apiGetPromptTemplates() {
  const res = await fetch(`${API_BASE_URL}/prompt-context/prompt-templates`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    }
  });
  if (!res.ok) {
    throw new Error(`Get prompt templates failed: ${res.status}`);
  }
  const data = await res.json();
  return data.map(mapApiTemplateToUi);
}

async function apiCreatePromptTemplate({ title, content, tagString }) {
  const currentUser = getCurrentUser();
  const body = {
    title,
    content,
    tag: tagString || null,
    // Backend hiện tại luôn dùng current_user từ token để set created_by,
    // nhưng field này vẫn required trong schema nên vẫn phải gửi lên.
    created_by: currentUser?.users_uuid
  };

  const res = await fetch(`${API_BASE_URL}/prompt-context/prompt-templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    let detail = 'Create prompt template failed';
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  const created = await res.json();
  return mapApiTemplateToUi(created);
}

// Chuẩn hoá 1 record KnowledgeBase trả về từ API sang dạng UI đang dùng
function mapApiKnowledgeBaseToUi(item) {
  const filePath = item.file_path || null;
  const fileName = filePath ? decodeURIComponent(filePath.split('/').pop()) : (item.title || 'Chưa có file');
  return {
    id: item.id,
    title: item.title,
    file_path: filePath,
    file_name: fileName,
    file_size_bytes: item.file_size_bytes ?? null,
    mime_type: item.mime_type || '',
    tags: tagStringToTags(item.tag),
    created_at: formatDate(item.created_at)
  };
}

async function apiGetKnowledgeBases() {
  const res = await fetch(`${API_BASE_URL}/prompt-context/knowledge-bases`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    }
  });
  if (!res.ok) {
    throw new Error(`Get knowledge bases failed: ${res.status}`);
  }
  const data = await res.json();
  return data.map(mapApiKnowledgeBaseToUi);
}

async function apiCreateKnowledgeBase({ title, tagString, file }) {
  const currentUser = getCurrentUser();

  // QUAN TRỌNG: endpoint tạo record chỉ nhận JSON metadata (giống
  // KnowledgeBaseCreateRequest/TaskCreateRequest ở BE), KHÔNG nhận file nhị
  // phân trực tiếp. BE sẽ trả về record + 1 presigned upload_url (R2), sau đó
  // client tự PUT file thật lên URL đó ở bước 2. Gửi file dạng multipart/binary
  // thẳng vào endpoint JSON này là nguyên nhân gây lỗi UnicodeDecodeError khi
  // FastAPI cố decode bytes của validation error.
  const body = {
    title,
    tag: tagString || null,
    created_by: currentUser?.users_uuid,
    file_name: file ? file.name : null,
    mime_type: file ? (file.type || 'application/octet-stream') : null,
    file_size_bytes: file ? file.size : null
  };

  const res = await fetch(`${API_BASE_URL}/prompt-context/knowledge-bases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    let detail = 'Create context failed';
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  const created = await res.json();

  // Nếu BE trả kèm presigned upload_url (giống flow R2 dùng cho Task attachment),
  // thực hiện bước 2: PUT file thật lên URL đó.
  if (created.upload_url && file) {
    const putRes = await fetch(created.upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file
    });
    if (!putRes.ok) {
    throw new Error(`Upload file to R2 failed: ${putRes.status}`);
  }
  }
  

  return mapApiKnowledgeBaseToUi(created.knowledge_base || created);
}

export default function PromptContextmodule() {
  // --- STATE ---
  const [templates, setTemplates] = useState([]);
  const [contexts, setContexts] = useState([]);

  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [templateError, setTemplateError] = useState(null);
  const [submittingTemplate, setSubmittingTemplate] = useState(false);

  const [loadingContexts, setLoadingContexts] = useState(true);
  const [contextError, setContextError] = useState(null);
  const [submittingContext, setSubmittingContext] = useState(false);

  const [searchTemplate, setSearchTemplate] = useState('');
  const [searchContext, setSearchContext] = useState('');

  // Expanded views
  const [expandedTemplateId, setExpandedTemplateId] = useState(null);
  const [expandedContextId, setExpandedContextId] = useState(null);

  // Modals
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [showAddContext, setShowAddContext] = useState(false);

  // Form States
  const [newTplTitle, setNewTplTitle] = useState('');
  const [newTplContent, setNewTplContent] = useState('');
  const [selectedTplTags, setSelectedTplTags] = useState([]);

  const [newCtxTitle, setNewCtxTitle] = useState('');
  const [newCtxFile, setNewCtxFile] = useState(null); // chỉ 1 file duy nhất, khớp với BE (field file_path)
  const [selectedCtxTags, setSelectedCtxTags] = useState([]);

  // --- LOAD PROMPT TEMPLATES FROM API ---
  const loadPromptTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    setTemplateError(null);
    try {
      const list = await apiGetPromptTemplates();
      setTemplates(list);
    } catch (err) {
      console.error(err);
      setTemplateError('Load prompt template failed.');
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    loadPromptTemplates();
  }, [loadPromptTemplates]);

  // --- LOAD CONTEXT / KNOWLEDGE BASE FROM API ---
  const loadKnowledgeBases = useCallback(async () => {
    setLoadingContexts(true);
    setContextError(null);
    try {
      const list = await apiGetKnowledgeBases();
      setContexts(list);
    } catch (err) {
      console.error(err);
      setContextError('Không tải được danh sách context.');
    } finally {
      setLoadingContexts(false);
    }
  }, []);

  useEffect(() => {
    loadKnowledgeBases();
  }, [loadKnowledgeBases]);

  // --- HANDLERS ---
  const handleAddTemplate = async (e) => {
    e.preventDefault();
    if (!newTplTitle.trim() || !newTplContent.trim()) return;

    setSubmittingTemplate(true);
    try {
      const created = await apiCreatePromptTemplate({
        title: newTplTitle,
        content: newTplContent,
        tagString: tagsToTagString(selectedTplTags) // vd: "Technology, SEO"
      });

      setTemplates(prev => [created, ...prev]);
      setNewTplTitle('');
      setNewTplContent('');
      setSelectedTplTags([]);
      setShowAddTemplate(false);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Create prompt template failed.');
    } finally {
      setSubmittingTemplate(false);
    }
  };

  const handleAddContext = async (e) => {
    e.preventDefault();
    if (!newCtxTitle.trim()) return;

    setSubmittingContext(true);
    try {
      const created = await apiCreateKnowledgeBase({
        title: newCtxTitle,
        tagString: tagsToTagString(selectedCtxTags),
        file: newCtxFile
      });

      setContexts(prev => [created, ...prev]);
      setNewCtxTitle('');
      setNewCtxFile(null);
      setSelectedCtxTags([]);
      setShowAddContext(false);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Create context failed.');
    } finally {
      setSubmittingContext(false);
    }
  };

  const toggleTplTag = (tag) => {
    if (selectedTplTags.find(t => t.label === tag.label)) {
      setSelectedTplTags(selectedTplTags.filter(t => t.label !== tag.label));
    } else {
      setSelectedTplTags([...selectedTplTags, tag]);
    }
  };

  const toggleCtxTag = (tag) => {
    if (selectedCtxTags.find(t => t.label === tag.label)) {
      setSelectedCtxTags(selectedCtxTags.filter(t => t.label !== tag.label));
    } else {
      setSelectedCtxTags([...selectedCtxTags, tag]);
    }
  };

  // Filtered lists
  const filteredTemplates = templates.filter(t =>
    t.title.toLowerCase().includes(searchTemplate.toLowerCase()) ||
    t.content.toLowerCase().includes(searchTemplate.toLowerCase()) ||
    t.tags.some(tag => tag.label.toLowerCase().includes(searchTemplate.toLowerCase()))
  );

  const filteredContexts = contexts.filter(c =>
    c.title.toLowerCase().includes(searchContext.toLowerCase()) ||
    c.tags.some(tag => tag.label.toLowerCase().includes(searchContext.toLowerCase()))
  );

  // Bấm vào file của 1 context item -> mở file thật theo file_path (URL public trên R2)
  const handleContextClick = (context) => {
    if (!context.file_path) {
      alert(`Context "${context.title}" chưa có file đính kèm.`);
      return;
    }
    window.open(context.file_path, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{
      width: '97%',
      display: 'flex',
      flexDirection: 'row',
      gap: '20px',
      height: 'calc(100vh - 118px)',
      boxSizing: 'border-box',
      fontFamily: 'Satoshi, system-ui, sans-serif'
    }}>
      <div style={{
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '700',
            color: '#443e36',
          }}>Prompt Template</h2>
          <button
            onClick={() => setShowAddTemplate(true)}
            style={{
              width: '25px',
              height: '25px',
              borderRadius: '50%',
              backgroundColor: '#FE7216',
              border: 'none',
              color: '#fff',
              fontSize: '18px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(254,114,22,0.3)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            +
          </button>
        </div>

        {/* Search */}
        <div style={{
          position: 'relative',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, position: 'absolute', left: '14px' }}>
            <circle cx="6" cy="6" r="5" stroke="#9ca3af" strokeWidth="1.5" />
            <path d="M10 10L13 13" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
          </svg>

          <input
            type="text"
            placeholder="Search prompt templates..."
            value={searchTemplate}
            onChange={(e) => setSearchTemplate(e.target.value)}
            style={{
              width: '100%',
              height: '15px',
              padding: '12px 14px 12px 40px',
              borderRadius: '10px',
              border: '1px solid rgba(0,0,0,0.08)',
              backgroundColor: 'rgba(255,255,255,0.7)',
              fontSize: '14px',
              fontWeight: '500',
              color: '#1e1e1e',
              outline: 'none',
              fontFamily: 'Satoshi, system-ui, sans-serif',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)'
            }}
          />
        </div>

        {/* Templates List */}
        <div className="custom-scroll" style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          paddingRight: '4px'
        }}>
          {loadingTemplates ? (
            <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '40px 20px', fontSize: '14px' }}>
              Đang tải prompt templates...
            </div>
          ) : templateError ? (
            <div style={{ textAlign: 'center', color: '#ef4444', padding: '40px 20px', fontSize: '14px' }}>
              {templateError}
              <div style={{ marginTop: '10px' }}>
                <button
                  onClick={loadPromptTemplates}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    backgroundColor: '#fff',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Try again
                </button>
              </div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#8c8c8c',
              padding: '40px 20px',
              fontSize: '14px'
            }}>No matching templates found.</div>
          ) : (
            filteredTemplates.map((tpl) => {
              const isExpanded = expandedTemplateId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setExpandedTemplateId(isExpanded ? null : tpl.id)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.75)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderRadius: '15px',
                    padding: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '10px',
                    gap: '12px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#1e1e1e'
                    }}>{tpl.title}</span>
                    <div style={{
                      display: 'flex',
                      gap: '6px',
                      flexWrap: 'wrap',
                      justifyContent: 'flex-end'
                    }}>
                      {tpl.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#fff',
                            backgroundColor: tag.color,
                            padding: '3px 8px',
                            borderRadius: '20px',
                            lineHeight: 1
                          }}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p style={{
                    fontSize: '13px',
                    color: '#555',
                    margin: '0 0 12px 0',
                    display: isExpanded ? 'block' : '-webkit-box',
                    WebkitLineClamp: isExpanded ? 'unset' : 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    whiteSpace: 'pre-wrap',
                    textOverflow: 'ellipsis',

                  }}>
                    {tpl.content}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px',
                    color: '#8c8c8c'
                  }}>
                    <span>{isExpanded ? 'Click to collapse' : 'Click to expand'}</span>
                    <span>Added {tpl.created_at}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN - Context */}
      <div style={{
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '700',
            color: '#443e36',
          }}>Context</h2>
          <button
            onClick={() => setShowAddContext(true)}
            style={{
              width: '25px',
              height: '25px',
              borderRadius: '50%',
              backgroundColor: '#FE7216',
              border: 'none',
              color: '#fff',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(254,114,22,0.3)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            +
          </button>
        </div>

        {/* Search */}
        <div style={{
          position: 'relative',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, position: 'absolute', left: '14px' }}>
            <circle cx="6" cy="6" r="5" stroke="#9ca3af" strokeWidth="1.5" />
            <path d="M10 10L13 13" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
          </svg>

          <input
            type="text"
            placeholder="Search contexts..."
            value={searchContext}
            onChange={(e) => setSearchContext(e.target.value)}
            style={{
              width: '100%',
              height:'15px',
              padding: '12px 14px 12px 40px',
              borderRadius: '12px',
              border: '1px solid rgba(0,0,0,0.08)',
              backgroundColor: 'rgba(255,255,255,0.7)',
              fontSize: '14px',
              fontWeight: '500',
              color: '#1e1e1e',
              outline: 'none',
              fontFamily: 'Satoshi, system-ui, sans-serif',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)'
            }}
          />
        </div>

        {/* Context List */}
        <div className="custom-scroll" style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          paddingRight: '4px'
        }}>
          {loadingContexts ? (
            <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '40px 20px', fontSize: '14px' }}>
              Đang tải context...
            </div>
          ) : contextError ? (
            <div style={{ textAlign: 'center', color: '#ef4444', padding: '40px 20px', fontSize: '14px' }}>
              {contextError}
              <div style={{ marginTop: '10px' }}>
                <button
                  onClick={loadKnowledgeBases}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    backgroundColor: '#fff',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Thử lại
                </button>
              </div>
            </div>
          ) : filteredContexts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#8c8c8c',
              padding: '40px 20px',
              fontSize: '14px'
            }}>No matching context items found.</div>
          ) : (
            filteredContexts.map((ctx) => {
              const isExpanded = expandedContextId === ctx.id;
              return (
                <div
                  key={ctx.id}
                  onClick={() => setExpandedContextId(isExpanded ? null : ctx.id)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.75)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderRadius: '16px',
                    padding: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px',
                    gap: '12px'
                  }}>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: '700',
                      color: '#1e1e1e'
                    }}>{ctx.title}</span>
                    <div style={{
                      display: 'flex',
                      gap: '6px',
                      flexWrap: 'wrap',
                      justifyContent: 'flex-end'
                    }}>
                      {ctx.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#fff',
                            backgroundColor: tag.color,
                            padding: '3px 8px',
                            borderRadius: '20px',
                            lineHeight: 1
                          }}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* File đính kèm - mỗi context chỉ có đúng 1 file (khớp field file_path bên BE).
                      Bấm vào file này sẽ chạy/mở theo file_path thật, không toggle expand card. */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextClick(ctx);
                      }}
                      title={ctx.file_path ? 'Bấm để mở file' : 'Chưa có file đính kèm'}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: ctx.file_path ? '#C2410C' : '#9ca3af',
                        backgroundColor: ctx.file_path ? '#FFF7ED' : 'rgba(0,0,0,0.04)',
                        border: ctx.file_path ? '1px solid #FE7216' : '1px solid rgba(0,0,0,0.02)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        cursor: ctx.file_path ? 'pointer' : 'default'
                      }}
                    >
                      📎 {ctx.file_name}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px',
                    color: '#8c8c8c'
                  }}>
                    <span>{isExpanded ? 'Click to collapse' : 'Click to expand'}</span>
                    <span>Added {ctx.created_at}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --- ADD PROMPT TEMPLATE MODAL --- */}
      {showAddTemplate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '460px',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e1e1e' }}>Add Prompt Template</h3>
              <button
                onClick={() => setShowAddTemplate(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  color: '#7c7c7c',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#7c7c7c' }}>Title</label>
                <input
                  type="text"
                  placeholder="e.g. [BA] Software development"
                  value={newTplTitle}
                  onChange={(e) => setNewTplTitle(e.target.value)}
                  required
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: 'Satoshi, system-ui, sans-serif'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#7c7c7c' }}>Template Content</label>
                <textarea
                  placeholder="Act as a..."
                  value={newTplContent}
                  onChange={(e) => setNewTplContent(e.target.value)}
                  required
                  rows={5}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'Satoshi, system-ui, sans-serif'
                  }}
                />
              </div>

              {/* Tag Picker */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#7c7c7c' }}>Select Tags</label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  maxHeight: '100px',
                  overflowY: 'auto',
                  padding: '4px',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: '10px'
                }} className="custom-scroll">
                  {suggestedTags.map((tag, idx) => {
                    const isSelected = selectedTplTags.find(t => t.label === tag.label);
                    return (
                      <span
                        key={idx}
                        onClick={() => toggleTplTag(tag)}
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: isSelected ? '#fff' : '#555',
                          backgroundColor: isSelected ? tag.color : 'rgba(0,0,0,0.05)',
                          border: isSelected ? `1px solid ${tag.color}` : '1px solid rgba(0,0,0,0.02)',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {tag.label}
                      </span>
                    );
                  })}
                </div>
                {selectedTplTags.length > 0 && (
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                    Sẽ lưu dưới dạng: "{tagsToTagString(selectedTplTags)}"
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddTemplate(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    backgroundColor: 'transparent',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#7c7c7c',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTemplate}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#FE7216',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#fff',
                    cursor: submittingTemplate ? 'not-allowed' : 'pointer',
                    opacity: submittingTemplate ? 0.7 : 1,
                    boxShadow: '0 4px 12px rgba(254,114,22,0.3)'
                  }}
                >
                  {submittingTemplate ? 'Đang tạo...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD CONTEXT MODAL --- */}
      {showAddContext && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '460px',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e1e1e' }}>Add Context Item</h3>
              <button
                onClick={() => setShowAddContext(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  color: '#7c7c7c',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddContext} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#7c7c7c' }}>Title</label>
                <input
                  type="text"
                  placeholder="e.g. Business Description"
                  value={newCtxTitle}
                  onChange={(e) => setNewCtxTitle(e.target.value)}
                  required
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: 'Satoshi, system-ui, sans-serif'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563' }}>Attachment</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setNewCtxFile(e.target.files?.[0] || null)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px dashed #FE7216',
                    backgroundColor: '#FFF7ED',
                    color: '#C2410C',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Satoshi, system-ui, sans-serif'
                  }}
                />
                {newCtxFile && (
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>Đã chọn: {newCtxFile.name}</span>
                )}
              </div>

              {/* Tag Picker */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#7c7c7c' }}>Select Tags</label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  maxHeight: '100px',
                  overflowY: 'auto',
                  padding: '4px',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: '10px'
                }} className="custom-scroll">
                  {suggestedTags.map((tag, idx) => {
                    const isSelected = selectedCtxTags.find(t => t.label === tag.label);
                    return (
                      <span
                        key={idx}
                        onClick={() => toggleCtxTag(tag)}
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: isSelected ? '#fff' : '#555',
                          backgroundColor: isSelected ? tag.color : 'rgba(0,0,0,0.05)',
                          border: isSelected ? `1px solid ${tag.color}` : '1px solid rgba(0,0,0,0.02)',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {tag.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddContext(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    backgroundColor: 'transparent',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#7c7c7c',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingContext}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#FE7216',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#fff',
                    cursor: submittingContext ? 'not-allowed' : 'pointer',
                    opacity: submittingContext ? 0.7 : 1,
                    boxShadow: '0 4px 12px rgba(254,114,22,0.3)'
                  }}
                >
                  {submittingContext ? 'Đang tạo...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}