import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; // NOTE: swap this for whatever toast lib WSmodule.jsx/PMmodule.jsx already use
import calendar1stBg from '../assets/calendar_1stbg.png';
import calendar2ndBg from '../assets/calendar_2ndbg.png';

const PRIORITY_COLORS = {
  high: '#E74C3C',
  medium: '#F39C12',
  low: '#2ECC71',
  workspace: '#3b82f6'
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Calenmodule({ user, userRole }) {
  const role = userRole || user?.role || 'individual';
  const isManager = role === 'manager';
  const isWorkspaceUser = role === 'manager' || role === 'member';

  // Fixed Real-World Today Date
  const today = new Date();

  // Calendar Browsing Date State (changes when switching months)
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today.getDate());

  const [timeframe, setTimeframe] = useState('Next 7 days');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeModalTask, setActiveModalTask] = useState(null);

  const [apiTasks, setApiTasks] = useState([]);
  const [todoCount, setTodoCount] = useState(0);
  const [assignedToOthersCount, setAssignedToOthersCount] = useState(0);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDescription, setNewDescription] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const PRIORITY_TYPE_LABEL = {
    low: 'Low Priority',
    medium: 'Medium Priority',
    high: 'High Priority (Urgent)',
    urgent: 'High Priority (Urgent)',
  };

  const fetchCalendarTasks = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const res = await fetch(`${API_URL}/calendar/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch calendar tasks');
      const data = await res.json(); // CalendarSummaryResponse

      const mapped = data.tasks
        .filter((t) => t.due_date)
        .map((t) => {
          const d = new Date(t.due_date);
          return {
            id: t.id,
            day: d.getDate(),
            month: d.getMonth(),
            year: d.getFullYear(),
            time: d.toTimeString().slice(0, 5),
            title: t.title,
            priority: t.source === 'workspace' ? 'workspace' : t.priority,
            type: t.source === 'workspace' && !t.is_created_by_me
              ? 'Workspace Task'
              : PRIORITY_TYPE_LABEL[t.priority] || 'Medium Priority',
            workspaceOnly: t.source === 'workspace',
            content: t.content || '',
          };
        });

      setApiTasks(mapped);
      setTodoCount(data.todo_count);
      setAssignedToOthersCount(data.assigned_to_others_count);
    } catch (err) {
      console.error('Error fetching calendar tasks', err);
    }
  };

  const handleAddTask = async () => {
    if (!newTitle.trim() || !newDueDate) {
      toast.error('Task title and due date are required');
      return;
    }
    if (newPriority === 'workspace') {
      toast.error('Please select a valid priority (Low/Medium/High)');
      return;
    }
    if (isCreatingTask) return;
    setIsCreatingTask(true);
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        title: newTitle,
        content: newDescription,
        priority: newPriority,
        due_date: new Date(newDueDate).toISOString(),
      };

      const res = await fetch(`${API_URL}/calendar/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to create task');
      }

      toast.success('Task created successfully');
      setNewTitle('');
      setNewDescription('');
      setNewDueDate('');
      setNewPriority('medium');
      setShowTaskModal(false);
      fetchCalendarTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to create task');
    } finally {
      setIsCreatingTask(false);
    }
  };

  useEffect(() => {
    fetchCalendarTasks();
  }, []);

  // Viewed month/year parameters
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const prevMonthName = MONTH_NAMES[(currentMonth - 1 + 12) % 12];
  const currentMonthName = MONTH_NAMES[currentMonth];
  const nextMonthName = MONTH_NAMES[(currentMonth + 1) % 12];

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Calendar Grid Math (Monday start: Mon=0, Tue=1, ..., Sun=6)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  let startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0

  const daysInCurrentMonthCount = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonthCount = new Date(currentYear, currentMonth, 0).getDate();

  const prevMonthDays = [];
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonthCount - i);
  }

  const currentMonthDays = Array.from({ length: daysInCurrentMonthCount }, (_, i) => i + 1);

  // Trailing days for grid layout
  const totalCellsSoFar = prevMonthDays.length + currentMonthDays.length;
  const totalGridCells = totalCellsSoFar > 35 ? 42 : 35;
  const trailingDaysCount = totalGridCells - totalCellsSoFar;
  const nextMonthDays = Array.from({ length: trailingDaysCount }, (_, i) => i + 1);

  const isCurrentRealMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  const fixedTimelineTasks = apiTasks.map((t) => {
    const deadlineDate = new Date(t.year, t.month, t.day);
    const dayName = deadlineDate.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = deadlineDate.toLocaleDateString('en-US', { month: 'long' });

    return {
      ...t,
      dateNum: t.day,
      monthNum: t.month,
      yearNum: t.year,
      fullDate: `${dayName}, ${t.day} ${monthName} ${t.year}`,
      deadlineDate: deadlineDate
    };
  });

  /*
    DYNAMIC TIMELINE FILTERING: Filtered relative to real today's date against fixed deadline dates.
  */
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const visibleTimelineTasks = fixedTimelineTasks.filter((t) => {
    // Role filter
    if (t.workspaceOnly && !isWorkspaceUser) return false;

    // Timeframe filter
    const taskDate = new Date(t.yearNum, t.monthNum, t.dateNum);
    const diffTime = taskDate.getTime() - startOfToday.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (timeframe === 'Next 7 days') {
      return diffDays >= -7 && diffDays <= 7;
    } else if (timeframe === 'Next 14 days') {
      return diffDays >= -14 && diffDays <= 14;
    } else if (timeframe === 'This Month') {
      return (
        t.monthNum === today.getMonth() &&
        t.yearNum === today.getFullYear()
      );
    }
    return true;
  });

  /*
    CALENDAR GRID INDICATORS: Shows indicator bars for tasks on the currently VIEWED month.
  */
  const getIndicatorsForDate = (dayNum) => {
    const matchingTasks = fixedTimelineTasks.filter((t) => {
      const isSameYear = t.yearNum === currentYear;
      const isSameMonth = t.monthNum === currentMonth;
      const isSameDay = t.dateNum === dayNum;
      const isAllowedRole = !t.workspaceOnly || isWorkspaceUser;
      return isSameYear && isSameMonth && isSameDay && isAllowedRole;
    });

    return matchingTasks.map((t) => PRIORITY_COLORS[t.priority]);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '97%',
        gap: '20px',
        margin: 0,
        padding: 0,
        fontFamily: 'Satoshi, system-ui, sans-serif',
        alignItems: 'flex-start'
      }}
    >
      {/* MAIN CANVAS (70%) */}
      <div
        style={{
          width: '75%',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '20px',
          padding: '20px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* ──── TOP 3 BOXES ──── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '20px',
            width: '100%',
            height: '100px'
          }}
        >
          {/* Box 1: Your Task */}
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)', borderRadius: '15px', padding: '15px', height: '100%', width: '100%', boxSizing: 'border-box', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', position: 'relative' }} >
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#5c5c5c', position: 'absolute', left: '15px', top: '15px' }}>
                Your Task
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', position: 'absolute', bottom: '15px', left: '15px' }}>
                Your unfinished tasks
              </div>
            </div>
            <div style={{ fontSize: '56px', fontWeight: '800', color: '#4b5563', position: 'absolute', right: '15px', top: '11px' }}>
              {todoCount ?? '-'}
            </div>
          </div>

          {/* Box 2: Tasks Assigned to others (Manager) OR calendar_1stbg.png image (Member/Individual) */}
          {isManager ? (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                borderRadius: '15px',
                padding: '15px',
                boxSizing: 'border-box',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                height: '100%',
                width: '100%',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#5c5c5c', position: 'absolute', left: '15px', top: '15px' }}>
                  Tasks Assigned to others
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af', position: 'absolute', bottom: '15px', left: '15px' }}>
                  Team's unfinished tasks
                </div>
              </div>
              <div style={{ fontSize: '56px', fontWeight: '800', color: '#4b5563', position: 'absolute', right: '15px', top: '11px' }}>
                {assignedToOthersCount ?? '-'}
              </div>
            </div>
          ) : (
            /* calendar_1stbg.png image when box 2 is not used */
            <div
              style={{
                borderRadius: '16px',
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                backgroundColor: 'rgba(255, 255, 255, 0.75)'
              }}
            >
              <img
                src={calendar1stBg}
                alt="Calendar 1st Background"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Box 3: calendar_2ndbg.png image background */}
          <div
            style={{
              borderRadius: '16px',
              height: '100%',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              width: '100%'
            }}
          >
            <img
              src={calendar2ndBg}
              alt="Calendar 2nd Background"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* CALENDAR CANVAS */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            borderRadius: '15px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e1e1e' }}>
              Calendar
            </span>

            {/* Add Task Button */}
            <button
              type="button"
              onClick={() => {
                setActiveModalTask(null);
                setShowTaskModal(true);
              }}
              disabled={isCreatingTask}
              style={{
                width: '25px',
                height: '25px',
                borderRadius: '50%',
                backgroundColor: '#FE7216',
                border: 'none',
                color: '#fff',
                fontSize: '20px',
                fontWeight: '200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(254, 114, 22, 0.35)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              +
            </button>
          </div>

          {/* Month Navigation Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px', marginBottom: '12px' }}>
            <span
              onClick={handlePrevMonth}
              style={{ fontSize: '13px', color: '#9ca3af', cursor: 'pointer', fontWeight: '500', userSelect: 'none' }}
            >
              &larr; {prevMonthName}
            </span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e1e1e' }}>
              {currentMonthName} {currentYear}
            </span>
            <span
              onClick={handleNextMonth}
              style={{ fontSize: '13px', color: '#9ca3af', cursor: 'pointer', fontWeight: '500', userSelect: 'none' }}
            >
              {nextMonthName} &rarr;
            </span>
          </div>

          {/* Weekday Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              paddingBottom: '8px',
              marginBottom: '8px',
            }}
          >
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
              <span key={day} style={{ fontSize: '12px', fontWeight: '700', color: '#7c7c7c' }}>
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
            }}
          >
            {/* Previous Month Leading Days */}
            {prevMonthDays.map((d) => (
              <div
                key={`prev-${d}`}
                style={{
                  height: '56px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0,0,0,0.015)',
                  padding: '6px',
                  boxSizing: 'border-box',
                  color: '#d1d5db',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                {d}
              </div>
            ))}

            {/* Current Month Days */}
            {currentMonthDays.map((d) => {
              const isToday = isCurrentRealMonth && d === today.getDate();
              const isSelected = d === selectedDate && isCurrentRealMonth;
              const dayIndicators = getIndicatorsForDate(d);

              return (
                <div
                  key={`curr-${d}`}
                  onClick={() => setSelectedDate(d)}
                  style={{
                    height: '56px',
                    borderRadius: '8px',
                    backgroundColor: isToday ? 'rgba(254, 114, 22, 0.08)' : isSelected ? 'rgba(254, 114, 22, 0.04)' : 'transparent',
                    border: isToday ? '1.5px solid #FE7216' : isSelected ? '1px solid rgba(254, 114, 22, 0.3)' : '1px solid rgba(0,0,0,0.03)',
                    padding: '6px',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isToday && !isSelected) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isToday && !isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Date Number Badge */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {isToday ? (
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: '#FE7216',
                          color: '#ffffff',
                          fontWeight: '700',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {d}
                      </div>
                    ) : (
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: isSelected ? '700' : '600',
                          color: isSelected ? '#FE7216' : '#1e1e1e',
                        }}
                      >
                        {d}
                      </span>
                    )}
                  </div>

                  {/* Task Priority Indicator Bars */}
                  {dayIndicators.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '2px' }}>
                      {dayIndicators.map((color, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: '3px',
                            height: '10px',
                            borderRadius: '2px',
                            backgroundColor: color,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Next Month Trailing Days */}
            {nextMonthDays.map((d) => (
              <div
                key={`next-${d}`}
                style={{
                  height: '56px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0,0,0,0.015)',
                  padding: '6px',
                  boxSizing: 'border-box',
                  color: '#d1d5db',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FIXED RIGHT TIMELINE PANEL (25%) */}
      <div
        style={{
          width: '25%',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '20px',
          padding: '18px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          height: '480px'
        }}
      >
        {/* Header & Dropdown */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#1e1e1e' }}>
            Timeline
          </span>

          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: '8px',
              border: '1.5px solid rgba(0,0,0,0.1)',
              backgroundColor: 'rgba(255,255,255,0.8)',
              fontSize: '12px',
              fontWeight: '500',
              color: '#1e1e1e',
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'Satoshi, system-ui, sans-serif',
            }}
          >
            <option value="Next 7 days">Next 7 days</option>
            <option value="Next 14 days">Next 14 days</option>
            <option value="This Month">This Month</option>
          </select>
        </div>

        {/* Scrollable Timeline Task List */}
        <div
          className="custom-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingRight: '4px'
          }}
        >
          {visibleTimelineTasks.length > 0 ? (
            visibleTimelineTasks.map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                {/* Colored Priority Indicator Bar */}
                <div
                  style={{
                    width: '3.5px',
                    height: '40px',
                    borderRadius: '2px',
                    backgroundColor: PRIORITY_COLORS[t.priority],
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                />

                {/* Task Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#7c7c7c' }}>
                    {t.fullDate}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e1e1e', marginTop: '2px' }}>
                    {t.time} &nbsp;<span style={{ color: '#4b5563' }}>{t.title}</span>
                  </div>
                </div>

                {/* View Action Button */}
                <span
                  onClick={() => {
                    setActiveModalTask(t);
                    setShowTaskModal(true);
                  }}
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#FE7216',
                    cursor: 'pointer',
                    paddingTop: '2px',
                  }}
                >
                  View
                </span>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', paddingTop: '20px' }}>
              No deadlines found for {timeframe}.
            </div>
          )}
        </div>
      </div>

      {/* ──── TASK DETAIL / CREATE MODAL ──── */}
      {showTaskModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '400px',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              fontFamily: 'Satoshi, system-ui, sans-serif',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e1e1e' }}>
                {activeModalTask ? 'Task Details' : 'Add New Task'}
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#7c7c7c' }}
              >
                ✕
              </button>
            </div>

            {activeModalTask ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#333' }}>
                <div><strong>Task:</strong> {activeModalTask.title}</div>
                <div><strong>Deadline:</strong> {activeModalTask.fullDate}</div>
                <div><strong>Time:</strong> {activeModalTask.time}</div>
                <div>
                  <strong>Priority / Type:</strong>{' '}
                  <span style={{
                    padding: '3px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'inline-block',
                    ...(activeModalTask.priority === 'low' ? { color: '#2ECC71', border: '1px solid #2ECC71', backgroundColor: '#EAFAF1' } :
                       activeModalTask.priority === 'medium' ? { color: '#F39C12', border: '1px solid #F39C12', backgroundColor: '#FEF5E7' } :
                       activeModalTask.priority === 'high' ? { color: '#E74C3C', border: '1px solid #E74C3C', backgroundColor: '#FDEDEC' } :
                       { color: '#3b82f6', border: '1px solid #3b82f6', backgroundColor: '#eff6ff' })
                  }}>
                    {activeModalTask.type}
                  </span>
                </div>
                {activeModalTask.content && (
                  <div><strong>Description:</strong> {activeModalTask.content}</div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Task Title (e.g. [SE - PA00])"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
                />
                <textarea
                  placeholder="Task Description..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px', resize: 'vertical', fontFamily: 'inherit' }}
                />
                <input
                  type="datetime-local"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
                />
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
                >
                  <option value="high">Red - Urgent (High Priority)</option>
                  <option value="medium">Yellow - Medium Priority</option>
                  <option value="low">Green - Low Priority</option>
                  {isWorkspaceUser && <option value="workspace">Blue - Workspace Task</option>}
                </select>
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: '1px solid #ccc',
                  backgroundColor: '#ffffff',
                  color: '#333333',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              {!activeModalTask && (
                <button
                  type="button"
                  onClick={handleAddTask}
                  disabled={isCreatingTask}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#FE7216',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Add Task
                </button>
              )}
              {activeModalTask && (
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#FE7216',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}