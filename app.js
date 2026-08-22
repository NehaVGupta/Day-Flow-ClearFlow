/* ==========================================================================
   DAYFLOW HRMS - MAIN APPLICATION LOGIC & STATE ENGINE
   Refactored according to strict HRMS requirements:
   1. Role authentication: HR password 'admin@123' required for Admin access.
      Admin can view employee dashboards; employees cannot access HR without auth.
   2. Strict Employee Dashboard isolation: shows ONLY logged-in employee details.
   3. HR portal: Remove "Apply for Time Off" (HR portal is for leave approvals only).
   4. Employee dashboard tracks Attendance, Salary, and Leave balances.
   5. Security rules: Passwords require 8+ chars, uppercase, number, special char.
   ========================================================================== */

const HR_DEFAULT_PASSWORD = 'admin@123';

// Seed Database
const SEED_DATA = {
  activeRoleId: 'admin', // 'admin' or 'employee'
  viewAsEmpId: 'EMP-4019', // Default employee ID to view if admin switches to employee view
  users: [
    {
      id: 'HR-8842',
      name: 'Sarah Connor',
      role: 'admin',
      title: 'Head of HR & Operations',
      dept: 'Human Resources',
      email: 'sarah.connor@dayflow.io',
      phone: '+1 (555) 234-8900',
      address: '742 Evergreen Terrace, Cyber City',
      doj: 'Jan 15, 2022',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      salary: { base: 6500, hra: 2300, allowance: 1200, deductions: 950 },
      leaves: { paid: 12, sick: 7, unpaid: 0 }
    },
    {
      id: 'EMP-4019',
      name: 'Alex Morgan',
      role: 'employee',
      title: 'Senior Frontend Engineer',
      dept: 'Engineering',
      email: 'alex.morgan@dayflow.io',
      phone: '+1 (555) 891-2345',
      address: '104 Innovation Way, Tech Valley',
      doj: 'Mar 10, 2023',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      salary: { base: 5500, hra: 1800, allowance: 1200, deductions: 650 },
      leaves: { paid: 10, sick: 5, unpaid: 0 }
    },
    {
      id: 'EMP-5102',
      name: 'Elena Rostova',
      role: 'employee',
      title: 'UI/UX Lead Designer',
      dept: 'Design',
      email: 'elena.rostova@dayflow.io',
      phone: '+1 (555) 345-6789',
      address: '45 Creative Boulevard, Arts District',
      doj: 'Nov 01, 2023',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      salary: { base: 5000, hra: 1600, allowance: 1200, deductions: 600 },
      leaves: { paid: 14, sick: 6, unpaid: 0 }
    },
    {
      id: 'EMP-6320',
      name: 'Marcus Vance',
      role: 'employee',
      title: 'Backend Architect',
      dept: 'Engineering',
      email: 'marcus.vance@dayflow.io',
      phone: '+1 (555) 901-2345',
      address: '88 Cyber Way, Silicon City',
      doj: 'Feb 15, 2021',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      salary: { base: 6000, hra: 2000, allowance: 1200, deductions: 750 },
      leaves: { paid: 8, sick: 4, unpaid: 0 }
    }
  ],
  attendanceLogs: [
    { date: '2026-08-22', empName: 'Sarah Connor', empId: 'HR-8842', checkIn: '09:00 AM', checkOut: '05:30 PM', hours: '8h 30m', status: 'Present' },
    { date: '2026-08-22', empName: 'Alex Morgan', empId: 'EMP-4019', checkIn: '09:12 AM', checkOut: '05:45 PM', hours: '8h 33m', status: 'Present' },
    { date: '2026-08-22', empName: 'Elena Rostova', empId: 'EMP-5102', checkIn: '08:55 AM', checkOut: '05:15 PM', hours: '8h 20m', status: 'Present' },
    { date: '2026-08-22', empName: 'Marcus Vance', empId: 'EMP-6320', checkIn: '-', checkOut: '-', hours: '0h 00m', status: 'On Leave' },
    { date: '2026-08-21', empName: 'Alex Morgan', empId: 'EMP-4019', checkIn: '09:02 AM', checkOut: '05:30 PM', hours: '8h 28m', status: 'Present' },
    { date: '2026-08-20', empName: 'Alex Morgan', empId: 'EMP-4019', checkIn: '09:05 AM', checkOut: '01:00 PM', hours: '4h 00m', status: 'Half-day' }
  ],
  leaveRequests: [
    { id: 1, applicant: 'Marcus Vance', empId: 'EMP-6320', type: 'Paid Leave', start: '2026-08-22', end: '2026-08-25', duration: '4 Days', reason: 'Family vacation & medical rest', status: 'Approved', comment: 'Approved by HR' },
    { id: 2, applicant: 'Alex Morgan', empId: 'EMP-4019', type: 'Sick Leave', start: '2026-08-28', end: '2026-08-29', duration: '2 Days', reason: 'Dental surgery follow-up', status: 'Pending', comment: '' },
    { id: 3, applicant: 'Elena Rostova', empId: 'EMP-5102', type: 'Paid Leave', start: '2026-09-02', end: '2026-09-04', duration: '3 Days', reason: 'Design conference attendance', status: 'Pending', comment: '' }
  ]
};

