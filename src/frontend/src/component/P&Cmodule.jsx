import React, { useState } from 'react';

export default function PromptContextmodule() {
  // --- PRE-SEEDED DATA ---
  const defaultTemplates = [
    {
      id: 1,
      title: '[BA] Software development',
      content: 'Act as a Senior Business Analyst with a decade of agile software development experience, specializing in bridging the gap between business stakeholders and technical execution. Your job is to analyze my project ideas or feature requests by asking up to three targeted, clarifying questions to refine the scope. Provide detailed user stories, acceptance criteria using Gherkin syntax, and clear functional requirements.',
      tags: [
        { label: 'Technology', color: '#00bcd4' },
        { label: 'BA', color: '#ef4444' }
      ],
      created_at: '16 January 2025'
    },
    {
      id: 2,
      title: '[MKT] SEO Blog Writer',
      content: 'Act as an expert SEO copywriter and editor. Analyze the keyword list provided and outline a comprehensive, well-structured article. Ensure you naturally inject semantic keywords, use clean H2/H3 header organization, and write in an informative, professional yet conversational tone to maximize reader engagement and search engine visibility.',
      tags: [
        { label: 'Technology', color: '#00bcd4' },
        { label: 'SEO', color: '#eab308' }
      ],
      created_at: '16 January 2025'
    },
    {
      id: 3,
      title: '[Copy] Social Media Post',
      content: 'Create highly engaging posts for LinkedIn and Twitter platforms. Formulate eye-catching hooks, utilize bullet points for readability, keep the tone professional but warm, add 3-5 relevant trending hashtags, and end with a high-conversion call to action (CTA).',
      tags: [
        { label: 'Marketing', color: '#a855f7' },
        { label: 'Writing', color: '#3b82f6' }
      ],
      created_at: '16 January 2025'
    },
    {
      id: 4,
      title: '[Copy] Social Media Post',
      content: 'Create highly engaging posts for LinkedIn and Twitter platforms. Formulate eye-catching hooks, utilize bullet points for readability, keep the tone professional but warm, add 3-5 relevant trending hashtags, and end with a high-conversion call to action (CTA).',
      tags: [
        { label: 'Marketing', color: '#a855f7' },
        { label: 'Writing', color: '#3b82f6' }
      ],
      created_at: '16 January 2025'
    },
    {
      id: 5,
      title: '[Copy] Social Media Post',
      content: 'Create highly engaging posts for LinkedIn and Twitter platforms. Formulate eye-catching hooks, utilize bullet points for readability, keep the tone professional but warm, add 3-5 relevant trending hashtags, and end with a high-conversion call to action (CTA).',
      tags: [
        { label: 'Marketing', color: '#a855f7' },
        { label: 'Writing', color: '#3b82f6' }
      ],
      created_at: '16 January 2025'
    }
  ];

  const defaultContexts = [
    {
      id: 1,
      title: 'Business Description',
      documents: ['Document1', 'Document2', 'Document3', 'Document4'],
      tags: [
        { label: 'Financial', color: '#d946ef' },
        { label: 'Environment', color: '#22c55e' }
      ],
      created_at: '16 January 2025'
    },
    {
      id: 2,
      title: 'Brand Guidelines 2025',
      documents: ['Logo_Assets.zip', 'Typography_Guide.pdf', 'Brand_Voice.docx'],
      tags: [
        { label: 'Guidelines', color: '#3b82f6' },
        { label: 'Product', color: '#8b5cf6' }
      ],
      created_at: '12 February 2025'
    },
    {
      id: 3,
      title: 'Target Audience Persona',
      documents: ['User_Research_Report.pdf', 'Persona_SaaS_Enterprise.pdf'],
      tags: [
        { label: 'Persona', color: '#64748b' },
        { label: 'Product', color: '#8b5cf6' }
      ],
      created_at: '05 March 2025'
    },
    {
      id: 4,
      title: 'Target Audience Persona',
      documents: ['User_Research_Report.pdf', 'Persona_SaaS_Enterprise.pdf'],
      tags: [
        { label: 'Persona', color: '#64748b' },
        { label: 'Product', color: '#8b5cf6' }
      ],
      created_at: '05 March 2025'
    },
    {
      id: 5,
      title: 'Target Audience Persona',
      documents: ['User_Research_Report.pdf', 'Persona_SaaS_Enterprise.pdf'],
      tags: [
        { label: 'Persona', color: '#64748b' },
        { label: 'Product', color: '#8b5cf6' }
      ],
      created_at: '05 March 2025'
    }
  ];

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

  // --- STATE ---
  const [templates, setTemplates] = useState(defaultTemplates);
  const [contexts, setContexts] = useState(defaultContexts);

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
  const [newCtxDocs, setNewCtxDocs] = useState('');
  const [selectedCtxTags, setSelectedCtxTags] = useState([]);

  // --- HANDLERS ---
  const handleAddTemplate = (e) => {
    e.preventDefault();
    if (!newTplTitle.trim() || !newTplContent.trim()) return;

    const newTpl = {
      id: Date.now(),
      title: newTplTitle,
      content: newTplContent,
      tags: selectedTplTags,
      created_at: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    setTemplates([newTpl, ...templates]);
    setNewTplTitle('');
    setNewTplContent('');
    setSelectedTplTags([]);
    setShowAddTemplate(false);
  };

  const handleAddContext = (e) => {
    e.preventDefault();
    if (!newCtxTitle.trim()) return;

    const docsArray = newCtxDocs
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    const newCtx = {
      id: Date.now(),
      title: newCtxTitle,
      documents: docsArray.length > 0 ? docsArray : ['Reference_Doc.pdf'],
      tags: selectedCtxTags,
      created_at: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    setContexts([newCtx, ...contexts]);
    setNewCtxTitle('');
    setNewCtxDocs('');
    setSelectedCtxTags([]);
    setShowAddContext(false);
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
      {/* LEFT COLUMN - Prompt Template */}
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
          <span style={{
            position: 'absolute',
            left: '14px',
            color: '#8c8c8c',
            fontSize: '14px',
            pointerEvents: 'none'
          }}>🔍</span>
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
          {filteredTemplates.length === 0 ? (
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
          <span style={{
            position: 'absolute',
            left: '14px',
            color: '#8c8c8c',
            fontSize: '14px',
            pointerEvents: 'none'
          }}>🔍</span>
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
          {filteredContexts.length === 0 ? (
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

                  {/* Attachment document chips */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    {ctx.documents.map((doc, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#555',
                          backgroundColor: 'rgba(0,0,0,0.04)',
                          border: '1px solid rgba(0,0,0,0.02)',
                          padding: '6px 12px',
                          borderRadius: '8px'
                        }}
                      >
                        📎 {doc}
                      </span>
                    ))}
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
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#FE7216',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(254,114,22,0.3)'
                  }}
                >
                  Create
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
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#7c7c7c' }}>Documents (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Brand_Guidelines.pdf, Logo_Files.zip"
                  value={newCtxDocs}
                  onChange={(e) => setNewCtxDocs(e.target.value)}
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
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#FE7216',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(254,114,22,0.3)'
                  }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}