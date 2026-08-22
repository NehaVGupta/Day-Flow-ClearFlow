/* ==========================================================================
   DAYFLOW HRMS - FLOWAI HR COPILOT ENGINE
   Smart Natural Language HR Chatbot & Automated Action Helper
   ========================================================================== */

function toggleAIDrawer() {
  const drawer = document.getElementById('ai-drawer');
  if (drawer) drawer.classList.toggle('active');
}

function sendQuickAISuggestion(text) {
  document.getElementById('ai-input').value = text;
  submitAIMessage();
}

function handleAISubmit(e) {
  if (e.key === 'Enter') {
    submitAIMessage();
  }
}

function submitAIMessage() {
  const input = document.getElementById('ai-input');
  const query = input.value.trim();
  if (!query) return;

  appendChatMessage(query, 'user');
  input.value = '';

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
  const q = query.toLowerCase();
  const user = currentAuthUser || appState.users[0];
  const isHr = appState.activeRoleId === 'admin';

  // 1. Leave Queries
  if (q.includes('leave') || q.includes('balance') || q.includes('vacation')) {
    if ((q.includes('apply') || q.includes('request') || q.includes('take')) && !isHr) {
      setTimeout(openApplyLeaveModal, 600);
      return `Sure! I have opened the <strong>Apply Leave Form</strong> for you. You currently have <strong>${user.leaves.paid} Paid Leaves</strong> and <strong>${user.leaves.sick} Sick Leaves</strong> remaining.`;
    }
    return `📊 <strong>Your Current Leave Balances (${user.name}):</strong><br>
    • Paid Annual Leave: <strong>${user.leaves.paid} Days</strong><br>
    • Sick / Casual Leave: <strong>${user.leaves.sick} Days</strong><br>
    • Unpaid Leave: <strong>${user.leaves.unpaid || 0} Days taken</strong><br><br>
    ${isHr ? '<em>As HR Admin, you review employee leave requests in the HR Leave Center.</em>' : '<em>Would you like me to open the leave application window?</em>'}`;
  }

  // 2. Salary & Payroll Queries
  if (q.includes('salary') || q.includes('pay') || q.includes('ctc') || q.includes('payslip') || q.includes('money')) {
    const gross = user.salary.base + user.salary.hra + user.salary.allowance;
    const net = gross - user.salary.deductions;
    return `💵 <strong>Salary Summary (${user.name}):</strong><br>
    • Base Salary: $${user.salary.base.toLocaleString()}<br>
    • Allowances (HRA + Special): $${(user.salary.hra + user.salary.allowance).toLocaleString()}<br>
    • Deductions (PF/Tax): -$${user.salary.deductions.toLocaleString()}<br>
    💰 <strong>Net Payout: $${net.toLocaleString()}.00</strong><br><br>
    <button class="btn btn-primary btn-sm" style="margin-top:0.4rem;" onclick="openPaySlipModal()"><i class="fa-solid fa-file-pdf"></i> View Payslip PDF</button>`;
  }

  // 3. Attendance Queries
  if (q.includes('attendance') || q.includes('check in') || q.includes('clock') || q.includes('hours')) {
    return `⏱️ <strong>Attendance Status:</strong><br>
    Logged in as <strong>${user.name}</strong>. Your shift timer is active in the top bar!`;
  }

  // 4. Default General Response
  return `🤖 I'm <strong>FlowAI HR Assistant</strong>! I can help you with:<br>
  1. Checking leave balances & applying for time-off<br>
  2. Generating official salary pay slips<br>
  3. Shift & attendance log tracking<br>
  4. Answering HR policy questions`;
}