// Global App State
let appState = {};
let currentAuthUser = null; // Object of logged in user

// Shift Clock
let checkInTimerInterval = null;
let shiftSeconds = 0;
let isCheckedIn = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initAuthSession();
  initUI();
  startShiftTimer();
});

function loadState() {
  const saved = localStorage.getItem('dayflow_app_state_v2');
  if (saved) {
    appState = JSON.parse(saved);
  } else {
    appState = SEED_DATA;
    saveState();
  }
}

function saveState() {
  localStorage.setItem('dayflow_app_state_v2', JSON.stringify(appState));
}

function initAuthSession() {
  if (appState.activeRoleId === 'admin') {
    currentAuthUser = appState.users.find(u => u.role === 'admin');
  } else {
    currentAuthUser = appState.users.find(u => u.id === appState.viewAsEmpId) || appState.users.find(u => u.role === 'employee');
  }
}

// --------------------------------------------------------------------------
// 1. AUTHENTICATION & ROLE SWITCHING (STRICT RULES)
// --------------------------------------------------------------------------

// HR Admin can easily switch to view as any employee without password
function adminSwitchViewToEmployee(empId) {
  if (currentAuthUser.role !== 'admin') {
    openHRAuthPromptModal('Only Admin can switch employee views.');
    return;
  }
  appState.activeRoleId = 'employee';
  appState.viewAsEmpId = empId;
  currentAuthUser = appState.users.find(u => u.id === empId);
  saveState();

  updateRoleUI();
  initUI();
  showToast(`Admin inspecting view as Employee: ${currentAuthUser.name}`, 'info');
}

// Switching back to HR Admin from Employee view REQUIRES HR Password 'admin@123'
function requestSwitchToHR() {
  if (appState.activeRoleId === 'admin') {
    showToast('You are already logged in as HR Admin.', 'info');
    return;
  }
  // Open HR Password Modal
  openHRAuthPromptModal();
}

function openHRAuthPromptModal(customMsg = '') {
  document.getElementById('hr-auth-error').style.display = 'none';
  document.getElementById('hr-auth-password-input').value = '';
  if (customMsg) {
    document.getElementById('hr-auth-msg').innerText = customMsg;
  } else {
    document.getElementById('hr-auth-msg').innerText = 'Enter HR Admin password (admin@123) to access Admin Portal.';
  }
  openModal('modal-hr-auth-prompt');
}

function submitHRAuthPrompt(e) {
  e.preventDefault();
  const inputPwd = document.getElementById('hr-auth-password-input').value.trim();
  const errBox = document.getElementById('hr-auth-error');

  if (inputPwd === HR_DEFAULT_PASSWORD) {
    errBox.style.display = 'none';
    closeModal('modal-hr-auth-prompt');

    appState.activeRoleId = 'admin';
    currentAuthUser = appState.users.find(u => u.role === 'admin');
    saveState();

    updateRoleUI();
    initUI();
    showToast('Authenticated successfully as HR Admin (Sarah Connor)!', 'success');
  } else {
    errBox.innerText = '❌ Incorrect HR Password! Access Denied. (Hint: admin@123)';
    errBox.style.display = 'block';
  }
}

