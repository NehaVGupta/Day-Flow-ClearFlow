/* ==========================================================================
   DAYFLOW HRMS - MAIN APPLICATION LOGIC & STATE ENGINE
   Refactored according to strict HRMS requirements:
  1. Role authentication uses an email-derived password for every account.
      Admin can view employee dashboards; employees cannot access HR without auth.
   2. Strict Employee Dashboard isolation: shows ONLY logged-in employee details.
   3. HR portal: Remove "Apply for Time Off" (HR portal is for leave approvals only).
   4. Employee dashboard tracks Attendance, Salary, and Leave balances.
  5. Account password format: first four email characters plus '@123'.
   ========================================================================== */

function getDefaultPassword(email) {
  const emailName = email.toLowerCase().split('@')[0];
  return `${emailName.slice(0, 4)}@123`;
}

function getUserPassword(user) {
  return user.password || getDefaultPassword(user.email);
}

// Seed Database
const SEED_DATA = {
  activeRoleId: 'admin', // 'admin' or 'employee'
  activeAdminId: 'HR-8842',
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
      id: 'HR-7731',
      name: 'Daniel Brooks',
      role: 'admin',
      title: 'HR Business Partner',
      dept: 'Human Resources',
      email: 'daniel.brooks@dayflow.io',
      phone: '+1 (555) 307-4412',
      address: '12 Union Square, Metro City',
      doj: 'Apr 05, 2023',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      salary: { base: 5900, hra: 2100, allowance: 1000, deductions: 800 },
      leaves: { paid: 15, sick: 8, unpaid: 0 }
    },
    {
      id: 'HR-6650',
      name: 'Nora Patel',
      role: 'admin',
      title: 'People Operations Manager',
      dept: 'Human Resources',
      email: 'nora.patel@dayflow.io',
      phone: '+1 (555) 926-5104',
      address: '84 Garden Avenue, Northside',
      doj: 'Sep 18, 2021',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      salary: { base: 6200, hra: 2200, allowance: 1150, deductions: 900 },
      leaves: { paid: 13, sick: 7, unpaid: 0 }
    },
    {
      id: 'HR-5589',
      name: 'Owen Carter',
      role: 'admin',
      title: 'Payroll & Benefits Lead',
      dept: 'People Operations',
      email: 'owen.carter@dayflow.io',
      phone: '+1 (555) 745-2386',
      address: '5 Harbor Road, West District',
      doj: 'Jan 22, 2024',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      salary: { base: 5600, hra: 1800, allowance: 950, deductions: 680 },
      leaves: { paid: 16, sick: 6, unpaid: 0 }
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
    },
    {
      id: 'EMP-7441',
      name: 'Priya Shah',
      role: 'employee',
      title: 'Product Manager',
      dept: 'Product',
      email: 'priya.shah@dayflow.io',
      phone: '+1 (555) 672-1188',
      address: '17 Market Street, Metro City',
      doj: 'Jun 12, 2022',
      avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&auto=format&fit=crop&q=80',
      salary: { base: 5800, hra: 1900, allowance: 1100, deductions: 700 },
      leaves: { paid: 11, sick: 6, unpaid: 0 }
    },
    {
      id: 'EMP-8563',
      name: 'Jordan Lee',
      role: 'employee',
      title: 'QA Automation Engineer',
      dept: 'Quality Assurance',
      email: 'jordan.lee@dayflow.io',
      phone: '+1 (555) 284-9301',
      address: '29 Test Lane, Innovation Park',
      doj: 'Aug 08, 2024',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      salary: { base: 4700, hra: 1500, allowance: 900, deductions: 520 },
      leaves: { paid: 15, sick: 8, unpaid: 0 }
    },
    {
      id: 'EMP-9674',
      name: 'Maya Williams',
      role: 'employee',
      title: 'Marketing Specialist',
      dept: 'Marketing',
      email: 'maya.williams@dayflow.io',
      phone: '+1 (555) 418-7620',
      address: '63 Harbor Avenue, Lakeside',
      doj: 'Feb 20, 2025',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      salary: { base: 4300, hra: 1400, allowance: 850, deductions: 480 },
      leaves: { paid: 13, sick: 7, unpaid: 0 }
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
let isHrInspectingEmployee = false;
let passwordChangeOtp = null;

// Shift Clock
let checkInTimerInterval = null;
let shiftSeconds = 0;
let isCheckedIn = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderEmployeeAccountOptions();
  renderAdminAccountOptions();
  initAuthSession();
  initUI();
  startShiftTimer();
});

