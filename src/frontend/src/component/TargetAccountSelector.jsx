import React, { useState, useEffect, useMemo, useRef } from 'react';
import facebookIcon from '../assets/fblg.png';
import linkedinIcon from '../assets/linkedinlg.png';

// Generic platform icon resolver supporting future platforms gracefully
const getPlatformIcon = (platform) => {
  const p = (platform || '').toLowerCase();
  if (p === 'facebook') return facebookIcon;
  if (p === 'linkedin') return linkedinIcon;
  return null;
};

const getPlatformColor = (platform) => {
  const p = (platform || '').toLowerCase();
  switch (p) {
    case 'facebook': return '#1877F2';
    case 'linkedin': return '#0A66C2';
    case 'instagram': return '#E4405F';
    case 'tiktok': return '#000000';
    case 'x':
    case 'twitter': return '#0f1419';
    case 'youtube': return '#FF0000';
    default: return '#64748b';
  }
};

const formatPlatformName = (platform) => {
  if (!platform) return 'Unknown';
  const p = platform.toLowerCase();
  if (p === 'facebook') return 'Facebook';
  if (p === 'linkedin') return 'LinkedIn';
  if (p === 'instagram') return 'Instagram';
  if (p === 'tiktok') return 'TikTok';
  if (p === 'x' || p === 'twitter') return 'X / Twitter';
  if (p === 'youtube') return 'YouTube';
  return platform.charAt(0).toUpperCase() + platform.slice(1);
};