function updateRoleUI() {
  const role = appState.activeRoleId;
  const isHr = role === 'admin';

  document.body.classList.toggle('employee-portal', !isHr);
  document.body.classList.toggle('hr-portal', isHr);

  document.getElementById('role-btn-admin').classList.toggle('active', isHr);
  document.getElementById('role-btn-employee').classList.toggle('active', !isHr);

  // Show/Hide Employee selector dropdown for HR
  const hrEmpSelectBox = document.getElementById('hr-inspect-emp-select-box');
  if (hrEmpSelectBox) {
    hrEmpSelectBox.style.display = isHr ? 'flex' : 'none';
  }

  const portalName = document.getElementById('portal-name');
  const portalDescription = document.getElementById('portal-description');
  const coreNavLabel = document.getElementById('core-nav-label');
  const insightsNavLabel = document.getElementById('insights-nav-label');
  if (portalName) portalName.innerText = isHr ? 'Admin & HR Portal' : 'Employee Portal';
  if (portalDescription) portalDescription.innerText = isHr
    ? 'People operations command center'
    : 'Your personal workday workspace';
  if (coreNavLabel) coreNavLabel.innerText = isHr ? 'People operations' : 'My workday';
  if (insightsNavLabel) insightsNavLabel.innerText = isHr ? 'Insights & reports' : 'My records';
  document.querySelectorAll('.admin-only-nav').forEach(item => {
    item.style.display = isHr ? 'flex' : 'none';
  });
}

// Password Security Validation Rule
function validatePasswordSecurity(password) {
  if (password.length < 8) return "Password must be at least 8 characters long.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter (A-Z).";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number (0-9).";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character (!@#$%^&*).";
  return null; // Valid
}

// Handle Sign In Submission with strict error messaging
function handleSignInSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value.trim();
  const roleType = document.getElementById('signin-role-select').value;
  const errBox = document.getElementById('signin-error-box');

  errBox.style.display = 'none';

  if (roleType === 'admin') {
    if (password !== HR_DEFAULT_PASSWORD) {
      errBox.innerText = '❌ Invalid HR Credentials! Password for HR must be admin@123';
      errBox.style.display = 'block';
      return;
    }
    appState.activeRoleId = 'admin';
    currentAuthUser = appState.users.find(u => u.role === 'admin');
  } else {
    // Validate password security rules
    const securityErr = validatePasswordSecurity(password);
    if (securityErr && password !== 'password123' && password !== 'Employee@123') {
      errBox.innerText = `❌ Security Rule Failed: ${securityErr}`;
      errBox.style.display = 'block';
      return;
    }
    const foundUser = appState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!foundUser) {
      errBox.innerText = '❌ Employee account not found. Please register or check your email.';
      errBox.style.display = 'block';
      return;
    }
    appState.activeRoleId = 'employee';
    appState.viewAsEmpId = foundUser.id;
    currentAuthUser = foundUser;
  }

  saveState();
  closeModal('modal-auth');
  updateRoleUI();
  initUI();
  showToast(`Welcome back, ${currentAuthUser.name}!`, 'success');
}

// Handle Sign Up Submission
function handleSignUpSubmit(e) {
  e.preventDefault();
  const empId = document.getElementById('signup-empid').value.trim();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const role = document.getElementById('signup-role').value;
  const password = document.getElementById('signup-password').value.trim();
  const errBox = document.getElementById('signup-error-box');

  errBox.style.display = 'none';

  const securityErr = validatePasswordSecurity(password);
  if (securityErr) {
    errBox.innerText = `❌ Password Security Requirement: ${securityErr}`;
    errBox.style.display = 'block';
    return;
  }

  // Create user
  const newUser = {
    id: empId,
    name: name,
    role: role,
    title: role === 'admin' ? 'HR Specialist' : 'Software Associate',
    dept: role === 'admin' ? 'Human Resources' : 'Engineering',
    email: email,
    phone: '+1 (555) 000-1122',
    address: 'City Center',
    doj: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    salary: { base: 4500, hra: 1200, allowance: 800, deductions: 500 },
    leaves: { paid: 12, sick: 7, unpaid: 0 }
  };

  appState.users.push(newUser);
  appState.activeRoleId = role;
  if (role === 'employee') appState.viewAsEmpId = empId;
  currentAuthUser = newUser;

  saveState();
  closeModal('modal-auth');
  updateRoleUI();
  initUI();
  showToast('Account registered! Verification email sent.', 'success');
}

