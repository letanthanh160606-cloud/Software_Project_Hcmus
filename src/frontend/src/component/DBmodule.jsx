import React, { useState } from 'react';
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

export default function DBmodule() {
  const componentGap = '24px';
  const userName = 'Harry Potter';
  const [NIGincrease, setNIGincrease] = useState(true);
  const monthlyIncrease = 822006;
  const HPindex = 550744;
  const KPIcard = 50;
  const graphSta = 1500;

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
    labels: ['Red', 'Blue', 'Yellow'],
    datasets: [
      {
        data: [822006, 550744],
        backgroundColor: ['#FE7216', '#FFC097'],
        borderWidth: 0,
      },
    ],
  };

  const data2 = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Monthly Growth',
      data: [400, 800, 600, 1200, 900, 1500],
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
        width: '100%',
        minHeight: 'calc(100vh - 70px)',
      }}>
      
      {/* Main Canvas */}
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
                  fontSize: '14px',
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
                  fontSize: '16px',
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
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#7E7A72',
                  fontFamily: 'Satoshi'
                }}>You guys did a wonderful job!</h1>

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
                }}>Beat last month by</h1>

                <h1 style={{
                  margin: '0px', 
                  marginTop: '0px', 
                  zIndex: 2, 
                  position: 'absolute', 
                  top: '78px', left: '15px',
                  fontSize: '32px',
                  color: 'rgba(111, 210, 129, 1)  ',
                  fontWeight: '700',
                  fontFamily: 'Satoshi'
                }}>43%</h1>

                <h1 style={{
                  margin: '0px', 
                  marginTop: '0px', 
                  zIndex: 2, 
                  position: 'absolute', 
                  bottom: '37px', left: '15px',
                  fontSize: '20px',
                  fontWeight: '1000',
                  fontFamily: 'Satoshi'
                }}>{monthlyIncrease}</h1>

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
                  fontSize: '16px',
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

                  <img src={linkedin} alt="linkedin logo" 
                  style={{ 
                    objectFit: 'cover', 
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
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#7E7A72',
                  fontFamily: 'Satoshi'
                }}>LinkedIn got the attention!</h1>

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
                }}>67%</h1>

                <h1 style={{
                  margin: '0px', 
                  marginTop: '0px', 
                  zIndex: 2, 
                  position: 'absolute', 
                  bottom: '37px', left: '15px',
                  fontSize: '20px',
                  fontWeight: '1000',
                  fontFamily: 'Satoshi'
                }}>{HPindex}</h1>
                
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
                  }}>This Month</h1>

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
              <div style={{
                width: '16%',
                height: '260px',
                borderRadius: '15px',
                overflow: 'hidden',
                position: 'relative'
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
                  <AddButton/>
                </div>

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
                  {/* Content Layer */}
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
            <div style={{
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
                <AssignedTasksTable/>
              </div>
            </div>

            {/* Recently Approved Posts */}
            <div style={{
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
                <RecentlyApproveP/>
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
          <div style={{
            width: '100%',
            height: '325px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '15px',
            padding: '15px',
            boxSizing: 'border-box'
          }}>
            <ApprovalRequests />
          </div>

          <div style={{
            width: '100%',
            height: '325px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '15px',
            padding: '15px',
            boxSizing: 'border-box'
          }}>
            <MyCalendar />
          </div>

          <div style={{
            width: '100%',
            height: '325px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '15px',
            padding: '15px',
            boxSizing: 'border-box'
          }}>
            <ChannelList />
          </div>
        </div>
      </div>

    </div>
  );
}