export default function TargetAccountSelector({
  selectedPlatforms = [],
  connectedChannels = [],
  selectedAccountIds = [],
  onChange,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const dropdownRef = useRef(null);

  // Normalize selected platforms
  const normalizedPlatforms = useMemo(() => {
    return (selectedPlatforms || []).map(p => (typeof p === 'string' ? p.toLowerCase().trim() : ''));
  }, [selectedPlatforms]);

  // 1. Filter connected channels strictly scoped by selectedPlatforms
  const scopedChannels = useMemo(() => {
    if (normalizedPlatforms.length === 0) return [];
    return connectedChannels.filter(ch => {
      const chPlatform = (ch.platform || '').toLowerCase().trim();
      return normalizedPlatforms.includes(chPlatform);
    });
  }, [connectedChannels, normalizedPlatforms]);

  // 2. Auto re-evaluate: strip any accounts that no longer belong to selected platforms
  useEffect(() => {
    const validIds = new Set(scopedChannels.map(c => c.id));
    const cleanedSelected = selectedAccountIds.filter(id => validIds.has(id));
    if (cleanedSelected.length !== selectedAccountIds.length) {
      const mode = (scopedChannels.length > 0 && cleanedSelected.length === scopedChannels.length)
        ? 'ALL_SELECTED_PLATFORMS'
        : 'SELECTED';
      if (typeof onChange === 'function') {
        onChange(cleanedSelected, mode);
      }
    }
  }, [scopedChannels, selectedAccountIds, onChange]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 3. Search filtering
  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return scopedChannels;
    const q = searchQuery.toLowerCase().trim();
    return scopedChannels.filter(c => 
      (c.display_name && c.display_name.toLowerCase().includes(q)) ||
      (c.platform && c.platform.toLowerCase().includes(q)) ||
      (c.note && c.note.toLowerCase().includes(q))
    );
  }, [scopedChannels, searchQuery]);

  // 4. Group channels by platform
  const groupedChannels = useMemo(() => {
    const groups = {};
    filteredChannels.forEach(ch => {
      const p = (ch.platform || 'other').toLowerCase();
      if (!groups[p]) groups[p] = [];
      groups[p].push(ch);
    });
    return groups;
  }, [filteredChannels]);

  // Master selection status
  const isAllSelected = scopedChannels.length > 0 && scopedChannels.every(c => selectedAccountIds.includes(c.id));
  const isSomeSelected = scopedChannels.some(c => selectedAccountIds.includes(c.id)) && !isAllSelected;

  // Toggle Master Select All
  const handleToggleMaster = () => {
    if (isAllSelected) {
      if (typeof onChange === 'function') onChange([], 'SELECTED');
    } else {
      const allIds = scopedChannels.map(c => c.id);
      if (typeof onChange === 'function') onChange(allIds, 'ALL_SELECTED_PLATFORMS');
    }
  };

  // Toggle Platform group select all
  const handleTogglePlatformGroup = (platformKey, platformChannels) => {
    const groupIds = platformChannels.map(c => c.id);
    const allGroupSelected = groupIds.every(id => selectedAccountIds.includes(id));

    let updatedIds;
    if (allGroupSelected) {
      // Unselect all in this group
      updatedIds = selectedAccountIds.filter(id => !groupIds.includes(id));
    } else {
      // Select all in this group
      const newSet = new Set([...selectedAccountIds, ...groupIds]);
      updatedIds = Array.from(newSet);
    }

    const mode = (scopedChannels.length > 0 && updatedIds.length === scopedChannels.length)
      ? 'ALL_SELECTED_PLATFORMS'
      : 'SELECTED';
    if (typeof onChange === 'function') onChange(updatedIds, mode);
  };

  // Toggle single account
  const handleToggleAccount = (accountId) => {
    let updatedIds;
    if (selectedAccountIds.includes(accountId)) {
      updatedIds = selectedAccountIds.filter(id => id !== accountId);
    } else {
      updatedIds = [...selectedAccountIds, accountId];
    }
    const mode = (scopedChannels.length > 0 && updatedIds.length === scopedChannels.length)
      ? 'ALL_SELECTED_PLATFORMS'
      : 'SELECTED';
    if (typeof onChange === 'function') onChange(updatedIds, mode);
  };

  // Toggle group collapse
  const toggleGroupCollapse = (platformKey) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [platformKey]: !prev[platformKey]
    }));
  };

  // Trigger button label
  const getTriggerLabel = () => {
    if (normalizedPlatforms.length === 0) {
      return '⚠️ No Target Platforms selected';
    }
    if (scopedChannels.length === 0) {
      return 'No connected accounts for selected platform(s)';
    }
    if (isAllSelected) {
      return `🌐 All Accounts on Selected Platforms (${scopedChannels.length})`;
    }
    if (selectedAccountIds.length === 0) {
      return 'Select target accounts... (0 selected)';
    }
    if (selectedAccountIds.length === 1) {
      const acc = scopedChannels.find(c => c.id === selectedAccountIds[0]);
      return acc ? `${formatPlatformName(acc.platform)} — ${acc.display_name}` : '1 account selected';
    }
    return `${selectedAccountIds.length} of ${scopedChannels.length} accounts selected`;
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', fontFamily: 'Satoshi, system-ui, sans-serif' }}>
      {/* Collapsed Dropdown Trigger */}
      <button
        type="button"
        disabled={disabled || normalizedPlatforms.length === 0}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          backgroundColor: disabled || normalizedPlatforms.length === 0 ? '#f8fafc' : '#ffffff',
          color: disabled || normalizedPlatforms.length === 0 ? '#94a3b8' : '#1e293b',
          fontSize: '12px',
          fontWeight: '600',
          cursor: disabled || normalizedPlatforms.length === 0 ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 2px rgba(254, 114, 22, 0.2)' : 'none',
          transition: 'all 0.15s ease'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getTriggerLabel()}
        </span>
        <span style={{ fontSize: '10px', color: '#64748b', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
          ▼
        </span>
      </button>

      {/* Popover Dropdown Tree */}
      {isOpen && normalizedPlatforms.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            right: 0,
            marginBottom: '6px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 1050,
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '320px',
            overflowY: 'auto'
          }}
          className="custom-scroll"
        >
          {/* Search Box */}
          {scopedChannels.length > 3 && (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="🔍 Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  color: '#1e293b',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {/* Master "All Accounts on Selected Platforms" Option */}
          {scopedChannels.length > 0 && (
            <div
              onClick={handleToggleMaster}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: isAllSelected ? '#fff7ed' : '#f8fafc',
                border: isAllSelected ? '1px solid #fdba74' : '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={el => { if (el) el.indeterminate = isSomeSelected; }}
                  onChange={handleToggleMaster}
                  style={{ cursor: 'pointer', accentColor: '#FE7216' }}
                />
                <span style={{ fontSize: '12px', fontWeight: '700', color: isAllSelected ? '#c2410c' : '#334155' }}>
                  All Accounts on Selected Platforms
                </span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '10px' }}>
                {scopedChannels.length}
              </span>
            </div>
          )}

          {/* Platform Groups */}
          {Object.keys(groupedChannels).length === 0 ? (
            <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
              {scopedChannels.length === 0 
                ? 'No connected accounts for selected platform(s).'
                : 'No accounts matching your search.'}
            </div>
          ) : (
            Object.entries(groupedChannels).map(([platformKey, pChannels]) => {
              const platformName = formatPlatformName(platformKey);
              const pIcon = getPlatformIcon(platformKey);
              const pColor = getPlatformColor(platformKey);
              const selectedCountInGroup = pChannels.filter(c => selectedAccountIds.includes(c.id)).length;
              const isGroupAllSelected = pChannels.length > 0 && selectedCountInGroup === pChannels.length;
              const isGroupSomeSelected = selectedCountInGroup > 0 && !isGroupAllSelected;
              const isCollapsed = !!collapsedGroups[platformKey];

              return (
                <div
                  key={platformKey}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff'
                  }}
                >
                  {/* Platform Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      backgroundColor: '#f1f5f9',
                      borderBottom: isCollapsed ? 'none' : '1px solid #e2e8f0',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => handleTogglePlatformGroup(platformKey, pChannels)}>
                      <input
                        type="checkbox"
                        checked={isGroupAllSelected}
                        ref={el => { if (el) el.indeterminate = isGroupSomeSelected; }}
                        onChange={() => handleTogglePlatformGroup(platformKey, pChannels)}
                        style={{ cursor: 'pointer', accentColor: '#FE7216' }}
                      />
                      {pIcon ? (
                        <img src={pIcon} alt={platformName} style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: pColor, display: 'inline-block' }} />
                      )}
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>
                        {platformName}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>
                        ({selectedCountInGroup}/{pChannels.length})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleGroupCollapse(platformKey); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '10px',
                        cursor: 'pointer',
                        padding: '2px 4px'
                      }}
                    >
                      {isCollapsed ? '▶' : '▼'}
                    </button>
                  </div>

                  {/* Account List */}
                  {!isCollapsed && (
                    <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 0' }}>
                      {pChannels.map((acc) => {
                        const isChecked = selectedAccountIds.includes(acc.id);
                        return (
                          <div
                            key={acc.id}
                            onClick={() => handleToggleAccount(acc.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 12px 6px 28px',
                              backgroundColor: isChecked ? '#fffbeb' : 'transparent',
                              cursor: 'pointer',
                              transition: 'background-color 0.1s ease'
                            }}
                            onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                            onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleAccount(acc.id)}
                                style={{ cursor: 'pointer', accentColor: '#FE7216' }}
                              />
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '12px', fontWeight: isChecked ? '700' : '500', color: '#1e293b' }}>
                                  {acc.display_name || 'Account'}
                                </span>
                                {acc.note && (
                                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                                    {acc.note}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isChecked && (
                              <span style={{ fontSize: '11px', color: '#FE7216', fontWeight: '700' }}>
                                ✓
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