function renderEmployeeAccountOptions() {
  const accountMenu = document.getElementById('employee-account-menu');
  const accountLabel = document.getElementById('employee-account-label');
  const accountInput = document.getElementById('employee-portal-email');
  if (!accountMenu || !accountInput || !appState.users) return;

  const employees = appState.users.filter(user => user.role === 'employee');
  accountMenu.innerHTML = employees.map(employee => `
    <button class="employee-account-option" type="button" role="option" data-email="${employee.email}" onclick="selectEmployeeAccount('${employee.email}', '${employee.name}')">
      <strong>${employee.name}</strong>
      <span>${employee.email}</span>
    </button>
  `).join('');

  const selectedEmployee = employees.find(employee => employee.email === accountInput.value) || employees[0];
  if (selectedEmployee) selectEmployeeAccount(selectedEmployee.email, selectedEmployee.name, false);
}

function renderAdminAccountOptions() {
  const accountMenu = document.getElementById('admin-account-menu');
  const accountLabel = document.getElementById('admin-account-label');
  const accountInput = document.getElementById('admin-portal-email');
  if (!accountMenu || !accountInput || !appState.users) return;

  const admins = appState.users.filter(user => user.role === 'admin');
  accountMenu.innerHTML = admins.map(admin => `
    <button class="employee-account-option" type="button" role="option" data-email="${admin.email}" onclick="selectAdminAccount('${admin.email}', '${admin.name}')">
      <strong>${admin.name}</strong>
      <span>${admin.email}</span>
    </button>
  `).join('');

  const selectedAdmin = admins.find(admin => admin.email === accountInput.value) || admins[0];
  if (selectedAdmin) selectAdminAccount(selectedAdmin.email, selectedAdmin.name, false);
}

function toggleAdminAccountPicker() {
  const menu = document.getElementById('admin-account-menu');
  const trigger = document.getElementById('admin-account-trigger');
  if (!menu || !trigger) return;
  const isOpen = menu.classList.toggle('open');
  trigger.setAttribute('aria-expanded', String(isOpen));
}

function selectAdminAccount(email, name, closeMenu = true) {
  const accountInput = document.getElementById('admin-portal-email');
  const accountLabel = document.getElementById('admin-account-label');
  const menu = document.getElementById('admin-account-menu');
  const trigger = document.getElementById('admin-account-trigger');
  if (!accountInput || !accountLabel) return;

  accountInput.value = email;
  accountLabel.innerHTML = `<strong>${name}</strong><span>${email}</span>`;
  document.querySelectorAll('.admin-account-picker .employee-account-option').forEach(option => {
    option.classList.toggle('selected', option.dataset.email === email);
  });
  if (closeMenu && menu && trigger) {
    menu.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  }
}

function toggleEmployeeAccountPicker() {
  const menu = document.getElementById('employee-account-menu');
  const trigger = document.getElementById('employee-account-trigger');
  if (!menu || !trigger) return;
  const isOpen = menu.classList.toggle('open');
  trigger.setAttribute('aria-expanded', String(isOpen));
}

function selectEmployeeAccount(email, name, closeMenu = true) {
  const accountInput = document.getElementById('employee-portal-email');
  const accountLabel = document.getElementById('employee-account-label');
  const menu = document.getElementById('employee-account-menu');
  const trigger = document.getElementById('employee-account-trigger');
  if (!accountInput || !accountLabel) return;

  accountInput.value = email;
  accountLabel.innerHTML = `<strong>${name}</strong><span>${email}</span>`;
  document.querySelectorAll('.employee-account-option').forEach(option => {
    option.classList.toggle('selected', option.dataset.email === email);
  });
  if (closeMenu && menu && trigger) {
    menu.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  }
}

function handlePortalLogin(e, role) {
  e.preventDefault();
  const prefix = role === 'admin' ? 'admin' : 'employee';
  const email = document.getElementById(`${prefix}-portal-email`).value.trim();
  const password = document.getElementById(`${prefix}-portal-password`).value.trim();
  const error = document.getElementById(`${prefix}-portal-error`);
  error.innerText = '';

  if (role === 'admin') {
    const hrUser = appState.users.find(u => u.role === 'admin' && u.email.toLowerCase() === email.toLowerCase());
    if (!hrUser || password !== getUserPassword(hrUser)) {
      error.innerText = 'Invalid HR email or password. Please check your credentials.';
      return;
    }
    currentAuthUser = hrUser;
    appState.activeRoleId = 'admin';
    appState.activeAdminId = hrUser.id;
    isHrInspectingEmployee = false;
  } else {
    const employee = appState.users.find(u => u.role === 'employee' && u.email.toLowerCase() === email.toLowerCase());
    if (!employee || password !== getUserPassword(employee)) {
      error.innerText = 'Invalid employee email or password. Please check your credentials.';
      return;
    }
    currentAuthUser = employee;
    appState.activeRoleId = 'employee';
    appState.viewAsEmpId = employee.id;
    isHrInspectingEmployee = false;
  }

  saveState();
  document.body.classList.add('portal-session');
  showWorkspaceAfterLogin();
  updateRoleUI();
  initUI();
  showToast(`Welcome back, ${currentAuthUser.name}!`, 'success');
}

