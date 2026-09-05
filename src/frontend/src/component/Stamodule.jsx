import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import fbicon from '../assets/fblg.png';
import linkedinicon from '../assets/linkedinlg.png';
import bgimage from '../assets/DB_Graphbg.png';
import Todaybg from '../assets/StaTodaybg.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function MultiLineChart({ timeframe, seriesData, labelsData }) {
  const labelsMap = {
    Weekly: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    Monthly: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    Yearly: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
  };

  const currentLabels = labelsData || labelsMap[timeframe] || labelsMap.Weekly;
  const currentFbData = seriesData?.facebook || new Array(currentLabels.length).fill(0);
  const currentLiData = seriesData?.linkedin || new Array(currentLabels.length).fill(0);

  const chartData = {
    labels: currentLabels,
    datasets: [
      {
        label: 'Facebook',
        data: currentFbData,
        borderColor: '#FE7216',
        backgroundColor: 'rgba(254, 114, 22, 0.1)',
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#FE7216',
      },
      {
        label: 'LinkedIn',
        data: currentLiData,
        borderColor: '#FFC097',
        backgroundColor: 'rgba(255, 192, 151, 0.15)',
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#FFC097',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 10,
        titleFont: { size: 12, family: 'Satoshi' },
        bodyFont: { size: 12, family: 'Satoshi' },
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, family: 'Satoshi' }, color: '#7E7A72' },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { font: { size: 11, family: 'Satoshi' }, color: '#7E7A72' },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Line options={options} data={chartData} />
    </div>
  );
}

