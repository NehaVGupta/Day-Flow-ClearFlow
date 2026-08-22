/* ==========================================================================
   DAYFLOW HRMS - ANALYTICS & VISUAL REPORTING ENGINE
   Custom HTML5 Canvas Charting System for Attendance, Salary & Leave Metrics
   ========================================================================== */

const analyticsChartState = {
  attendance: { bars: [], selected: -1, dates: [] },
  salary: { segments: [], selected: -1, departments: [] }
};

function escapeAnalyticsText(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

function getEmployeeUsers() {
  return (appState.users || []).filter(user => user.role === 'employee');
}

function getLatestAttendanceDates() {
  return [...new Set((appState.attendanceLogs || []).map(log => log.date))]
    .filter(date => {
      const day = new Date(`${date}T00:00:00`).getDay();
      return day > 0 && day < 6;
    })
    .sort((first, second) => second.localeCompare(first))
    .slice(0, 5)
    .sort();
}

function getAttendanceData() {
  const employees = getEmployeeUsers();
  return getLatestAttendanceDates().map(date => {
    const logs = (appState.attendanceLogs || []).filter(log => log.date === date);
    const byEmployee = new Map(logs.map(log => [log.empId, log]));
    const present = employees.filter(employee => byEmployee.get(employee.id)?.status === 'Present');
    const onLeave = employees.filter(employee => byEmployee.get(employee.id)?.status === 'On Leave');
    const absent = employees.filter(employee => !byEmployee.has(employee.id) || byEmployee.get(employee.id)?.status === 'Absent');
    return {
      date,
      day: new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
      total: employees.length,
      present,
      absent,
      onLeave,
      percentage: employees.length ? (present.length / employees.length) * 100 : 0
    };
  });
}

function getSalaryDepartments() {
  const groups = [
    { name: 'Engineering', departments: ['Engineering'], color: '#6366f1' },
    { name: 'Human Resources', departments: ['Human Resources'], color: '#38bdf8' },
    { name: 'Product & Design', departments: ['Product', 'Design'], color: '#34d399' },
    { name: 'Sales & Marketing', departments: ['Sales', 'Marketing'], color: '#fbbf24' }
  ];
  const users = appState.users || [];
  const assignedIds = new Set();
  const categories = groups.map(group => {
    const employees = users.filter(user => group.departments.includes(user.dept));
    employees.forEach(employee => assignedIds.add(employee.id));
    return { ...group, employees };
  });
  const otherEmployees = users.filter(user => !assignedIds.has(user.id));
  if (otherEmployees.length) {
    categories.push({ name: 'Other Departments', departments: [], color: '#f87171', employees: otherEmployees });
  }
  return categories.map(category => ({
    ...category,
    value: category.employees.reduce((total, user) => total + user.salary.base + user.salary.hra + user.salary.allowance, 0)
  })).filter(category => category.employees.length);
}

function renderAnalyticsCharts() {
  renderAttendanceTrendChart();
  renderSalaryPieChart();
  renderLeaveBarChart();
}

// 1. Weekly Attendance Trends Bar Chart
function renderAttendanceTrendChart() {
  const canvas = document.getElementById('chart-attendance');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Set resolution
  const width = canvas.width = canvas.parentElement.clientWidth - 40 || 400;
  const height = canvas.height = 200;

  ctx.clearRect(0, 0, width, height);

  const data = getAttendanceData();
  analyticsChartState.attendance.bars = [];
  analyticsChartState.attendance.dates = data;

  const barWidth = 36;
  const gap = data.length > 1 ? (width - 60 - data.length * barWidth) / (data.length - 1) : 0;
  const startX = 40;
  const maxY = 100;

  // Grid Lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = height - 30 - (i * 35);
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(width - 10, y);
    ctx.stroke();

    ctx.fillStyle = '#172B4D';
    ctx.font = '600 10px Plus Jakarta Sans';
    ctx.fillText(`${i * 25}%`, 5, y + 3);
  }

  // Draw Bars
  data.forEach((item, index) => {
    const x = startX + index * (barWidth + gap);
    const barHeight = (item.percentage / maxY) * 140;
    const y = height - 30 - barHeight;
    analyticsChartState.attendance.bars.push({ x, y, width: barWidth, height: barHeight });

    // Gradient Fill
    const gradient = ctx.createLinearGradient(0, y, 0, height - 30);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#a855f7');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, [6, 6, 0, 0]);
    ctx.fill();

    if (index === analyticsChartState.attendance.selected) {
      ctx.strokeStyle = '#172B4D';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Value text
    ctx.fillStyle = '#172B4D';
    ctx.font = '600 11px Plus Jakarta Sans';
    ctx.textAlign = 'center';
    ctx.fillText(`${item.percentage.toFixed(0)}%`, x + barWidth / 2, y - 6);

    // Day label
    ctx.fillStyle = '#172B4D';
    ctx.font = '600 11px Plus Jakarta Sans';
    ctx.fillText(item.day, x + barWidth / 2, height - 12);
  });

  canvas.onclick = event => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const selected = analyticsChartState.attendance.bars.findIndex(bar => x >= bar.x && x <= bar.x + bar.width && y >= bar.y && y <= bar.y + bar.height);
    if (selected < 0) return;
    analyticsChartState.attendance.selected = selected;
    renderAttendanceTrendChart();
    showAttendanceAnalysis(data[selected]);
  };
}

