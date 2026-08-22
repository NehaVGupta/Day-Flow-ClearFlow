const http = require('http');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3001);
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const otpStore = new Map();

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => { body += chunk; });
    request.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch (error) { reject(error); }
    });
    request.on('error', reject);
  });
}

async function sendOtpEmail(email, otp) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [email],
      subject: 'Dayflow password change verification code',
      html: `<p>Your Dayflow verification code is <strong>${otp}</strong>.</p><p>This code expires in 10 minutes.</p>`
    })
  });

  if (!response.ok) throw new Error('Email provider rejected the request');
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (request.method !== 'POST') {
    sendJson(response, 404, { error: 'Not found' });
    return;
  }

  try {
    const body = await readBody(request);
    const email = String(body.email || '').trim().toLowerCase();

    if (!email || !email.includes('@')) {
      sendJson(response, 400, { error: 'A valid email is required' });
      return;
    }

    if (request.url === '/api/password/send-otp') {
      if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
        sendJson(response, 503, { error: 'Email service is not configured' });
        return;
      }

      const otp = crypto.randomInt(100000, 1000000).toString();
      await sendOtpEmail(email, otp);
      otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
      sendJson(response, 200, { sent: true });
      return;
    }

    if (request.url === '/api/password/verify-otp') {
      const savedOtp = otpStore.get(email);
      const valid = savedOtp && savedOtp.expiresAt > Date.now() && savedOtp.otp === String(body.otp || '').trim();
      if (!valid) {
        sendJson(response, 400, { error: 'Invalid or expired OTP' });
        return;
      }

      otpStore.delete(email);
      sendJson(response, 200, { verified: true });
      return;
    }

    sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    sendJson(response, 500, { error: 'Unable to process OTP request' });
  }
});

server.listen(PORT, () => {
  console.log(`Dayflow OTP API listening on http://localhost:${PORT}`);
});