export default function Stamodule({ user }) {
  const isManager = user?.role === 'manager';
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  const workspaceId =
    user?.workspace_id ||
    user?.workspace?.workspace_id ||
    user?.workspace?.workspace_uuid ||
    (typeof user?.workspace === 'string' ? user.workspace : null);

  const isIndividual = user?.account_type === 'individual' || (!workspaceId && user?.role === 'individual');
  const analyticsBase = isIndividual
    ? 'http://localhost:8000/api/v1/analytics/individual'
    : `http://localhost:8000/api/v1/analytics/${workspaceId}`;
  const reportsBase = isIndividual
    ? 'http://localhost:8000/api/v1/reports/individual'
    : `http://localhost:8000/api/v1/reports/${workspaceId}`;

  const [graphTimeframe, setGraphTimeframe] = useState('Weekly');
  const [timelineSeries, setTimelineSeries] = useState(null);
  const [timelineLabels, setTimelineLabels] = useState(null);

  const [overviewStats, setOverviewStats] = useState({
    fb_pct: 0,
    fb_attraction: 0,
    li_pct: 0,
    li_attraction: 0,
  });

  const [todayData, setTodayData] = useState({
    total_interactions: 0,
    user_contribution: 0,
  });

  const [reportTimeframe, setReportTimeframe] = useState('Monthly');
  const [reportTitle, setReportTitle] = useState('');
  const [reportText, setReportText] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [reportHistoryList, setReportHistoryList] = useState([]);
  const [topPosts, setTopPosts] = useState([]);

  // Interactive Date Range Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  // Common Headers helper
  const getAuthHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // 1. Fetch Timeline Analytics
  const fetchTimeline = async (tf) => {
    try {
      const res = await fetch(`${analyticsBase}/timeline?timeframe=${tf}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setTimelineSeries(data.series);
        setTimelineLabels(data.labels);
      }
    } catch (err) {
      console.warn('Error fetching timeline:', err);
    }
  };

  // 2. Fetch Overview Analytics
  const fetchOverview = async () => {
    try {
      const res = await fetch(`${analyticsBase}/overview`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setOverviewStats({
          fb_pct: data.facebook.percentage,
          fb_attraction: data.facebook.total_attraction,
          li_pct: data.linkedin.percentage,
          li_attraction: data.linkedin.total_attraction,
        });
      }
    } catch (err) {
      console.warn('Error fetching overview:', err);
    }
  };

  // 3. Fetch Today Interactions
  const fetchTodayStats = async () => {
    try {
      const res = await fetch(`${analyticsBase}/today`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setTodayData({
          total_interactions: data.total_interactions_today,
          user_contribution: data.user_contribution_today,
        });
      }
    } catch (err) {
      console.warn('Error fetching today stats:', err);
    }
  };

  // 4. Fetch Top Posts
  const fetchTopPosts = async () => {
    try {
      const res = await fetch(`${analyticsBase}/top-posts?limit=7`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setTopPosts(data.posts || []);
      }
    } catch (err) {
      console.warn('Error fetching top posts:', err);
    }
  };

  // 5. Fetch Reports History
  const fetchReports = async () => {
    try {
      const res = await fetch(reportsBase, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setReportHistoryList(data.reports || []);
      }
    } catch (err) {
      console.warn('Error fetching reports history:', err);
    }
  };

  // 6. Generate AI Report manually on demand
  const handleCreateReport = async (tf = reportTimeframe) => {
    if (!workspaceId && !isIndividual) {
      toast.error('Workspace ID is not available.');
      return;
    }
    setIsGeneratingReport(true);
    try {
      const res = await fetch(`${reportsBase}/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ timeframe: tf }),
      });
      if (res.ok) {
        const data = await res.json();
        setReportTitle(data.title);
        setReportText(data.summary);
        toast.success('AI Statistical report generated successfully!');
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to generate AI report');
      }
    } catch (err) {
      console.warn('Error generating AI report:', err);
      toast.error(err.message || 'Error generating AI report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  useEffect(() => {
    if (!workspaceId && !isIndividual) {
      setTimelineSeries(null);
      setOverviewStats({ fb_pct: 0, fb_attraction: 0, li_pct: 0, li_attraction: 0 });
      setTodayData({ total_interactions: 0, user_contribution: 0 });
      setTopPosts([]);
      setReportHistoryList([]);
      return;
    }
    fetchTimeline(graphTimeframe);
    fetchOverview();
    fetchTodayStats();
    fetchTopPosts();
    fetchReports();
  }, [workspaceId, isIndividual]);

  useEffect(() => {
    if (!workspaceId && !isIndividual) return;
    fetchTimeline(graphTimeframe);
  }, [graphTimeframe, workspaceId, isIndividual]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  };

  const filteredHistory = reportHistoryList.filter((item) => {
    if (!startDate && !endDate) return true;
    const dateVal = item.saved_date || item.savedDate;
    if (!dateVal) return true;
    const itemTime = new Date(dateVal).getTime();
    const startTime = startDate ? new Date(startDate + 'T00:00:00').getTime() : 0;
    const endTime = endDate ? new Date(endDate + 'T23:59:59').getTime() : Infinity;
    return itemTime >= startTime && itemTime <= endTime;
  });

  // Pie chart datasets matching overviewStats
  const fbPieData = {
    labels: ['Facebook', 'Other'],
    datasets: [
      {
        data: [overviewStats.fb_pct, 100 - overviewStats.fb_pct],
        backgroundColor: ['#FE7216', '#FFE3D1'],
        borderWidth: 0,
      },
    ],
  };

  const linkedinPieData = {
    labels: ['LinkedIn', 'Other'],
    datasets: [
      {
        data: [overviewStats.li_pct, 100 - overviewStats.li_pct],
        backgroundColor: ['#FE7216', '#FFE3D1'],
        borderWidth: 0,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  const handleSaveReport = async () => {
    if (!reportText || !reportText.trim()) {
      toast.error('Please click Create Report first before saving.');
      return;
    }
    const newTitle = reportTitle || `[${reportTimeframe} report for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}]`;

    try {
      const res = await fetch(reportsBase, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: newTitle,
          timeframe: reportTimeframe,
          summary: reportText,
        }),
      });

      if (res.ok) {
        const savedItem = await res.json();
        setReportHistoryList((prev) => [savedItem, ...prev]);
        toast.success('Statistical report saved successfully!');
        return;
      }
    } catch (err) {
      console.warn('Save report error:', err);
    }
    toast.error('Failed to save report to server.');
  };

  const handleDownloadReport = async (item) => {
    try {
      const reportId = item.id;
      if (!reportId) {
        toast.error('Invalid report ID');
        return;
      }
      const downloadUrl = item.download_url
        ? (item.download_url.startsWith('http') ? item.download_url : `http://localhost:8000${item.download_url}`)
        : `${reportsBase}/${reportId}/download`;
      const res = await fetch(downloadUrl, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error(`Download error: ${res.statusText}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const rawTitle = item.title || item.name || 'Statistical_Report';
      const safeTitle = rawTitle.replace(/[^a-zA-Z0-9_\-]/g, '_');
      a.download = `${safeTitle}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Downloaded ${item.title || item.name || 'Report'}`);
    } catch (e) {
      console.warn('Download error:', e);
      toast.error('Failed to download report document.');
    }
  };

  const handleViewPost = (post) => {
    if (post.published_url) {
      window.open(post.published_url, '_blank');
    } else {
      toast(`Viewing analytics for: ${post.title}`, { icon: '📊' });
    }
  };

  return (
    <div
      style={{
        width: '97%',
        fontFamily: 'Satoshi, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: '0px',
        padding: '0px',
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
        alignItems: 'stretch',
        boxSizing: 'border-box',
        alignItems: 'self-start'
        
      }}
    >
      {/* LEFT MAIN CANVAS */}
      <div
        style={{
          width: '75%',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxSizing: 'border-box',
          backgroundColor: 'rgba(255,255,255,0.5)',
          padding: '20px',
          borderRadius: '20px'
        }}
      >
        {/* TOP LARGE DIV: MULTILINE GRAPH + 2 PIE CHARTS */}
        <div
          style={{
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            padding: '16px',
            boxSizing: 'border-box',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background image */}
          <img
            src={bgimage}
            alt="graph bg"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0,
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'row',
              gap: '16px',
              width: '100%',
              height: '310px',
            }}
          >
            {/* Left Box: MultiLine Graph Card */}
            <div
              style={{
                width: '70%',
                height: '100%',
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '16px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              }}
            >
              {/* Graph Top Header Controls */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                {/* Custom Timeframe Dropdown */}
                <select
                  value={graphTimeframe}
                  onChange={(e) => setGraphTimeframe(e.target.value)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    backgroundColor: '#FAFAFA',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#1E1E1E',
                    cursor: 'pointer',
                    outline: 'none',
                    fontFamily: 'Satoshi',
                  }}
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>

                {/* Custom Legend */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#7E7A72' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#FE7216',
                        borderRadius: '2px',
                        display: 'inline-block',
                      }}
                    ></span>
                    Facebook
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#FFC097',
                        borderRadius: '2px',
                        display: 'inline-block',
                      }}
                    ></span>
                    LinkedIn
                  </div>
                </div>
              </div>

              {/* Chart Component */}
              <div style={{ flex: 1, minHeight: 0 }}>
                <MultiLineChart
                  timeframe={graphTimeframe}
                  seriesData={timelineSeries}
                  labelsData={timelineLabels}
                />
              </div>
            </div>

            {/* Right Box: 2 Pie Charts */}
            <div
              style={{
                width: '35%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              {/* Top Pie Card: Facebook */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                }}
              >
                {/* Left side: Doughnut with Facebook Logo */}
                <div
                  style={{
                    width: '85px',
                    height: '85px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Doughnut data={fbPieData} options={pieOptions} />
                  <img
                    src={fbicon}
                    alt="Facebook"
                    style={{
                      width: '26px',
                      height: '26px',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      objectFit: 'contain',
                    }}
                  />
                </div>

                {/* Right side: Facebook Stats */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#FE7216', lineHeight: 1 }}>
                    {overviewStats.fb_pct}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#7E7A72', fontWeight: '500' }}>Facebook attracts</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#1E1E1E' }}>
                    {overviewStats.fb_attraction.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Bottom Pie Card: LinkedIn */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                }}
              >
                {/* Left side: LinkedIn Stats */}
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#1E1E1E' }}>
                    {overviewStats.li_attraction.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#7E7A72', fontWeight: '500' }}>LinkedIn attracts</div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#FE7216', lineHeight: 1 }}>
                    {overviewStats.li_pct}%
                  </div>
                </div>

                {/* Right side: Doughnut with LinkedIn Logo */}
                <div
                  style={{
                    width: '85px',
                    height: '85px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Doughnut data={linkedinPieData} options={pieOptions} />
                  <img
                    src={linkedinicon}
                    alt="LinkedIn"
                    style={{
                      width: '26px',
                      height: '26px',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: STATISTICAL REPORT & TODAY CARDS */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '20px',
            width: '100%',
            height: '275px',
          }}
        >
          {/* Statistical Report Card */}
          <div
            style={{
              width: '65%',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '20px',
              padding: '15px',
              boxSizing: 'border-box',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              height: '100%'
            }}
          >
            {/* Card Header & Controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1E1E1E' }}>
                Statistical Report
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={reportTimeframe}
                  onChange={(e) => setReportTimeframe(e.target.value)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '16px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#5C5C5C',
                    cursor: 'pointer',
                    outline: 'none',
                    fontFamily: 'Satoshi',
                  }}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Yearly">Yearly</option>
                </select>

                <button
                  onClick={() => handleCreateReport(reportTimeframe)}
                  disabled={isGeneratingReport}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '16px',
                    border: 'none',
                    background: isGeneratingReport ? '#ffd0b0' : 'linear-gradient(135deg, #FE7216 0%, #f59e0b 100%)',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: isGeneratingReport ? 'not-allowed' : 'pointer',
                    fontFamily: 'Satoshi',
                    boxShadow: '0 2px 8px rgba(254,114,22,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'transform 0.15s ease, opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isGeneratingReport) e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isGeneratingReport) e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.4 7.2L20 9.6L14.4 12L12 17.2L9.6 12L4 9.6L9.6 7.2L12 2Z" />
                  </svg>
                  {isGeneratingReport ? 'Generating...' : 'Create Report'}
                </button>

                <button
                  onClick={handleSaveReport}
                  disabled={!reportText || isGeneratingReport}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '16px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    backgroundColor: reportText ? 'white' : 'rgba(255,255,255,0.5)',
                    color: reportText ? '#FE7216' : '#9ca3af',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: reportText ? 'pointer' : 'not-allowed',
                    fontFamily: 'Satoshi',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    transition: 'transform 0.15s ease, background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (reportText) e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    if (reportText) e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Save
                </button>
              </div>
            </div>

            {/* Scrollable Text Area */}
            <div
              className="custom-scroll"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                borderRadius: '12px',
                padding: '16px',
                height: '100%',
                overflowY: 'auto',
                border: '1px solid rgba(0,0,0,0.04)',
                boxSizing: 'border-box',
              }}
            >
              {isGeneratingReport ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: '8px',
                  color: '#FE7216',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                  <div style={{ fontSize: '20px' }}>✨</div>
                  Generating AI Statistical Report with Gemini...
                </div>
              ) : reportText ? (
                <>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#1E1E1E', marginBottom: '6px' }}>
                    {reportTitle || (reportText ? `[${reportTimeframe} report]` : 'AI Statistical Report')}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      lineHeight: '1.65',
                      color: '#334155',
                      fontFamily: 'Satoshi',
                    }}
                  >
                    {reportText}
                  </p>
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  padding: '20px 10px',
                  color: '#94a3b8',
                  fontSize: '12px',
                  fontFamily: 'Satoshi',
                  lineHeight: '1.6'
                }}>
                  <span style={{ fontSize: '22px', marginBottom: '6px' }}>📊</span>
                  <span>Select a timeframe ({reportTimeframe}) and click <strong>Create Report</strong> to generate an AI-powered statistical analysis.</span>
                </div>
              )}
            </div>
          </div>

          {/* Today Card */}
          <div
            style={{
              width: '33%',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '20px',
              padding: '20px',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              minHeight: '200px',
            }}
          >
            {/* Background image */}
            <img
              src={Todaybg}
              alt="Today Background"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1E1E1E' }}>Today</h2>
              <div style={{ fontSize: '13px', color: '#5C5C5C', fontWeight: '500', marginTop: '2px' }}>
                {isManager ? 'Your team has got' : 'You have got'}
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#1E1E1E', lineHeight: 1.1 }}>
                {todayData.total_interactions.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#7E7A72', fontWeight: '500', marginTop: '3px' }}>
                Interactions
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              {isManager ? (
                <div style={{ fontSize: '12px', color: '#1E1E1E', fontWeight: '500', lineHeight: 1.4 }}>
                  With you making up <br />
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#1E1E1E' }}>
                    {todayData.user_contribution.toLocaleString()}
                  </span>
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#1E1E1E', fontWeight: '500' }}>
                  Keep up the good work!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: REPORT HISTORY TABLE */}
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
            gap: '14px',
          }}
        >
          {/* Header Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1E1E1E' }}>Report History</h2>
            {/* Interactive Date Range Filter */}
            <div style={{ position: 'relative' }} ref={datePickerRef}>
              <button
                onClick={() => setShowDatePicker((prev) => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  color: '#5C5C5C',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'Satoshi',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)')}
              >
                <span>📅 {formatDateLabel(startDate)} - {formatDateLabel(endDate)}</span>
                <span style={{ fontSize: '10px', color: '#7E7A72', transition: 'transform 0.2s ease', transform: showDatePicker ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </button>

              {/* Date Filter Popover Modal */}
              {showDatePicker && (
                <div
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.96)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                    padding: '16px',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    width: '260px',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E1E1E' }}>
                    Filter Date Range
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#7E7A72' }}>START DATE</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '10px',
                        border: '1px solid rgba(0,0,0,0.12)',
                        fontSize: '12px',
                        fontFamily: 'Satoshi',
                        color: '#1E1E1E',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#7E7A72' }}>END DATE</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '10px',
                        border: '1px solid rgba(0,0,0,0.12)',
                        fontSize: '12px',
                        fontFamily: 'Satoshi',
                        color: '#1E1E1E',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <button
                      onClick={() => {
                        setStartDate('2024-01-01');
                        setEndDate('2026-06-30');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#7E7A72',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline',
                      }}
                    >
                      Reset Filter
                    </button>

                    <button
                      onClick={() => setShowDatePicker(false)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: '#FE7216',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '11px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(254,114,22,0.3)',
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1.5fr 1fr',
              padding: '0 12px 6px 12px',
              fontSize: '13px',
              fontWeight: '700',
              color: '#7E7A72',
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <div>Name</div>
            <div>Saved Date</div>
            <div>Data</div>
          </div>

          {/* Scrollable Table Body */}
          <div
            className="custom-scroll"
            style={{
              maxHeight: '170px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 1.5fr 1fr',
                    padding: '12px',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                    alignItems: 'center',
                    fontSize: '13px',
                    color: '#7E7A72',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ color: '#1E1E1E', fontWeight: '600' }}>{item.title || item.name}</div>
                  <div>{item.saved_date || item.savedDate || 'Recently'}</div>
                  <div>
                    <span
                      onClick={() => handleDownloadReport(item)}
                      style={{
                        color: '#7E7A72',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: '600',
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#FE7216')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#7E7A72')}
                    >
                      {item.data || 'Document'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#7E7A72', fontSize: '13px', fontWeight: '500' }}>
                No reports found in the selected date range.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: HIGHEST-ENGAGING POST */}
      <div
        style={{
          width: '25%',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '20px',
          padding: '20px',
          boxSizing: 'border-box',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#1E1E1E' }}>
          Highest-engaging Post
        </h2>
        <div style={{ fontSize: '12px', color: '#7E7A72', fontWeight: '500', marginTop: '2px' }}>
          top 7 best posts
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.08)', margin: '14px 0 6px 0' }} />

        {/* Scrollable Post List */}
        <div
          className="custom-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {topPosts.length > 0 ? (
            topPosts.map((post) => (
              <div
                key={post.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '13px 0',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                  fontSize: '13px',
                }}
              >
                <span style={{ color: '#1E1E1E', fontWeight: '500' }}>{post.title}</span>
                <button
                  onClick={() => handleViewPost(post)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FE7216',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                    fontFamily: 'Satoshi',
                  }}
                >
                  View
                </button>
              </div>
            ))
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#7E7A72', fontSize: '13px', fontWeight: '500' }}>
              No published posts yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