function showWorkspaceAfterLogin() {
  const portalEntryScreen = document.getElementById('portal-entry-screen');
  if (portalEntryScreen) {
    portalEntryScreen.setAttribute('aria-hidden', 'true');
    portalEntryScreen.style.display = 'none';
  }
  window.scrollTo(0, 0);
}

function loadState() {
  const saved = localStorage.getItem('dayflow_app_state_v2');
  if (saved) {
    appState = JSON.parse(saved);
    syncSeedUsers();
    syncEmployeeAttendanceData();
    saveState();
  } else {
    appState = SEED_DATA;
    syncEmployeeAttendanceData();
    saveState();
  }
}

function syncSeedUsers() {
  const existingIds = new Set(appState.users.map(user => user.id));
  const missingUsers = SEED_DATA.users.filter(user => !existingIds.has(user.id));
  appState.users.push(...missingUsers);
}

function syncEmployeeAttendanceData() {
  const employees = appState.users.filter(user => user.role === 'employee');
  const existingLogs = new Set(appState.attendanceLogs.map(log => `${log.empId}-${log.date}`));
  const startDate = new Date(Date.UTC(2026, 7, 7));

  employees.forEach((employee, employeeIndex) => {
    for (let dayOffset = 0; dayOffset < 15; dayOffset += 1) {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + dayOffset);
      if (date.getUTCDay() === 0 || date.getUTCDay() === 6) continue;

      const dateString = date.toISOString().split('T')[0];
      const logKey = `${employee.id}-${dateString}`;
      if (existingLogs.has(logKey)) continue;

      const checkInMinutes = 55 + ((dayOffset * 7 + employeeIndex * 3) % 20);
      const checkOutMinutes = 10 + ((dayOffset * 5 + employeeIndex * 4) % 25);
      appState.attendanceLogs.push({
        date: dateString,
        empName: employee.name,
        empId: employee.id,
        checkIn: `09:${String(checkInMinutes).padStart(2, '0')} AM`,
        checkOut: `05:${String(checkOutMinutes).padStart(2, '0')} PM`,
        hours: '8h 15m',
        status: 'Present'
      });
      existingLogs.add(logKey);
    }
  });

  appState.attendanceLogs.sort((first, second) => second.date.localeCompare(first.date));
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
  isHrInspectingEmployee = true;
  saveState();

  updateRoleUI();
  initUI();
  showToast(`Admin inspecting view as Employee: ${currentAuthUser.name}`, 'info');
}

// Switching back to HR Admin from Employee view requires the selected HR password.
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
    document.getElementById('hr-auth-msg').innerText = 'Enter the password for the selected HR account to access Admin Portal.';
  }
  openModal('modal-hr-auth-prompt');
}

function submitHRAuthPrompt(e) {
  e.preventDefault();
  const inputPwd = document.getElementById('hr-auth-password-input').value.trim();
  const errBox = document.getElementById('hr-auth-error');

  const hrUser = appState.users.find(u => u.id === appState.activeAdminId && u.role === 'admin') || appState.users.find(u => u.role === 'admin');
  if (hrUser && inputPwd === getUserPassword(hrUser)) {
    errBox.style.display = 'none';
    closeModal('modal-hr-auth-prompt');

    appState.activeRoleId = 'admin';
    currentAuthUser = appState.users.find(u => u.role === 'admin');
    appState.activeAdminId = currentAuthUser.id;
    isHrInspectingEmployee = false;
    saveState();

    updateRoleUI();
    initUI();
    showToast('Authenticated successfully as HR Admin (Sarah Connor)!', 'success');
  } else {
    errBox.innerText = 'Incorrect HR email password. Access denied.';
    errBox.style.display = 'block';
  }
}

