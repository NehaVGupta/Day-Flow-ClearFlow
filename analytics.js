/* ==========================================================================
   DAYFLOW HRMS - ANALYTICS & VISUAL REPORTING ENGINE
   Custom HTML5 Canvas Charting System for Attendance, Salary & Leave Metrics
   ========================================================================== */

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

  const data = [
    { day: 'Mon', val: 95 },
    { day: 'Tue', val: 98 },
    { day: 'Wed', val: 92 },
    { day: 'Thu', val: 96 },
    { day: 'Fri', val: 89 }
  ];

  const barWidth = 36;
  const gap = (width - 60 - data.length * barWidth) / (data.length - 1);
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

    ctx.fillStyle = '#64748b';
    ctx.font = '10px Plus Jakarta Sans';
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

    // Value text
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px Plus Jakarta Sans';
    ctx.textAlign = 'center';
    ctx.fillText(`${item.val}%`, x + barWidth / 2, y - 6);

    // Day label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Plus Jakarta Sans';
    ctx.fillText(item.day, x + barWidth / 2, height - 12);
  });
}

// 2. Department Salary Expenditure Donut / Pie Chart
function renderSalaryPieChart() {
  const canvas = document.getElementById('chart-salary');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const width = canvas.width = canvas.parentElement.clientWidth - 40 || 400;
  const height = canvas.height = 200;

  ctx.clearRect(0, 0, width, height);

  const departments = [
    { name: 'Engineering', val: 52000, color: '#6366f1' },
    { name: 'Human Resources', val: 24000, color: '#38bdf8' },
    { name: 'Product & Design', val: 38000, color: '#34d399' },
    { name: 'Sales & Marketing', val: 28500, color: '#fbbf24' }
  ];

  const total = departments.reduce((acc, d) => acc + d.val, 0);
  const centerX = width * 0.35;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 20;

  let startAngle = -Math.PI / 2;

  departments.forEach(dept => {
    const sliceAngle = (dept.val / total) * 2 * Math.PI;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.arc(centerX, centerY, radius * 0.55, startAngle + sliceAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = dept.color;
    ctx.fill();

    startAngle += sliceAngle;
  });

  // Center Total Label
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 13px Outfit';
  ctx.textAlign = 'center';
  ctx.fillText('TOTAL CTC', centerX, centerY - 6);
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 11px Plus Jakarta Sans';
  ctx.fillText(`$${(total / 1000).toFixed(0)}k/mo`, centerX, centerY + 12);

  // Legend
  const legendX = width * 0.65;
  let legendY = 35;

  departments.forEach(dept => {
    ctx.fillStyle = dept.color;
    ctx.beginPath();
    ctx.arc(legendX, legendY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '11px Plus Jakarta Sans';
    ctx.textAlign = 'left';
    ctx.fillText(`${dept.name}`, legendX + 14, legendY + 4);

    legendY += 32;
  });
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
    ctx.fillStyle = '#f8fafc';
    ctx.font = '12px Plus Jakarta Sans';
    ctx.textAlign = 'left';
    ctx.fillText(cat.label, 20, startY);

    const pct = ((cat.taken / cat.total) * 100).toFixed(0);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Plus Jakarta Sans';
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
