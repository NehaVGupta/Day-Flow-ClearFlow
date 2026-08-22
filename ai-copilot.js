/* ==========================================================================
   DAYFLOW HRMS - FLOWAI HR COPILOT ENGINE
   Smart Natural Language HR Chatbot & Automated Action Helper
   ========================================================================== */

function toggleAIDrawer() {
  const drawer = document.getElementById('ai-drawer');
  if (drawer) drawer.classList.toggle('active');
}

function sendQuickAISuggestion(text) {
  submitAIMessage(text);
}

function handleAISubmit(e) {
  if (e.key === 'Enter') {
    submitAIMessage();
  }
}

function submitAIMessage(selectedQuestion = '') {
  const input = document.getElementById('ai-input');
  const query = selectedQuestion.trim() || (input ? input.value.trim() : '');
  if (!query) return;

  appendChatMessage(query, 'user');
  if (input) input.value = '';

  setTimeout(() => {
    const reply = generateAIResponse(query);
    appendChatMessage(reply, 'bot');
  }, 450);
}

function appendChatMessage(text, sender) {
  const container = document.getElementById('ai-messages');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerHTML = text;

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function generateAIResponse(query) {
  const q = query.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const user = currentAuthUser || appState.users[0];
  const isHr = appState.activeRoleId === 'admin';
  const today = '2026-08-22';

  if (q === 'what is my current leave balance') {
    return `📊 <strong>Your Current Leave Balances (${user.name}):</strong><br>
    • Paid Annual Leave: <strong>${user.leaves.paid} Days</strong><br>
    • Sick / Casual Leave: <strong>${user.leaves.sick} Days</strong><br>
    • Unpaid Leave: <strong>${user.leaves.unpaid || 0} Days taken</strong><br><br>
    ${isHr ? '<em>As HR Admin, you review employee leave requests in the HR Leave Center.</em>' : '<em>Would you like me to open the leave application window?</em>'}`;
  }

  if (q === 'show my salary breakdown') {
    const gross = user.salary.base + user.salary.hra + user.salary.allowance;
    const net = gross - user.salary.deductions;
    return `💵 <strong>Salary Summary (${user.name}):</strong><br>
    • Base Salary: $${user.salary.base.toLocaleString()}<br>
    • Allowances (HRA + Special): $${(user.salary.hra + user.salary.allowance).toLocaleString()}<br>
    • Deductions (PF/Tax): -$${user.salary.deductions.toLocaleString()}<br>
    💰 <strong>Net Payout: $${net.toLocaleString()}.00</strong><br><br>
    <button class="btn btn-primary btn-sm" style="margin-top:0.4rem;" onclick="openPaySlipModal()"><i class="fa-solid fa-file-pdf"></i> View Payslip PDF</button>`;
  }

  if (q === 'what is my net salary') {
    const gross = user.salary.base + user.salary.hra + user.salary.allowance;
    const net = gross - user.salary.deductions;
    return `<strong>${user.name}'s net salary is $${net.toLocaleString()}.00</strong> after deductions of $${user.salary.deductions.toLocaleString()}.`;
  }

  if (q === 'can i view my payslip') {
    return `Yes. Your payslip is available in the Payroll & Salary section.<br><button class="btn btn-primary btn-sm" style="margin-top:0.4rem;" onclick="openPaySlipModal()"><i class="fa-solid fa-file-pdf"></i> View Payslip PDF</button>`;
  }

  if (q === 'what is my attendance status today') {
    const todayLog = appState.attendanceLogs.find(log => log.empId === user.id && log.date === today);
    return `⏱️ <strong>Attendance Status:</strong><br>
    ${todayLog ? `<strong>${todayLog.status}</strong>. Check-in: <strong>${todayLog.checkIn}</strong>; Check-out: <strong>${todayLog.checkOut}</strong>; Hours: <strong>${todayLog.hours}</strong>.` : `No attendance record is available for <strong>${user.name}</strong> today.`}`;
  }

  if (q === 'can i apply for leave') {
    if (!isHr) {
      setTimeout(openApplyLeaveModal, 600);
      return `Sure! I have opened the <strong>Apply Leave Form</strong> for you. You currently have <strong>${user.leaves.paid} Paid Leaves</strong> and <strong>${user.leaves.sick} Sick Leaves</strong> remaining.`;
    }
    return 'HR administrators can review leave requests in the <strong>HR Leave Center</strong>; leave applications are available to employees.';
  }

  if (q === 'how many pending leave requests are there') {
    const pendingRequests = appState.leaveRequests.filter(request => request.status === 'Pending');
    return `There are <strong>${pendingRequests.length} pending leave requests</strong>: ${pendingRequests.map(request => `${request.applicant} (${request.duration})`).join(', ')}.`;
  }

  if (q === 'who is on leave today') {
    const peopleOnLeave = appState.attendanceLogs.filter(log => log.date === today && log.status === 'On Leave');
    return peopleOnLeave.length
      ? `The following employee is on leave today: <strong>${peopleOnLeave.map(log => log.empName).join(', ')}</strong>.`
      : 'No employees are marked as on leave today.';
  }

  if (q === 'how many employees are in the company') {
    const employees = appState.users.filter(account => account.role === 'employee');
    return `There are <strong>${employees.length} employees</strong> in the company.`;
  }

  if (q === 'who are the hr administrators') {
    const administrators = appState.users.filter(account => account.role === 'admin');
    return `The HR administrators are: <strong>${administrators.map(account => account.name).join(', ')}</strong>.`;
  }

  if (q === 'what is my job title and department') {
    return `<strong>${user.name}</strong> is a <strong>${user.title}</strong> in the <strong>${user.dept}</strong> department.`;
  }

  if (q === 'what are my contact details') {
    return `<strong>${user.name}</strong><br>Email: <strong>${user.email}</strong><br>Phone: <strong>${user.phone}</strong><br>Address: <strong>${user.address}</strong>`;
  }

  return 'Please select one of the 10 questions shown above.';
}