function updateRoleUI() {
  const role = appState.activeRoleId;
  const isHr = role === 'admin';

  document.body.classList.toggle('employee-portal', !isHr);
  document.body.classList.toggle('hr-portal', isHr);
  document.body.classList.toggle('hr-inspecting-employee', isHrInspectingEmployee);

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
    const hrUser = appState.users.find(u => u.role === 'admin' && u.email.toLowerCase() === email.toLowerCase());
    if (!hrUser || password !== getUserPassword(hrUser)) {
      errBox.innerText = '❌ Invalid HR credentials.';
      errBox.style.display = 'block';
      return;
    }
    appState.activeRoleId = 'admin';
    currentAuthUser = appState.users.find(u => u.role === 'admin');
    appState.activeAdminId = currentAuthUser.id;
    isHrInspectingEmployee = false;
  } else {
    const foundUser = appState.users.find(u => u.role === 'employee' && u.email.toLowerCase() === email.toLowerCase());
    if (roleType !== 'employee' || !foundUser || password !== getUserPassword(foundUser)) {
      errBox.innerText = '❌ Employee account not found. Please register or check your email.';
      errBox.style.display = 'block';
      return;
    }
    appState.activeRoleId = 'employee';
    appState.viewAsEmpId = foundUser.id;
    currentAuthUser = foundUser;
    isHrInspectingEmployee = false;
  }

  saveState();
  closeModal('modal-auth');
  showWorkspaceAfterLogin();
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
  const password = getDefaultPassword(email);
  const errBox = document.getElementById('signup-error-box');

  errBox.style.display = 'none';

  // Create user
  const newUser = {
    id: empId,
    name: name,
    role: role,
    title: role === 'admin' ? 'HR Specialist' : 'Software Associate',
    dept: role === 'admin' ? 'Human Resources' : 'Engineering',
    email: email,
    password: password,
    phone: '+1 (555) 000-1122',
    address: 'City Center',
    doj: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    salary: { base: 4500, hra: 1200, allowance: 800, deductions: 500 },
    leaves: { paid: 12, sick: 7, unpaid: 0 }
  };

  appState.users.push(newUser);
  renderEmployeeAccountOptions();
  renderAdminAccountOptions();
  appState.activeRoleId = role;
  if (role === 'employee') appState.viewAsEmpId = empId;
  currentAuthUser = newUser;
  isHrInspectingEmployee = false;

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
  const readonlyNotice = document.getElementById('employee-readonly-notice');
  if (readonlyNotice) readonlyNotice.style.display = isHrInspectingEmployee ? 'block' : 'none';

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
  if (isHrInspectingEmployee) {
    showToast('HR inspection mode is read-only. Sign in through the Employee Portal to check in.', 'info');
    return;
  }
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

function openChangePasswordModal() {
  if (!currentAuthUser || currentAuthUser.role !== 'employee' || isHrInspectingEmployee) {
    showToast('Only the directly signed-in employee can change this password.', 'info');
    return;
  }

  passwordChangeOtp = String(Math.floor(100000 + Math.random() * 900000));
  document.getElementById('password-otp').value = '';
  document.getElementById('new-password').value = '';
  document.getElementById('confirm-new-password').value = '';
  document.getElementById('password-change-error').innerText = '';
  document.getElementById('password-otp-message').innerText = `A one-time code was sent to ${currentAuthUser.email}. Demo email code: ${passwordChangeOtp}`;
  openModal('modal-change-password');
}

function handlePasswordChange(e) {
  e.preventDefault();
  const error = document.getElementById('password-change-error');
  const otp = document.getElementById('password-otp').value.trim();
  const newPassword = document.getElementById('new-password').value;
  const confirmation = document.getElementById('confirm-new-password').value;

  if (!currentAuthUser || currentAuthUser.role !== 'employee' || isHrInspectingEmployee) {
    error.innerText = 'Only the directly signed-in employee can change this password.';
    return;
  }
  if (otp !== passwordChangeOtp) {
    error.innerText = 'Incorrect or expired verification code.';
    return;
  }
  if (newPassword.length < 6 || newPassword !== confirmation) {
    error.innerText = 'Passwords must match and contain at least 6 characters.';
    return;
  }

  currentAuthUser.password = newPassword;
  passwordChangeOtp = null;
  saveState();
  closeModal('modal-change-password');
  showToast('Your password was updated successfully.', 'success');
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
  const canApply = !isHr && !isHrInspectingEmployee;
  
  // Show/Hide "Apply for Time Off" buttons based on role
  const applyBtns = document.querySelectorAll('.apply-leave-btn-trigger');
  applyBtns.forEach(btn => {
    btn.style.display = canApply ? 'inline-flex' : 'none';
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
  if (isHrInspectingEmployee) {
    showToast('HR inspection mode is read-only. Sign in through the Employee Portal to apply for leave.', 'info');
    return;
  }
  if (appState.activeRoleId === 'admin') {
    showToast('HR Portal is for approving employee leaves.', 'info');
    return;
  }
  openModal('modal-apply-leave');
}

function handleLeaveSubmit(e) {
  e.preventDefault();
  if (isHrInspectingEmployee) {
    showToast('HR inspection mode is read-only. Leave was not submitted.', 'info');
    return;
  }
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

function openAddEmployeeModal() {
  if (appState.activeRoleId !== 'admin') {
    showToast('Only Admin / HR can add employees.', 'info');
    return;
  }

  switchAuthTab('signup');
  document.getElementById('signup-role').value = 'employee';
  updateSignupPassword();
  document.getElementById('signup-error-box').style.display = 'none';
  openModal('modal-auth');
}

function updateSignupPassword() {
  const email = document.getElementById('signup-email');
  const password = document.getElementById('signup-password');
  if (email && password) password.value = getDefaultPassword(email.value.trim());
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
