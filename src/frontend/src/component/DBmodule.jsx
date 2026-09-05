import React, { useState, useEffect } from 'react';
import greetingCard from '../assets/greetingcard.png';
import NIGbg from '../assets/NIGainbg.png';
import NIGbg2 from '../assets/NIGainbg2.png';
import graphbg from '../assets/DB_Graphbg.png';
import linkedin from '../assets/linkedinlg.png';
import facebook from '../assets/fblg.png';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import AssignedTasksTable from './DBultils/AssignedTaskList.jsx';
import RecentlyApproveP from './DBultils/RecentlyApprovedP.jsx';
import AddIcon from '../assets/AddButton.png';

import { ApprovalRequests, MyCalendar, ChannelList } from './DBultils/rightWidgets.jsx';

import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler, 
} from 'chart.js';

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

export default function DBmodule({ user, onNavigateTab }) {
  const componentGap = '20px';
  const userName = user?.username;
  const workspaceId =
    user?.workspace_id ||
    user?.workspace?.workspace_id ||
    user?.workspace?.workspace_uuid ||
    (typeof user?.workspace === 'string' ? user.workspace : null);
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');

  const [NIGincrease, setNIGincrease] = useState(true);
  const [netGainPct, setNetGainPct] = useState(0);
  const [monthlyIncrease, setMonthlyIncrease] = useState(0);
  const [HPindex, setHPindex] = useState(0);
  const [HPplatform, setHPplatform] = useState('Facebook');
  const [HPpercent, setHPpercent] = useState(0);
  const [KPIcard, setKPIcard] = useState(0);
  const [kpiTarget, setKpiTarget] = useState(500);
  const [kpiCurrent, setKpiCurrent] = useState(0);
  const [graphSta, setGraphSta] = useState(0);

  const [doughnutDataValues, setDoughnutDataValues] = useState([0, 0]);
  const [monthlyGraphLabels, setMonthlyGraphLabels] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [monthlyGraphData, setMonthlyGraphData] = useState([0, 0, 0, 0, 0, 0, 0]);

  // KPI popup state
  const [showKPIPopup, setShowKPIPopup] = useState(false);
  const [tempGoal, setTempGoal] = useState(500);
  const [tempPeriodStart, setTempPeriodStart] = useState('');
  const [tempPeriodEnd, setTempPeriodEnd] = useState('');

  useEffect(() => {
    const fetchDashboardAnalytics = async () => {
      const isIndividual = user?.account_type === 'individual' || (!workspaceId && user?.role === 'individual');
      if (!workspaceId && !isIndividual) {
        setDoughnutDataValues([0, 0]);
        setMonthlyGraphData([0, 0, 0, 0, 0, 0, 0]);
        setMonthlyIncrease(0);
        setGraphSta(0);
        setNetGainPct(0);
        return;
      }
      const analyticsBase = isIndividual
        ? 'http://localhost:8000/api/v1/analytics/individual'
        : `http://localhost:8000/api/v1/analytics/${workspaceId}`;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      try {
        // 1. Overview
        const ovRes = await fetch(`${analyticsBase}/overview`, { headers });
        if (ovRes.ok) {
          const ovData = await ovRes.json();
          const fbEng = ovData.facebook?.total_engagements || 0;
          const liEng = ovData.linkedin?.total_engagements || 0;
          const totalEng = fbEng + liEng;

          // Doughnut chart displays real interaction distribution
          setDoughnutDataValues([fbEng, liEng]);

          if (fbEng >= liEng) {
            setHPplatform('Facebook');
            setHPpercent(ovData.facebook?.engagement_percentage || (totalEng > 0 ? Math.round((fbEng / totalEng) * 100) : 0));
            setHPindex(fbEng);
          } else {
            setHPplatform('LinkedIn');
            setHPpercent(ovData.linkedin?.engagement_percentage || (totalEng > 0 ? Math.round((liEng / totalEng) * 100) : 0));
            setHPindex(liEng);
          }

          // Net Interaction Gain: Month-over-Month Growth
          if (ovData.monthly_gain) {
            const mg = ovData.monthly_gain;
            setNetGainPct(Math.abs(mg.gain_percentage));
            setNIGincrease(mg.is_increase);
            setMonthlyIncrease(mg.current_month_engagements);
          }
        }

        // 2. Timeline (Weekly)
        const tlRes = await fetch(`${analyticsBase}/timeline?timeframe=Weekly`, { headers });
        if (tlRes.ok) {
          const tlData = await tlRes.json();
          setMonthlyGraphLabels(tlData.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
          const fbSeries = tlData.series?.facebook || [0, 0, 0, 0, 0, 0, 0];
          const liSeries = tlData.series?.linkedin || [0, 0, 0, 0, 0, 0, 0];
          const combined = fbSeries.map((v, i) => v + (liSeries[i] || 0));
          setMonthlyGraphData(combined);
          const totalWeekly = combined.reduce((acc, curr) => acc + curr, 0);
          setGraphSta(totalWeekly);
        }

        // 3. Today stats
        const tdRes = await fetch(`${analyticsBase}/today`, { headers });
        if (tdRes.ok) {
          const tdData = await tdRes.json();
          if (tdData.total_interactions_today > 0) {
            setMonthlyIncrease((prev) => prev || tdData.total_interactions_today);
          }
        }

        // 4. KPI Goal
        const kpiRes = await fetch(`${analyticsBase}/kpi`, { headers });
        if (kpiRes.ok) {
          const kpiData = await kpiRes.json();
          setKpiTarget(kpiData.target_interactions || 500);
          setKpiCurrent(kpiData.current_interactions || 0);
          setKPIcard(kpiData.progress_percentage || 0);
          setTempGoal(kpiData.target_interactions || 500);
        }
      } catch (err) {
        console.error('Error fetching dashboard analytics:', err);
      }
    };

    fetchDashboardAnalytics();
  }, [workspaceId, token, user]);

  const AddButton = ({ onClick }) => (
    <button
      onClick={onClick}
      style={{
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: '0px',
        outline: 'none',
        transition: 'background-color 0.2s, transform 0.1s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0px) scale(1)';
      }}
    >
      <img
        src={AddIcon}
        alt="Add"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none'
        }}
      />
    </button>
  );

  const data = {
    labels: ['Facebook', 'LinkedIn'],
    datasets: [
      {
        data: doughnutDataValues[0] === 0 && doughnutDataValues[1] === 0 ? [1, 1] : doughnutDataValues,
        backgroundColor: doughnutDataValues[0] === 0 && doughnutDataValues[1] === 0 ? ['#EAEAEA', '#F2F2F2'] : ['#FE7216', '#FFC097'],
        borderWidth: 0,
      },
    ],
  };

  const data2 = {
    labels: monthlyGraphLabels,
    datasets: [
      {
        label: 'Monthly Growth',
        data: monthlyGraphData,
        borderColor: '#FE7216', 
        backgroundColor: 'rgba(254, 114, 22, 0.1)', 
        tension: 0.4, 
        fill: true, 
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false, 
      },
    },
  };

  const options2 = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' } },
    },
  };

  return (
    <div style={{
        margin: '0px', 
        padding: '0px',
        display: 'flex',
        flexDirection: 'row',
        width: '97%',
        minHeight: 'calc(100vh - 70px)',
      }}>
      
      {/* Main Canvas */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        gap: '20px',
        margin: '0px', 
        padding: '0px',
      }}>
        
        <div style={{
            width: '75%',
            minHeight: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            padding: '20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: componentGap,
        }}>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: componentGap,
              padding: '0px'
            }}>
              {/* Greeting Card */}
              <div style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '15px',
                height: '200px',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <img src={greetingCard} alt="greeting card bg" style={{ width: '100%', height: '100%', zIndex: -1, objectFit: 'cover'}}/>
                
                <h1 style={{
                  margin: '0px', 
                  marginTop: '0px', 
                  zIndex: 2, 
                  position: 'absolute', 
                  bottom: '37px', left: '15px',
                  fontSize: '16px',
                  fontWeight: '500',
                  fontFamily: 'Satoshi'
                  }}>Greetings {userName}</h1>
                  
                  <h1 style={{
                  margin: '0px', 
                  marginTop: '0px', 
                  zIndex: 2, 
                  position: 'absolute', 
                  bottom: '15px', left: '15px',
                  fontSize: '13px',
                  fontWeight: '400',
                  color: '#7E7A72',
                  fontFamily: 'Satoshi'
                  }}>Ready to create magic?</h1>
              </div>

              {/* Net Interaction Gain */}
              <div style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '15px',
                height: '200px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <img src={NIGincrease ? NIGbg : NIGbg2} alt="NIG bg" style={{ width: '100%', height: '100%', zIndex: -1, objectFit: 'cover'}}/>

                <h1 style={{
                  margin: '0px', 
                  marginTop: '0px', 
                  zIndex: 2, 
                  position: 'absolute', 
                  top: '15px', left: '15px',
                  fontSize: '14px',
                  fontWeight: '700',
                  fontFamily: 'Satoshi',
                  color: '#7E7A72'
                }}>Net Interaction Gain</h1>

                <h1 style={{
                  margin: '0px', 
                  marginTop: '0px', 
                  zIndex: 2, 
                  position: 'absolute', 
                  bottom: '15px', left: '15px',
                  fontSize: '13px',
                  fontWeight: '400',
                  color: '#7E7A72',
                  fontFamily: 'Satoshi'
                }}>You {user?.role === 'manager' ? 'guys' : ''} did a wonderful job!</h1>

                <h1 style={{
                  margin: '0px', 
                  marginTop: '0px', 
                  zIndex: 2, 
                  position: 'absolute', 
                  top: '61px', left: '15px',
                  fontSize: '14px',
                  color: '#7E7A72',
                  fontWeight: '400',
                  fontFamily: 'Satoshi'
                }}>{monthlyIncrease > 0 ? (NIGincrease ? 'Beat last month by' : 'Decreased vs last month') : 'No growth recorded'}</h1>

                <h1 style={{
                  margin: '0px', 
                  marginTop: '0px', 
                  zIndex: 2, 
                  position: 'absolute', 
                  top: '78px', left: '15px',
                  fontSize: '32px',
                  color: monthlyIncrease > 0 ? (NIGincrease ? 'rgba(111, 210, 129, 1)' : 'rgba(249, 64, 0, 1)') : '#7E7A72',
                  fontWeight: '700',
                  fontFamily: 'Satoshi'
                }}>{monthlyIncrease > 0 ? `${NIGincrease ? '+' : '-'}${netGainPct}%` : '0%'}</h1>

                <h1 style={{
                  margin: '0px', 
                  marginTop: '0px', 
                  zIndex: 2, 
                  position: 'absolute', 
                  bottom: '32px', left: '15px',
                  fontSize: '20px',
                  fontWeight: '1000',
                  fontFamily: 'Satoshi'
                }}>{monthlyIncrease.toLocaleString()}</h1>

              </div>

              {/* Highest-engaging Platform */}
              <div style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '15px',
                height: '200px',
                position: 'relative'
              }}>
                <h1 style={{
                  margin: '0px', 
                  marginTop: '0px', 
                  zIndex: 2, 
                  position: 'absolute', 
                  top: '15px', left: '15px',
                  fontSize: '14px',
                  fontWeight: '700',
                  fontFamily: 'Satoshi',
                  color: '#7E7A72'
                }}>Highest-engaging Flatform</h1>

                <div style={{
                  width: '100px',
                  height: '100px',
                  position: 'absolute',
                  right: '20px',
                  top: '50px',
                  boxSizing: 'border-box'
                }}>
                  <Doughnut data={data} options={options} />

                  <img src={HPplatform === 'Facebook' ? facebook : linkedin} alt={`${HPplatform} logo`} 
                  style={{ 
                    objectFit: 'contain', 
                    width: '30px', 
                    height: '30px',
                    position: 'absolute',
                    top: '36px',
                    right: '35px'
                    }}/>
                </div>

                <h1 style={{
                  margin: '0px', 
                  marginTop: '0px', 
                  zIndex: 2, 
                  position: 'absolute', 
                  bottom: '15px', left: '15px',
                  fontSize: '13px',
                  fontWeight: '400',
                  color: '#7E7A72',
                  fontFamily: 'Satoshi'
                }}>{HPpercent > 0 ? `${HPplatform} got the engagement!` : 'No platform activity yet'}</h1>

                <h1 style={{
                  margin: '0px', 
                  marginTop: '0px', 
                  zIndex: 2, 
                  position: 'absolute', 
                  top: '61px', left: '15px',
                  fontSize: '14px',
                  color: '#7E7A72',
                  fontWeight: '400',
                  fontFamily: 'Satoshi'
                }}>Make up</h1>

                <h1 style={{
                  margin: '0px', 
                  marginTop: '0px', 
                  zIndex: 2, 
                  position: 'absolute', 
                  top: '78px', left: '15px',
                  fontSize: '32px',
                  color: 'rgba(254, 114, 22, 1)',
                  fontWeight: '700',
                  fontFamily: 'Satoshi'
                }}>{HPpercent}%</h1>

                <h1 style={{
                  margin: '0px', 
                  marginTop: '0px', 
                  zIndex: 2, 
                  position: 'absolute', 
                  bottom: '32px', left: '15px',
                  fontSize: '20px',
                  fontWeight: '1000',
                  fontFamily: 'Satoshi'
                }}>{HPindex.toLocaleString()}</h1>
                
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: componentGap
            }}>
              {/* Graph */}
              <div style={{
                width: '84%',
                height: '260px',
                borderRadius: '15px',
                overflow: 'hidden',
                boxSizing: 'border-box',
                position: 'relative',
                padding: '15px',
                display: 'flex',        
                gap: '15px'  
              }}>
                <img 
                  src={graphbg} 
                  alt="graphbg" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    position: 'absolute',
                    top: 0, 
                    left: 0, 
                    zIndex: 0, 
                    objectFit: 'cover'
                  }}
                />

                {/* Left Section */}
                <div style={{ 
                  width: '70%', 
                  height: '100%', 
                  position: 'relative', 
                  zIndex: 1, 
                  padding: '15px', 
                  boxSizing: 'border-box',
                  backgroundColor: 'white',
                  borderRadius: '10px',
                }}>
                  <Line data={data2} options={options2} style={{ position: 'relative' }}/>
                </div>

                {/* Right Section */}
                <div style={{ 
                  width: '30%', 
                  height: '100%', 
                  position: 'relative', 
                  zIndex: 1, 
                  padding: '15px', 
                  boxSizing: 'border-box',
                  borderRadius: '10px',
                  padding: '0px',
                  position: 'relative'
                }}>
                  <h1 style={{
                    padding: '0px',
                    margin: '0px',
                    fontFamily: 'Satoshi',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '32px',
                    position: 'absolute'
                  }}>This Week</h1>

                  <h1 style={{
                    padding: '0px',
                    margin: '0px',
                    fontFamily: 'Satoshi',
                    color: 'white',
                    fontWeight: '300',
                    fontSize: '18px',
                    position: 'absolute',
                    top: '35px'
                  }}>Your team has got</h1>

                  <h1 style={{
                    padding: '0px',
                    margin: '0px',
                    fontFamily: 'Satoshi',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '24px',
                    position: 'absolute',
                    top: '94px'
                  }}>{graphSta}</h1>

                  <h1 style={{
                    padding: '0px',
                    margin: '0px',
                    fontFamily: 'Satoshi',
                    color: 'white',
                    fontWeight: '300',
                    fontSize: '18px',
                    position: 'absolute',
                    top: '122px'
                  }}>Interactions</h1>

                  <h1 style={{
                    padding: '0px',
                    margin: '0px',
                    fontFamily: 'Satoshi',
                    color: 'white',
                    fontWeight: '300',
                    fontSize: '16px',
                    position: 'absolute',
                    bottom: '0px'
                  }}>Keep up the good work!</h1>
                </div>
              </div>

              {/* KPI Tracking */}
              <div 
                title={`KPI Progress: ${kpiCurrent} / ${kpiTarget} interactions (${KPIcard}% achieved)`}
                style={{
                width: '16%',
                height: '260px',
                borderRadius: '15px',
                overflow: 'hidden',
                position: 'relative',
              }}>
                {/* Gradient background layer */}
                <div style={{
                  zIndex: 1,
                  background: 'linear-gradient(180deg, #F94000 0%, #ED9D08 100%)',
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  borderRadius: '15px'
                }}></div>

                {/* Add button */}
                <div style={{
                  position: 'absolute',
                  zIndex: 10,
                  right: '10px',
                  top: '10px', padding: '0px'
                }}>
                  <AddButton onClick={() => {
                    setTempGoal(kpiTarget);
                    setShowKPIPopup(true);
                  }}/>
                </div>

                {/* KPI Adjustment Popup */}
                {showKPIPopup && (
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100vh',
                      backgroundColor: 'rgba(0, 0, 0, 0.35)',
                      zIndex: 1000,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => setShowKPIPopup(false)}
                  >
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '28px 32px',
                        width: '400px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        fontFamily: 'Satoshi',
                      }}
                    >
                      <h2 style={{
                        margin: '0 0 6px 0',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1a1a1a',
                        fontFamily: 'Satoshi',
                      }}>Set Monthly KPI Goal</h2>
                      <p style={{
                        margin: '0 0 16px 0',
                        fontSize: '13px',
                        color: '#777',
                        fontFamily: 'Satoshi',
                      }}>Set your interaction target for this month across all channels.</p>

                      {/* Current Status Badge */}
                      <div style={{
                        backgroundColor: 'rgba(254, 114, 22, 0.08)',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        marginBottom: '18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid rgba(254, 114, 22, 0.2)'
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Current This Month</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#FE7216' }}>{kpiCurrent} interactions ({KPIcard}%)</span>
                      </div>

                      {/* Goal Index / Target */}
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#444',
                          marginBottom: '8px',
                          fontFamily: 'Satoshi',
                        }}>Target Interactions Goal</label>
                        <input
                          type="number"
                          min="1"
                          value={tempGoal}
                          onChange={(e) => {
                            const v = Math.max(1, Number(e.target.value) || 1);
                            setTempGoal(v);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            border: '1.5px solid #e0e0e0',
                            fontSize: '16px',
                            fontWeight: '600',
                            fontFamily: 'Satoshi',
                            color: '#333',
                            outline: 'none',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.2s',
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#FE7216'}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                        />
                      </div>

                      {/* View Full Stats Link */}
                      <div style={{ marginBottom: '16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setShowKPIPopup(false);
                            if (onNavigateTab) onNavigateTab('Statistics');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#FE7216',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            padding: 0,
                            fontFamily: 'Satoshi',
                            textDecoration: 'underline'
                          }}
                        >
                          View Full Statistics &gt;
                        </button>
                      </div>

                      {/* Buttons */}
                      <div style={{
                        display: 'flex',
                        gap: '10px',
                      }}>
                        <button
                          onClick={() => setShowKPIPopup(false)}
                          style={{
                            flex: 1,
                            padding: '10px 0',
                            borderRadius: '10px',
                            border: '1.5px solid #e0e0e0',
                            backgroundColor: 'white',
                            color: '#555',
                            fontSize: '14px',
                            fontWeight: '600',
                            fontFamily: 'Satoshi',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >Cancel</button>
                        <button
                          onClick={async () => {
                            if (!workspaceId) {
                              setKPIcard(Math.min(100, Math.round((kpiCurrent / tempGoal) * 100)));
                              setKpiTarget(tempGoal);
                              setShowKPIPopup(false);
                              return;
                            }
                            try {
                              const headers = { 'Content-Type': 'application/json' };
                              if (token) headers['Authorization'] = `Bearer ${token}`;
                              const res = await fetch(`http://localhost:8000/api/v1/analytics/${workspaceId}/kpi`, {
                                method: 'PUT',
                                headers,
                                body: JSON.stringify({ target_interactions: tempGoal }),
                              });
                              if (res.ok) {
                                const updated = await res.json();
                                setKpiTarget(updated.target_interactions);
                                setKpiCurrent(updated.current_interactions);
                                setKPIcard(updated.progress_percentage);
                              }
                            } catch (err) {
                              console.warn('Failed to update KPI goal:', err);
                            }
                            setShowKPIPopup(false);
                          }}
                          style={{
                            flex: 1,
                            padding: '10px 0',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #FE7216, #F94000)',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            fontFamily: 'Satoshi',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 4px 12px rgba(254, 114, 22, 0.3)',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >Apply</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Top white cover layer */}
                <div style={{
                  zIndex: 4,
                  backgroundColor: 'white',
                  width: '100%',
                  height: `${100 - KPIcard}%`,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  overflow: 'hidden' 
                }}>
                  {/* Content Layer inheriting KPI card container height (260px) */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '260px'
                  }}>
                    <h1 style={{
                      position: 'absolute',
                      top: '105px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      margin: 0,
                      padding: 0,
                      whiteSpace: 'nowrap',
                      fontFamily: 'Satoshi'
                    }}>
                      {KPIcard}%
                    </h1>

                    <h1 style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '0px',
                      margin: 0,
                      padding: '15px',
                      whiteSpace: 'nowrap',
                      color: 'black',
                      fontFamily: 'Satoshi',
                      fontSize: '22px',
                      fontWeight: '400'
                    }}>
                      Goal
                    </h1>

                    <h1 style={{
                      position: 'absolute',
                      bottom: '0px',
                      right: '0px',
                      margin: 0,
                      padding: '15px',
                      whiteSpace: 'nowrap',
                      color: 'black',
                      fontFamily: 'Satoshi',
                      fontSize: '14px',
                      fontWeight: '400'
                    }}>
                      For this month
                    </h1>
                  </div>
                </div>

                {/* Bot */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 3,
                  pointerEvents: 'none',
                  borderRadius: '15px'
                }}>
                  {/* Content Layer */}
                  <h1 style={{
                    position: 'absolute',
                    top: '105px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    margin: 0,
                    padding: 0,
                    whiteSpace: 'nowrap',
                    color: 'white',
                    fontFamily: 'Satoshi'
                  }}>
                    {KPIcard}%
                  </h1>
                  
                  <h1 style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '0px',
                    margin: 0,
                    padding: '15px',
                    whiteSpace: 'nowrap',
                    color: 'white',
                    fontFamily: 'Satoshi',
                    fontSize: '22px',
                    fontWeight: '400'
                  }}>
                    Goal
                  </h1>

                  <h1 style={{
                    position: 'absolute',
                    bottom: '0px',
                    right: '0px',
                    margin: 0,
                    padding: '15px',
                    whiteSpace: 'nowrap',
                    color: 'white',
                    fontFamily: 'Satoshi',
                    fontSize: '14px',
                    fontWeight: '400'
                  }}>
                    For this month
                  </h1>
                </div>

                  {/* Inner Shadow */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 6,
                    boxShadow: '0px -10px 15px rgba(0, 0, 0, 0.15) inset',
                    pointerEvents: 'none', 
                    borderRadius: '15px'
                  }}></div>
                </div>
              </div>

            {/* Assigned Tasks */}
            {user?.account_type === 'business' && <div style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '300px',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '15px',
              padding: '0px',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}>
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <AssignedTasksTable user={user} onNavigateTab={onNavigateTab}/>
              </div>
            </div>}

            {/* Recently Approved Posts / Recent Posts*/}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: user?.account_type === 'business' ? '300px' : '477px',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '15px',
              padding: '0px',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}>
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <RecentlyApproveP user={user} onNavigateTab={onNavigateTab}/>
              </div>
            </div>
        </div>
        
        {/* Right Canvas */}
        <div style={{
            width: '25%',
            borderRadius: '15px',
            padding: '0px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: componentGap
        }}>
          {user?.account_type === 'business' && (
            <div style={{
              width: '100%',
              height: '325px',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '15px',
              padding: '15px',
              boxSizing: 'border-box'
            }}>
              <ApprovalRequests user={user} onNavigateTab={onNavigateTab} />
            </div>
          )}

          <div style={{
            width: '100%',
            height: user?.account_type === 'business' ? '325px' : '478px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '15px',
            padding: '15px',
            boxSizing: 'border-box'
          }}>
            <MyCalendar user={user} onNavigateTab={onNavigateTab} />
          </div>

          <div style={{
            width: '100%',
            height: user?.account_type === 'business' ? '325px' : '478px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '15px',
            padding: '15px',
            boxSizing: 'border-box'
          }}>
            <ChannelList user={user} onNavigateTab={onNavigateTab} />
          </div>
        </div>
      </div>

    </div>
  );
}