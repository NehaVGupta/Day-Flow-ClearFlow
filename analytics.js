/* ==========================================================================
   DAYFLOW HRMS - ANALYTICS & VISUAL REPORTING ENGINE
   Custom HTML5 Canvas Charting System for Attendance, Salary & Leave Metrics
   ========================================================================== */

function renderAnalyticsCharts() {
  renderAttendanceTrendChart();
  renderSalaryPieChart();
  renderLeaveBarChart();
}

function getEmployeeUsers() {
  return (appState.users || []).filter(user => user.role === 'employee');
}

function escapeAnalyticsText(value) {
  return String(value ?? '-').replace(/[&<>"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  })[character]);
}

function formatAnalyticsDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
}

function getAttendanceAnalysis(date) {
  const employees = getEmployeeUsers();
  const logs = (appState.attendanceLogs || []).filter(log => log.date === date);
  const logByEmployee = new Map(logs.map(log => [log.empId, log]));
  const present = [];
  const absent = [];
  const onLeave = [];

  employees.forEach(employee => {
    const log = logByEmployee.get(employee.id);
    const record = { employee, log };
    if (log && log.status === 'Present') present.push(record);
    else if (log && log.status === 'On Leave') onLeave.push(record);
    else absent.push(record);
  });

  return {
    date,
    total: employees.length,
    present,
    absent,
    onLeave,
    percentage: employees.length ? (present.length / employees.length) * 100 : 0
  };
}

function getAttendanceDates() {
  return [...new Set((appState.attendanceLogs || []).map(log => log.date))]
    .sort((first, second) => first.localeCompare(second));
}

function renderEmployeeList(records, type) {
  if (!records.length) return '<p class="analytics-empty">None recorded</p>';
  return `<div class="analytics-employee-list">${records.map(({ employee, log }) => `
    <div class="analytics-employee-row">
      <strong>${escapeAnalyticsText(employee.name)}</strong>
      <span>${escapeAnalyticsText(employee.id)} | ${escapeAnalyticsText(employee.dept)}</span>
      <span>${type === 'leave'
        ? `${escapeAnalyticsText(log?.leaveType || getLeaveRequest(employee.id, log?.date)?.type || 'Leave')} | ${escapeAnalyticsText(log?.reason || getLeaveRequest(employee.id, log?.date)?.reason || 'Reason not recorded')} | ${escapeAnalyticsText(log?.status || getLeaveRequest(employee.id, log?.date)?.status || 'On Leave')}`
        : escapeAnalyticsText(log?.status || 'Absent')}</span>
    </div>`).join('')}</div>`;
}

function getLeaveRequest(empId, date) {
  return (appState.leaveRequests || []).find(request => request.empId === empId && request.start <= date && request.end >= date);
}

function showAttendanceAnalysis(date) {
  const analysis = getAttendanceAnalysis(date);
  const container = document.getElementById('attendance-analysis');
  if (!container) return;

  container.hidden = false;
  container.innerHTML = `
    <div class="analytics-detail-header">
      <div>
        <h4>${escapeAnalyticsText(formatAnalyticsDate(date))} Attendance Analysis</h4>
        <p>${analysis.present.length} present, ${analysis.absent.length} absent, ${analysis.onLeave.length} on leave</p>
      </div>
      <button class="analytics-detail-close" type="button" onclick="closeAnalyticsDetail('attendance-analysis')" aria-label="Close attendance analysis">&times;</button>
    </div>
    <div class="analytics-summary-grid">
      <div><strong>${analysis.total}</strong><span>Total employees</span></div>
      <div><strong>${analysis.present.length}</strong><span>Present</span></div>
      <div><strong>${analysis.absent.length}</strong><span>Absent</span></div>
      <div><strong>${analysis.onLeave.length}</strong><span>On leave</span></div>
      <div><strong>${analysis.percentage.toFixed(1)}%</strong><span>Attendance</span></div>
    </div>
    <div class="analytics-lists-grid">
      <details open><summary>Present Employees (${analysis.present.length})</summary>${renderEmployeeList(analysis.present, 'present')}</details>
      <details><summary>Absent Employees (${analysis.absent.length})</summary>${renderEmployeeList(analysis.absent, 'absent')}</details>
      <details><summary>Employees on Leave (${analysis.onLeave.length})</summary>${renderEmployeeList(analysis.onLeave, 'leave')}</details>
    </div>`;
}

function closeAnalyticsDetail(id) {
  const container = document.getElementById(id);
  if (container) {
    container.hidden = true;
    container.innerHTML = '';
  }
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

  const data = getAttendanceDates().map(date => {
    const analysis = getAttendanceAnalysis(date);
    return { date, day: new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' }), val: analysis.percentage };
  });
  if (!data.length) return;

  const barWidth = 36;
  const gap = data.length > 1 ? (width - 60 - data.length * barWidth) / (data.length - 1) : 0;
  const startX = 40;
  const maxY = 100;
  const barAreas = [];

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
    const barHeight = (item.val / maxY) * 140;
    const y = height - 30 - barHeight;

    // Gradient Fill
    const gradient = ctx.createLinearGradient(0, y, 0, height - 30);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#a855f7');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, [6, 6, 0, 0]);
    ctx.fill();

    if (canvas.dataset.selectedDate === item.date) {
      ctx.strokeStyle = '#172B4D';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    barAreas.push({ date: item.date, x, y, width: barWidth, height: barHeight });

    // Value text
    ctx.fillStyle = '#172B4D';
    ctx.font = '600 11px Plus Jakarta Sans';
    ctx.textAlign = 'center';
    ctx.fillText(`${item.val}%`, x + barWidth / 2, y - 6);

    // Day label
    ctx.fillStyle = '#172B4D';
    ctx.font = '600 11px Plus Jakarta Sans';
    ctx.fillText(item.day, x + barWidth / 2, height - 12);
  });

  canvas.onclick = event => {
    const bounds = canvas.getBoundingClientRect();
    const scaleX = canvas.width / bounds.width;
    const scaleY = canvas.height / bounds.height;
    const x = (event.clientX - bounds.left) * scaleX;
    const y = (event.clientY - bounds.top) * scaleY;
    const selectedBar = barAreas.find(area => x >= area.x && x <= area.x + area.width && y >= area.y && y <= height - 30);
    if (!selectedBar) return;
    canvas.dataset.selectedDate = selectedBar.date;
    renderAttendanceTrendChart();
    showAttendanceAnalysis(selectedBar.date);
  };
}

function getDepartmentSalaryData() {
  const departments = new Map();
  getEmployeeUsers().forEach(employee => {
    if (!departments.has(employee.dept)) departments.set(employee.dept, []);
    departments.get(employee.dept).push(employee);
  });
  const colors = ['#6366f1', '#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#fb7185'];
  const departmentData = [...departments.entries()].map(([name, employees], index) => ({
    name,
    employees,
    val: employees.reduce((total, employee) => total + employee.salary.base + employee.salary.hra + employee.salary.allowance, 0),
    color: colors[index % colors.length]
  }));
  const total = departmentData.reduce((sum, department) => sum + department.val, 0);
  return { departments: departmentData, total };
}

function showSalaryAnalysis(departmentName) {
  const { departments, total } = getDepartmentSalaryData();
  const department = departments.find(item => item.name === departmentName);
  const container = document.getElementById('salary-analysis');
  if (!department || !container) return;
  const salaries = department.employees.map(employee => employee.salary.base + employee.salary.hra + employee.salary.allowance);
  const average = salaries.length ? salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length : 0;
  const comparison = departments.filter(item => item.name !== department.name);

  container.hidden = false;
  container.innerHTML = `
    <div class="analytics-detail-header">
      <div>
        <h4>${escapeAnalyticsText(department.name)} Salary Analysis</h4>
        <p>Monthly gross salary expenditure from the employee database</p>
      </div>
      <button class="analytics-detail-close" type="button" onclick="closeAnalyticsDetail('salary-analysis')" aria-label="Close salary analysis">&times;</button>
    </div>
    <div class="analytics-summary-grid">
      <div><strong>${department.employees.length}</strong><span>Employees</span></div>
      <div><strong>$${department.val.toLocaleString()}</strong><span>Monthly expenditure</span></div>
      <div><strong>${total ? ((department.val / total) * 100).toFixed(1) : '0.0'}%</strong><span>Of total CTC</span></div>
      <div><strong>$${Math.round(average).toLocaleString()}</strong><span>Average salary</span></div>
      <div><strong>$${Math.min(...salaries).toLocaleString()}</strong><span>Minimum salary</span></div>
      <div><strong>$${Math.max(...salaries).toLocaleString()}</strong><span>Maximum salary</span></div>
    </div>
    <div class="analytics-salary-grid">
      <details open><summary>Employee Salary Distribution</summary>
        <div class="analytics-employee-list">${department.employees.map(employee => `
          <div class="analytics-employee-row"><strong>${escapeAnalyticsText(employee.name)}</strong><span>${escapeAnalyticsText(employee.id)} | ${escapeAnalyticsText(employee.title)}</span><span>$${(employee.salary.base + employee.salary.hra + employee.salary.allowance).toLocaleString()} monthly</span></div>`).join('')}</div>
      </details>
      <details><summary>Compared with Other Departments</summary>
        <div class="analytics-employee-list">${comparison.length ? comparison.map(item => `<div class="analytics-employee-row"><strong>${escapeAnalyticsText(item.name)}</strong><span>${item.employees.length} employees</span><span>$${item.val.toLocaleString()} | ${total ? ((item.val / total) * 100).toFixed(1) : '0.0'}% of total</span></div>`).join('') : '<p class="analytics-empty">No other departments recorded</p>'}</div>
      </details>
    </div>`;
}

// 2. Department Salary Expenditure Donut / Pie Chart
function renderSalaryPieChart() {
  const canvas = document.getElementById('chart-salary');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const width = canvas.width = canvas.parentElement.clientWidth - 40 || 400;
  const height = canvas.height = 200;

  ctx.clearRect(0, 0, width, height);

  const { departments, total } = getDepartmentSalaryData();
  if (!departments.length || !total) return;
  const centerX = width * 0.35;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 20;

  let startAngle = -Math.PI / 2;
  const slices = [];

  departments.forEach(dept => {
    const sliceStart = startAngle;
    const sliceAngle = (dept.val / total) * 2 * Math.PI;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.arc(centerX, centerY, radius * 0.55, startAngle + sliceAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = dept.color;
    ctx.fill();

    if (canvas.dataset.selectedDepartment === dept.name) {
      ctx.strokeStyle = '#172B4D';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    slices.push({ department: dept.name, start: sliceStart, end: sliceStart + sliceAngle });

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
  let legendY = 24;

  departments.forEach(dept => {
    ctx.fillStyle = dept.color;
    ctx.beginPath();
    ctx.arc(legendX, legendY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#172B4D';
    ctx.font = '600 10px Plus Jakarta Sans';
    ctx.textAlign = 'left';
    ctx.fillText(`${dept.name}`, legendX + 14, legendY + 4);

    legendY += 25;
  });

  canvas.onclick = event => {
    const bounds = canvas.getBoundingClientRect();
    const scaleX = canvas.width / bounds.width;
    const scaleY = canvas.height / bounds.height;
    const x = (event.clientX - bounds.left) * scaleX;
    const y = (event.clientY - bounds.top) * scaleY;
    const distance = Math.hypot(x - centerX, y - centerY);
    let angle = Math.atan2(y - centerY, x - centerX);
    if (angle < -Math.PI / 2) angle += Math.PI * 2;
    const selectedSlice = distance >= radius * 0.55 && distance <= radius && slices.find(slice => angle >= slice.start && angle <= slice.end);
    const selectedLegend = departments.find((department, index) => x >= legendX && x <= width && y >= 24 + index * 25 - 10 && y <= 24 + index * 25 + 10);
    const selectedDepartment = selectedSlice?.department || selectedLegend?.name;
    if (!selectedDepartment) return;
    canvas.dataset.selectedDepartment = selectedDepartment;
    renderSalaryPieChart();
    showSalaryAnalysis(selectedDepartment);
  };
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