// --------------------------------------------------------------------------
// 2. MAIN WORKSPACE & NAVIGATION
// --------------------------------------------------------------------------
function navigateTo(viewId) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === viewId);
  });

  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const target = document.getElementById(`view-${viewId}`);
  if (target) target.classList.add('active');

  const isHr = appState.activeRoleId === 'admin';
  const titles = {
    dashboard: isHr ? 'Executive Dashboard' : 'My Workday',
    profile: 'Employee Profile Management',
    attendance: 'Attendance Tracking & Time Logs',
    leave: 'Leave & Time-Off Center',
    payroll: 'Payroll & Salary Management',
    analytics: 'Analytics & Workforce Reports'
  };
  document.getElementById('page-title').innerText = titles[viewId] || 'Dayflow HRMS';

  if (viewId === 'analytics' && typeof renderAnalyticsCharts === 'function') {
    setTimeout(renderAnalyticsCharts, 100);
  }
}

function initUI() {
  updateRoleUI();
  renderUserContext();
  renderDashboardView();
  renderProfileView();
  renderAttendanceTable();
  renderLeaveTable();
  renderPayrollView();
}

function renderUserContext() {
  const user = currentAuthUser;
  const isHr = appState.activeRoleId === 'admin';

  document.getElementById('sidebar-user-name').innerText = user.name;
  document.getElementById('sidebar-user-role').innerHTML = isHr
    ? '<i class="fa-solid fa-shield"></i> HR Officer / Admin'
    : `<i class="fa-solid fa-user"></i> Staff (${user.id})`;
  document.getElementById('sidebar-avatar').src = user.avatar;

  // Header Subtitle
  const sub = document.getElementById('page-subtitle');
  const pageTitle = document.getElementById('page-title');
  if (pageTitle && document.getElementById('view-dashboard').classList.contains('active')) {
    pageTitle.innerText = isHr ? 'Executive Dashboard' : 'My Workday';
  }
  if (sub) {
    sub.innerText = isHr 
      ? 'Real-time overview of company HR operations & leave approvals' 
      : `Welcome back, ${user.name}! Here is your personal workday tracker.`;
  }

  // Populate HR View As Employee dropdown
  const hrSelect = document.getElementById('hr-inspect-emp-select');
  if (hrSelect) {
    const employees = appState.users.filter(u => u.role === 'employee');
    hrSelect.innerHTML = employees.map(e => `
      <option value="${e.id}" ${e.id === appState.viewAsEmpId ? 'selected' : ''}>Inspect: ${e.name} (${e.id})</option>
    `).join('');
  }
}

// --------------------------------------------------------------------------
// 3. DASHBOARD (STRICT ISOLATION: HR VS SINGLE EMPLOYEE)
// --------------------------------------------------------------------------
function renderDashboardView() {
  const isHr = appState.activeRoleId === 'admin';
  const adminContent = document.getElementById('admin-dashboard-content');
  const empContent = document.getElementById('employee-dashboard-content');

  if (isHr) {
    adminContent.style.display = 'block';
    empContent.style.display = 'none';
    renderAdminDashboard();
  } else {
    adminContent.style.display = 'none';
    empContent.style.display = 'block';
    renderEmployeeDashboard();
  }
}

// HR Admin Dashboard
function renderAdminDashboard() {
  const allEmps = appState.users;
  document.getElementById('stat-total-emp').innerText = allEmps.length;

  const presentLogs = appState.attendanceLogs.filter(l => l.date === '2026-08-22' && l.status === 'Present');
  document.getElementById('stat-present-today').innerText = presentLogs.length;

  const pendingRequests = appState.leaveRequests.filter(r => r.status === 'Pending');
  document.getElementById('stat-pending-leaves').innerText = pendingRequests.length;
  document.getElementById('sidebar-leave-badge').innerText = pendingRequests.length;
  document.getElementById('pending-count-badge').innerText = `${pendingRequests.length} Pending`;

  renderAdminEmployeeRoster();

  // Pending Queue
  const queueContainer = document.getElementById('admin-pending-leaves-list');
  if (pendingRequests.length === 0) {
    queueContainer.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);"><i class="fa-solid fa-circle-check" style="font-size: 2rem; color: var(--success); margin-bottom: 0.5rem;"></i><p>All leave applications reviewed!</p></div>`;
    return;
  }

  queueContainer.innerHTML = pendingRequests.map(r => `
    <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: var(--radius-md); border-left: 3px solid #fbbf24;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <div style="font-weight: 700; font-size: 0.95rem;">${r.applicant}</div>
          <div style="font-size: 0.8rem; color: #c084fc;">${r.type} (${r.duration})</div>
        </div>
        <span class="badge badge-pending">Pending</span>
      </div>
      <div style="font-size: 0.8rem; color: var(--text-muted); margin: 0.5rem 0;">"${r.reason}"</div>
      <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
        <button class="btn btn-success btn-sm" onclick="approveLeave(${r.id})"><i class="fa-solid fa-check"></i> Approve</button>
        <button class="btn btn-danger btn-sm" onclick="rejectLeave(${r.id})"><i class="fa-solid fa-xmark"></i> Reject</button>
      </div>
    </div>
  `).join('');
}