// 2. Department Salary Expenditure Donut / Pie Chart
function renderSalaryPieChart() {
  const canvas = document.getElementById('chart-salary');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const width = canvas.width = canvas.parentElement.clientWidth - 40 || 400;
  const height = canvas.height = 200;

  ctx.clearRect(0, 0, width, height);

  const departments = getSalaryDepartments();
  analyticsChartState.salary.segments = [];
  analyticsChartState.salary.departments = departments;

  const total = departments.reduce((acc, department) => acc + department.value, 0);
  const centerX = width * 0.35;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 20;

  let startAngle = -Math.PI / 2;

  departments.forEach((dept, index) => {
    const sliceAngle = (dept.value / total) * 2 * Math.PI;
    const segmentStart = startAngle;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.arc(centerX, centerY, radius * 0.55, startAngle + sliceAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = dept.color;
    ctx.fill();

    analyticsChartState.salary.segments.push({ startAngle: segmentStart, endAngle: startAngle + sliceAngle, centerX, centerY, radius });
    if (index === analyticsChartState.salary.selected) {
      ctx.strokeStyle = '#172B4D';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    startAngle += sliceAngle;
  });

  // Center Total Label
  ctx.fillStyle = '#172B4D';
  ctx.font = '600 13px Outfit';
  ctx.textAlign = 'center';
  ctx.fillText('TOTAL CTC', centerX, centerY - 6);
  ctx.fillStyle = '#172B4D';
  ctx.font = '600 11px Plus Jakarta Sans';
  ctx.fillText(`$${(total / 1000).toFixed(0)}k/mo`, centerX, centerY + 12);

  // Legend
  const legendX = width * 0.65;
  let legendY = 35;

  departments.forEach(dept => {
    ctx.fillStyle = dept.color;
    ctx.beginPath();
    ctx.arc(legendX, legendY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#172B4D';
    ctx.font = '600 11px Plus Jakarta Sans';
    ctx.textAlign = 'left';
    ctx.fillText(`${dept.name}`, legendX + 14, legendY + 4);

    legendY += 32;
  });

  canvas.onclick = event => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const distance = Math.hypot(x - centerX, y - centerY);
    if (distance < radius * 0.55 || distance > radius) return;
    let angle = Math.atan2(y - centerY, x - centerX);
    if (angle < -Math.PI / 2) angle += Math.PI * 2;
    const selected = analyticsChartState.salary.segments.findIndex(segment => {
      let start = segment.startAngle;
      let end = segment.endAngle;
      if (start < -Math.PI / 2) {
        start += Math.PI * 2;
        end += Math.PI * 2;
      }
      return angle >= start && angle <= end;
    });
    if (selected < 0) return;
    analyticsChartState.salary.selected = selected;
    renderSalaryPieChart();
    showSalaryAnalysis(departments[selected], total, departments);
  };
}

function formatAnalyticsCurrency(value) {
  return `$${value.toLocaleString()}.00`;
}

function renderEmployeeList(title, employees, statusLabel, selectedDate, includeLeaveDetails = false) {
  if (!employees.length) return `<div class="analytics-empty-state">No employees in this category.</div>`;
  return `<details class="analytics-employee-group" open><summary>${title} (${employees.length})</summary><div class="analytics-employee-list">${employees.map(employee => {
    const leave = (appState.leaveRequests || []).find(request => request.empId === employee.id && request.status !== 'Rejected' && request.start <= selectedDate && request.end >= selectedDate);
    return `<div class="analytics-employee-row"><strong>${escapeAnalyticsText(employee.name)}</strong><span>${escapeAnalyticsText(employee.id)} | ${escapeAnalyticsText(employee.dept)} | ${statusLabel}</span>${includeLeaveDetails && leave ? `<span>${escapeAnalyticsText(leave.type)}: ${escapeAnalyticsText(leave.reason)} (${escapeAnalyticsText(leave.status)})</span>` : ''}</div>`;
  }).join('')}</div></details>`;
}

function showAttendanceAnalysis(dayData) {
  const panel = document.getElementById('attendance-analysis');
  const content = document.getElementById('attendance-analysis-content');
  const title = document.getElementById('attendance-analysis-title');
  if (!panel || !content || !title) return;
  title.textContent = `${dayData.day} Attendance Analysis`;
  const absentPercentage = dayData.total ? (dayData.absent.length / dayData.total) * 100 : 0;
  const leavePercentage = dayData.total ? (dayData.onLeave.length / dayData.total) * 100 : 0;
  content.innerHTML = `<div class="analytics-metric-grid"><div><strong>${dayData.total}</strong><span>Total employees</span></div><div><strong>${dayData.present.length}</strong><span>Present</span></div><div><strong>${dayData.absent.length}</strong><span>Absent</span></div><div><strong>${dayData.onLeave.length}</strong><span>On leave</span></div><div><strong>${dayData.percentage.toFixed(1)}%</strong><span>Attendance</span></div></div><p class="analytics-summary"><strong>Present:</strong> ${dayData.percentage.toFixed(1)}% &nbsp; <strong>Absent:</strong> ${absentPercentage.toFixed(1)}% &nbsp; <strong>On Leave:</strong> ${leavePercentage.toFixed(1)}%</p>${renderEmployeeList('Absent Employees', dayData.absent, 'Absent', dayData.date)}${renderEmployeeList('Present Employees', dayData.present, 'Present', dayData.date)}${renderEmployeeList('Employees on Leave', dayData.onLeave, 'On Leave', dayData.date, true)}`;
  panel.hidden = false;
}

function hideAttendanceAnalysis() {
  const panel = document.getElementById('attendance-analysis');
  if (panel) panel.hidden = true;
  analyticsChartState.attendance.selected = -1;
  renderAttendanceTrendChart();
}

function showSalaryAnalysis(department, total, departments) {
  const panel = document.getElementById('salary-analysis');
  const content = document.getElementById('salary-analysis-content');
  const title = document.getElementById('salary-analysis-title');
  if (!panel || !content || !title) return;
  const salaries = department.employees.map(user => user.salary.base + user.salary.hra + user.salary.allowance);
  const expenditure = department.value;
  const percentage = total ? (expenditure / total) * 100 : 0;
  title.textContent = `${department.name} Salary Analysis`;
  content.innerHTML = `<div class="analytics-metric-grid"><div><strong>${department.employees.length}</strong><span>Employees</span></div><div><strong>${formatAnalyticsCurrency(expenditure)}</strong><span>Monthly expenditure</span></div><div><strong>${percentage.toFixed(1)}%</strong><span>Of total CTC</span></div><div><strong>${formatAnalyticsCurrency(salaries.length ? expenditure / salaries.length : 0)}</strong><span>Average salary</span></div><div><strong>${formatAnalyticsCurrency(salaries.length ? Math.min(...salaries) : 0)}</strong><span>Minimum salary</span></div><div><strong>${formatAnalyticsCurrency(salaries.length ? Math.max(...salaries) : 0)}</strong><span>Maximum salary</span></div></div><details class="analytics-employee-group" open><summary>Employee salary distribution</summary><div class="analytics-employee-list">${department.employees.map(user => `<div class="analytics-employee-row"><strong>${escapeAnalyticsText(user.name)}</strong><span>${escapeAnalyticsText(user.id)} | ${escapeAnalyticsText(user.dept)} | ${formatAnalyticsCurrency(user.salary.base + user.salary.hra + user.salary.allowance)}</span></div>`).join('')}</div></details><details class="analytics-employee-group"><summary>Comparison with other departments</summary><div class="analytics-employee-list">${departments.filter(item => item !== department).map(item => `<div class="analytics-employee-row"><strong>${escapeAnalyticsText(item.name)}</strong><span>${formatAnalyticsCurrency(item.value)} | ${total ? ((item.value / total) * 100).toFixed(1) : '0.0'}% of total CTC</span></div>`).join('')}</div></details>`;
  panel.hidden = false;
}

function hideSalaryAnalysis() {
  const panel = document.getElementById('salary-analysis');
  if (panel) panel.hidden = true;
  analyticsChartState.salary.selected = -1;
  renderSalaryPieChart();
}

// 3. Leave Utilization Bar Chart
function renderLeaveBarChart() {
  const canvas = document.getElementById('chart-leave');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const width = canvas.width = canvas.parentElement.clientWidth - 40 || 400;
  const height = canvas.height = 200;

  ctx.clearRect(0, 0, width, height);

  const categories = [
    { label: 'Paid Leave', taken: 42, total: 60, color: '#38bdf8' },
    { label: 'Sick Leave', taken: 18, total: 30, color: '#fbbf24' },
    { label: 'Unpaid Leave', taken: 5, total: 20, color: '#f87171' }
  ];

  let startY = 30;

  categories.forEach(cat => {
    ctx.fillStyle = '#172B4D';
    ctx.font = '600 12px Plus Jakarta Sans';
    ctx.textAlign = 'left';
    ctx.fillText(cat.label, 20, startY);

    const pct = ((cat.taken / cat.total) * 100).toFixed(0);
    ctx.fillStyle = '#334155';
    ctx.font = '600 11px Plus Jakarta Sans';
    ctx.textAlign = 'right';
    ctx.fillText(`${cat.taken} / ${cat.total} days (${pct}%)`, width - 20, startY);

    // Track
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(20, startY + 10, width - 40, 14, 7);
    ctx.fill();

    // Fill
    const fillW = ((width - 40) * (cat.taken / cat.total));
    ctx.fillStyle = cat.color;
    ctx.beginPath();
    ctx.roundRect(20, startY + 10, fillW, 14, 7);
    ctx.fill();

    startY += 55;
  });
}