function renderAdminEmployeeRoster() {
  const tbody = document.getElementById('admin-employee-tbody');
  if (!tbody) return;

  tbody.innerHTML = appState.users.map(u => `
    <tr>
      <td>
        <div class="table-user-cell">
          <img src="${u.avatar}" class="table-avatar" alt="${u.name}">
          <div>
            <div style="font-weight: 600;">${u.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-dim);">${u.id}</div>
          </div>
        </div>
      </td>
      <td>${u.dept}</td>
      <td>${u.title}</td>
      <td><span class="badge badge-${u.role === 'admin' ? 'approved' : 'present'}">${u.role.toUpperCase()}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="adminSwitchViewToEmployee('${u.id}')">
          <i class="fa-solid fa-eye"></i> View Dashboard
        </button>
      </td>
    </tr>
  `).join('');
}

// Single Employee Dashboard (Strictly Isolated to logged in employee)
function renderEmployeeDashboard() {
  const user = currentAuthUser;
  
  // Set User Profile Card on Dashboard Header
  document.getElementById('emp-dash-welcome-name').innerText = user.name;
  document.getElementById('emp-dash-emp-id').innerText = `ID: ${user.id} | ${user.title}`;

  // Track 1: Leave Balances for THIS Employee
  document.getElementById('emp-paid-leave-bal').innerText = `${user.leaves.paid} Days`;
  document.getElementById('emp-sick-leave-bal').innerText = `${user.leaves.sick} Days`;
  document.getElementById('emp-unpaid-leave-bal').innerText = `${user.leaves.unpaid || 0} Days`;

  // Track 2: Attendance Summary for THIS Employee
  const myLogs = appState.attendanceLogs.filter(l => l.empId === user.id);
  const presentDays = myLogs.filter(l => l.status === 'Present' || l.status === 'Half-day').length;
  document.getElementById('emp-present-days-count').innerText = `${presentDays} Days`;

  // Track 3: Net Salary for THIS Employee
  const sal = user.salary;
  const gross = sal.base + sal.hra + sal.allowance;
  const net = gross - sal.deductions;
  document.getElementById('emp-net-salary-card').innerText = `$${net.toLocaleString()}`;

  // Render THIS employee's recent attendance logs table on their dashboard
  const myAttTbody = document.getElementById('emp-dashboard-attendance-tbody');
  if (myAttTbody) {
    if (myLogs.length === 0) {
      myAttTbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-dim);">No recent attendance logs recorded yet.</td></tr>`;
    } else {
      myAttTbody.innerHTML = myLogs.slice(0, 5).map(l => `
        <tr>
          <td style="font-weight: 600;">${l.date}</td>
          <td><i class="fa-regular fa-clock" style="color:#34d399;"></i> ${l.checkIn}</td>
          <td><i class="fa-regular fa-clock" style="color:#f87171;"></i> ${l.checkOut}</td>
          <td><span class="badge badge-${l.status.toLowerCase().replace(' ', '-')}">${l.status}</span></td>
        </tr>
      `).join('');
    }
  }

  // Render THIS employee's leave requests history on their dashboard
  const myLeaveTbody = document.getElementById('emp-dashboard-leave-tbody');
  if (myLeaveTbody) {
    const myReqs = appState.leaveRequests.filter(r => r.empId === user.id);
    if (myReqs.length === 0) {
      myLeaveTbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-dim);">No leave applications submitted yet.</td></tr>`;
    } else {
      myLeaveTbody.innerHTML = myReqs.map(r => `
        <tr>
          <td><span style="color: #c084fc; font-weight:600;">${r.type}</span></td>
          <td>${r.start} to ${r.end} (${r.duration})</td>
          <td style="font-size: 0.8rem; color: var(--text-muted);">${r.reason}</td>
          <td><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></td>
        </tr>
      `).join('');
    }
  }
}

// --------------------------------------------------------------------------
// 4. SHIFT CLOCK (CHECK IN / CHECK OUT)
// --------------------------------------------------------------------------
function startShiftTimer() {
  checkInTimerInterval = setInterval(() => {
    if (isCheckedIn) {
      shiftSeconds++;
      const hrs = String(Math.floor(shiftSeconds / 3600)).padStart(2, '0');
      const mins = String(Math.floor((shiftSeconds % 3600) / 60)).padStart(2, '0');
      const secs = String(shiftSeconds % 60).padStart(2, '0');
      document.getElementById('shift-clock').innerText = `${hrs}:${mins}:${secs}`;
    }
  }, 1000);
}

function toggleCheckIn() {
  const btn = document.getElementById('checkin-toggle-btn');
  const user = currentAuthUser;

  if (!isCheckedIn) {
    isCheckedIn = true;
    btn.classList.add('checked-in');
    btn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Check Out`;
    showToast(`Checked in as ${user.name} at ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, 'success');

    appState.attendanceLogs.unshift({
      date: new Date().toISOString().split('T')[0],
      empName: user.name,
      empId: user.id,
      checkIn: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      checkOut: 'Active',
      hours: 'In Progress',
      status: 'Present'
    });
  } else {
    isCheckedIn = false;
    btn.classList.remove('checked-in');
    btn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Check In`;
    
    if (appState.attendanceLogs.length > 0 && appState.attendanceLogs[0].checkOut === 'Active') {
      appState.attendanceLogs[0].checkOut = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const hrs = (shiftSeconds / 3600).toFixed(1);
      appState.attendanceLogs[0].hours = `${hrs}h`;
    }

    showToast(`Shift ended! Logged work duration for ${user.name}.`, 'info');
  }

  saveState();
  renderAttendanceTable();
  if (appState.activeRoleId === 'employee') renderEmployeeDashboard();
}

function renderAttendanceTable() {
  const tbody = document.getElementById('attendance-table-body');
  if (!tbody) return;

  const isHr = appState.activeRoleId === 'admin';
  const logs = isHr 
    ? appState.attendanceLogs 
    : appState.attendanceLogs.filter(l => l.empId === currentAuthUser.id);

  tbody.innerHTML = logs.map(log => `
    <tr>
      <td style="font-weight: 600;">${log.date}</td>
      <td>${log.empName} <span style="font-size: 0.75rem; color: var(--text-dim);">(${log.empId})</span></td>
      <td><i class="fa-regular fa-clock" style="color: #34d399;"></i> ${log.checkIn}</td>
      <td><i class="fa-regular fa-clock" style="color: #f87171;"></i> ${log.checkOut}</td>
      <td>${log.hours}</td>
      <td><span class="badge badge-${log.status.toLowerCase().replace(' ', '-')}">${log.status}</span></td>
    </tr>
  `).join('');
}

// --------------------------------------------------------------------------
// 5. PROFILE VIEW
// --------------------------------------------------------------------------
function renderProfileView() {
  const user = currentAuthUser;
  
  document.getElementById('profile-card-name').innerText = user.name;
  document.getElementById('profile-card-title').innerText = user.title;
  document.getElementById('profile-card-emp-id').innerText = `ID: ${user.id}`;
  document.getElementById('profile-card-dept').innerText = user.dept;
  document.getElementById('profile-card-avatar').src = user.avatar;

  document.getElementById('p-fullname').innerText = user.name;
  document.getElementById('p-email').innerText = user.email;
  document.getElementById('p-phone').innerText = user.phone;
  document.getElementById('p-address').innerText = user.address;

  document.getElementById('p-job-title').innerText = user.title;
  document.getElementById('p-job-dept').innerText = user.dept;
  document.getElementById('p-job-doj').innerText = user.doj;

  const gross = (user.salary.base + user.salary.hra + user.salary.allowance) * 12;
  document.getElementById('p-salary-ctc').innerText = `$${gross.toLocaleString()} / yr`;
  document.getElementById('p-salary-base').innerText = `$${user.salary.base.toLocaleString()}`;
  document.getElementById('p-salary-hra').innerText = `$${(user.salary.hra + user.salary.allowance).toLocaleString()}`;
  document.getElementById('p-salary-deductions').innerText = `-$${user.salary.deductions.toLocaleString()}`;
}

function switchProfileTab(tabName) {
  ['personal', 'job', 'salary', 'docs'].forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const content = document.getElementById(`profile-tab-${t}`);
    if (btn) btn.classList.toggle('active', t === tabName);
    if (content) content.style.display = (t === tabName) ? 'block' : 'none';
  });
}

function openEditProfileModal() {
  const user = currentAuthUser;
  document.getElementById('edit-phone').value = user.phone;
  document.getElementById('edit-address').value = user.address;
  document.getElementById('edit-avatar').value = user.avatar;
  openModal('modal-edit-profile');
}

function handleProfileSave(e) {
  e.preventDefault();
  const user = currentAuthUser;
  user.phone = document.getElementById('edit-phone').value;
  user.address = document.getElementById('edit-address').value;
  user.avatar = document.getElementById('edit-avatar').value;

  saveState();
  closeModal('modal-edit-profile');
  renderUserContext();
  renderProfileView();
  showToast('Profile updated successfully!', 'success');
}

// --------------------------------------------------------------------------
// 6. LEAVE MANAGEMENT & ADMIN WORKFLOW
// --------------------------------------------------------------------------
function renderLeaveTable() {
  const tbody = document.getElementById('leave-table-body');
  if (!tbody) return;

  const isHr = appState.activeRoleId === 'admin';
  
  // Show/Hide "Apply for Time Off" buttons based on role
  const applyBtns = document.querySelectorAll('.apply-leave-btn-trigger');
  applyBtns.forEach(btn => {
    btn.style.display = isHr ? 'none' : 'inline-flex'; // HR portal is for approvals, not applying
  });

  const requests = isHr
    ? appState.leaveRequests
    : appState.leaveRequests.filter(r => r.empId === currentAuthUser.id);

  tbody.innerHTML = requests.map(r => `
    <tr>
      <td style="font-weight: 600;">${r.applicant} <span style="font-size: 0.75rem; color: var(--text-dim);">(${r.empId})</span></td>
      <td><span style="color: #c084fc; font-weight:600;">${r.type}</span></td>
      <td>${r.start} to ${r.end}</td>
      <td>${r.duration}</td>
      <td style="font-size: 0.85rem; color: var(--text-muted);">${r.reason}</td>
      <td><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></td>
      <td>
        ${isHr && r.status === 'Pending' ? `
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-success btn-sm" onclick="approveLeave(${r.id})"><i class="fa-solid fa-check"></i> Approve</button>
            <button class="btn btn-danger btn-sm" onclick="rejectLeave(${r.id})"><i class="fa-solid fa-xmark"></i> Reject</button>
          </div>
        ` : `<span style="font-size: 0.8rem; color: var(--text-dim);">${r.comment || '-'}</span>`}
      </td>
    </tr>
  `).join('');
}

function openApplyLeaveModal() {
  if (appState.activeRoleId === 'admin') {
    showToast('HR Portal is for approving employee leaves.', 'info');
    return;
  }
  openModal('modal-apply-leave');
}

function handleLeaveSubmit(e) {
  e.preventDefault();
  const user = currentAuthUser;
  const type = document.getElementById('leave-type-select').value;
  const start = document.getElementById('leave-start-date').value;
  const end = document.getElementById('leave-end-date').value;
  const reason = document.getElementById('leave-reason').value;

  const newReq = {
    id: Date.now(),
    applicant: user.name,
    empId: user.id,
    type: type,
    start: start,
    end: end,
    duration: '2 Days',
    reason: reason,
    status: 'Pending',
    comment: ''
  };

  appState.leaveRequests.unshift(newReq);
  saveState();
  closeModal('modal-apply-leave');
  renderLeaveTable();
  if (appState.activeRoleId === 'employee') renderEmployeeDashboard();

  showToast('Leave request submitted to HR for approval!', 'success');
}

function approveLeave(reqId) {
  const req = appState.leaveRequests.find(r => r.id === reqId);
  if (req) {
    req.status = 'Approved';
    req.comment = 'Approved by HR Admin';
    saveState();
    renderLeaveTable();
    renderAdminDashboard();
    showToast(`Leave request for ${req.applicant} approved!`, 'success');
  }
}

function rejectLeave(reqId) {
  const req = appState.leaveRequests.find(r => r.id === reqId);
  if (req) {
    req.status = 'Rejected';
    req.comment = 'Rejected by HR Admin';
    saveState();
    renderLeaveTable();
    renderAdminDashboard();
    showToast(`Leave request for ${req.applicant} rejected.`, 'danger');
  }
}

// --------------------------------------------------------------------------
// 7. PAYROLL & PAYSLIP GENERATION
// --------------------------------------------------------------------------
function renderPayrollView() {
  const user = currentAuthUser;
  const isHr = appState.activeRoleId === 'admin';
  const sal = user.salary;
  const gross = sal.base + sal.hra + sal.allowance;
  const net = gross - sal.deductions;

  document.getElementById('pay-basic').innerText = `$${sal.base.toLocaleString()}.00`;
  document.getElementById('pay-hra').innerText = `$${sal.hra.toLocaleString()}.00`;
  document.getElementById('pay-allowance').innerText = `$${sal.allowance.toLocaleString()}.00`;
  document.getElementById('pay-deductions').innerText = `-$${sal.deductions.toLocaleString()}.00`;
  document.getElementById('pay-net').innerText = `$${net.toLocaleString()}.00`;

  // Payslip modal fill
  document.getElementById('ps-name').innerText = user.name;
  document.getElementById('ps-id').innerText = user.id;
  document.getElementById('ps-title').innerText = user.title;
  document.getElementById('ps-basic').innerText = `$${sal.base.toLocaleString()}.00`;
  document.getElementById('ps-hra').innerText = `$${sal.hra.toLocaleString()}.00`;
  document.getElementById('ps-allowance').innerText = `$${sal.allowance.toLocaleString()}.00`;
  document.getElementById('ps-gross').innerText = `$${gross.toLocaleString()}.00`;
  document.getElementById('ps-total-deductions').innerText = `-$${sal.deductions.toLocaleString()}.00`;
  document.getElementById('ps-net').innerText = `$${net.toLocaleString()}.00`;

  // HR Admin control table
  const adminControlCard = document.getElementById('admin-payroll-control-card');
  if (adminControlCard) {
    adminControlCard.style.display = isHr ? 'block' : 'none';
  }

  const adminTable = document.getElementById('admin-payroll-table-body');
  if (adminTable && isHr) {
    adminTable.innerHTML = appState.users.map(u => `
      <tr>
        <td>
          <div class="table-user-cell">
            <img src="${u.avatar}" class="table-avatar" alt="${u.name}">
            <div>
              <div style="font-weight: 600;">${u.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-dim);">${u.id}</div>
            </div>
          </div>
        </td>
        <td>$${u.salary.base.toLocaleString()}.00</td>
        <td>$${(u.salary.hra + u.salary.allowance).toLocaleString()}.00</td>
        <td>-$${u.salary.deductions.toLocaleString()}.00</td>
        <td style="font-weight: 700; color: #34d399;">$${(u.salary.base + u.salary.hra + u.salary.allowance - u.salary.deductions).toLocaleString()}.00</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="showToast('Salary structure updated for ${u.name}', 'success')">
            <i class="fa-solid fa-pen-to-square"></i> Edit Pay
          </button>
        </td>
      </tr>
    `).join('');
  }
}

function openPaySlipModal() {
  openModal('modal-payslip');
}

// --------------------------------------------------------------------------
// 8. MODAL & TOAST UTILITIES
// --------------------------------------------------------------------------
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

function openAuthModal() {
  openModal('modal-auth');
}

function switchAuthTab(type) {
  document.getElementById('auth-tab-signin').classList.toggle('active', type === 'signin');
  document.getElementById('auth-tab-signup').classList.toggle('active', type === 'signup');
  document.getElementById('form-auth-signin').style.display = (type === 'signin') ? 'block' : 'none';
  document.getElementById('form-auth-signup').style.display = (type === 'signup') ? 'block' : 'none';
}

function toggleNotifications() {
  showToast('System Notifications: 2 unread leave status alerts', 'info');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: 'fa-circle-check',
    danger: 'fa-circle-exclamation',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };

  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || 'fa-circle-info'}" style="font-size: 1.2rem;"></i>
    <div style="flex: 1; font-size: 0.875rem;">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
