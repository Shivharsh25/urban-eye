/**
 * Dispatch & Email Notification Service
 * - Uses Nodemailer with Ethereal test accounts for local zero-config verifiable delivery.
 * - Supports swappable SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).
 * - Dispatches initial reports to municipal departments.
 * - Sends escalation alerts when report counts surge.
 * - Sends automated resolution notifications to all citizen reporters in reporterIds.
 */

const nodemailer = require('nodemailer');
const User = require('../models/User');

let transporter = null;
let etherealAccount = null;

/**
 * Initializes or returns the cached Nodemailer transporter
 */
async function getTransporter() {
  if (transporter) return transporter;

  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasSmtpConfig) {
    console.log('[DispatchService] Using custom SMTP configuration:', process.env.SMTP_HOST);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    try {
      console.log('[DispatchService] Creating Nodemailer Ethereal test account for verifiable local delivery...');
      // Use Promise.race to timeout after 5 seconds in case Ethereal hangs
      etherealAccount = await Promise.race([
        nodemailer.createTestAccount(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Ethereal account creation timed out')), 5000))
      ]);
      console.log(`[DispatchService] Ethereal account ready: ${etherealAccount.user}`);

      transporter = nodemailer.createTransport({
        host: etherealAccount.smtp.host,
        port: etherealAccount.smtp.port,
        secure: etherealAccount.smtp.secure,
        auth: {
          user: etherealAccount.user,
          pass: etherealAccount.pass
        },
        connectionTimeout: 5000,
        socketTimeout: 5000
      });
    } catch (err) {
      console.warn('[DispatchService WARNING] Failed to create Ethereal account, falling back to mock transporter:', err.message);
      // Fallback in-memory transport if network is offline
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    }
  }

  return transporter;
}

/**
 * Dispatches an automated incident report to the assigned department
 * @returns {Promise<{ messageId: string, previewUrl: string | null }>}
 */
async function dispatchIncidentReport({ detection, departmentEmail, departmentName, reportText }) {
  const mailer = await getTransporter();

  const mailOptions = {
    from: '"Urban EYE Dispatcher" <dispatch@urbaneye.city.local>',
    to: departmentEmail,
    subject: `[URGENT ${detection.severity.toUpperCase()}] New Incident #${detection.id || detection._id} Dispatched to ${departmentName}`,
    text: reportText,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="background: #0f172a; color: #ffffff; padding: 15px; border-radius: 6px; text-align: center;">
          <h2 style="margin: 0; color: #38bdf8;">Urban EYE Dispatch Notification</h2>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #94a3b8;">Automated Municipal Work Order</p>
        </div>
        <div style="padding: 20px 0;">
          <p><strong>Incident Ref:</strong> #${detection.id || detection._id}</p>
          <p><strong>Department:</strong> ${departmentName}</p>
          <p><strong>Issue Type:</strong> <span style="text-transform: capitalize;">${detection.type}</span></p>
          <p><strong>Urgency:</strong> <span style="color: ${detection.severity === 'high' ? '#ef4444' : detection.severity === 'medium' ? '#f59e0b' : '#10b981'}; font-weight: bold; text-transform: uppercase;">${detection.severity}</span></p>
          <p><strong>Location:</strong> ${detection.address || `${detection.lat}, ${detection.lng}`}</p>
          <div style="background: #f8fafc; padding: 12px; border-left: 4px solid #38bdf8; margin: 15px 0; font-family: monospace; white-space: pre-wrap; font-size: 12px;">${reportText}</div>
          ${detection.imageUrl ? `<p><strong>Attached Evidence:</strong><br><img src="${detection.imageUrl}" alt="Evidence" style="max-width: 100%; border-radius: 6px; margin-top: 8px;" /></p>` : ''}
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 11px; color: #64748b; text-align: center;">
          Sent automatically via Urban EYE Intelligent Smart-City Surveillance.
        </div>
      </div>
    `
  };

  let info;
  try {
    info = await Promise.race([
      mailer.sendMail(mailOptions),
      new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP sendMail timed out')), 5000))
    ]);
  } catch (err) {
    console.error('[DispatchService WARNING] Failed to send email (timeout or network error):', err.message);
    info = { messageId: 'mock-id-timeout' };
  }
  const previewUrl = nodemailer.getTestMessageUrl(info) || null;

  if (previewUrl) {
    console.log(`[DispatchService] Municipal dispatch email sent! Verifiable Ethereal preview: ${previewUrl}`);
  }

  return {
    messageId: info.messageId,
    previewUrl
  };
}

/**
 * Dispatches an escalation notice to the assigned department
 */
async function dispatchEscalationAlert({ detection, departmentEmail, departmentName, escalationText }) {
  const mailer = await getTransporter();

  const mailOptions = {
    from: '"Urban EYE Dispatcher" <dispatch@urbaneye.city.local>',
    to: departmentEmail,
    subject: `[ESCALATED - ${detection.severity.toUpperCase()}] Incident #${detection.id || detection._id} Surge (${detection.reportCount} Citizen Reports)`,
    text: escalationText,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h3 style="color: #dc2626;">Urban EYE Escalation Notice</h3>
        <p>Incident <strong>#${detection.id || detection._id}</strong> (${detection.type}) has been escalated to <strong>${detection.severity.toUpperCase()}</strong> due to multiple citizens reporting this issue.</p>
        <pre style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 10px;">${escalationText}</pre>
      </div>
    `
  };

  let info;
  try {
    info = await Promise.race([
      mailer.sendMail(mailOptions),
      new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP sendMail timed out')), 5000))
    ]);
  } catch (err) {
    console.error('[DispatchService WARNING] Failed to send escalation alert:', err.message);
    info = { messageId: 'mock-id-timeout' };
  }
  const previewUrl = nodemailer.getTestMessageUrl(info) || null;
  return { messageId: info.messageId, previewUrl };
}

/**
 * Sends resolution emails to ALL citizen reporters who submitted this issue
 */
async function sendResolutionNotifications({ detection }) {
  const mailer = await getTransporter();
  const reporterIds = detection.reporterIds || (detection.submittedBy ? [detection.submittedBy] : []);
  
  if (reporterIds.length === 0) return [];

  const results = [];

  for (const userId of reporterIds) {
    const user = await User.findById(userId);
    if (!user || !user.email) continue;

    const mailOptions = {
      from: '"Urban EYE City Helpdesk" <notifications@urbaneye.city.local>',
      to: user.email,
      subject: `[Issue Resolved] Your report #${detection.id || detection._id} (${detection.type}) has been fixed!`,
      text: `Hello ${user.name || 'Citizen'},\n\nGreat news! The municipal infrastructure issue you reported (#${detection.id || detection._id} - ${detection.type} at ${detection.address || 'your reported location'}) has been resolved by our field crews.\n\nThank you for helping keep our city clean, safe, and efficient!\n\nBest regards,\nUrban EYE City Operations`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #10b981; border-radius: 8px;">
          <div style="background: #10b981; color: white; padding: 12px; border-radius: 6px; text-align: center;">
            <h3 style="margin: 0;">Issue Successfully Resolved!</h3>
          </div>
          <div style="padding: 15px 0;">
            <p>Hello <strong>${user.name || 'Citizen'}</strong>,</p>
            <p>The municipal team has inspected and resolved the <strong>${detection.type}</strong> issue you reported at <em>${detection.address || `${detection.lat}, ${detection.lng}`}</em>.</p>
            <p style="background: #ecfdf5; padding: 10px; border-left: 4px solid #10b981; font-size: 13px;">
              <strong>Incident Ref:</strong> #${detection.id || detection._id}<br>
              <strong>Status:</strong> RESOLVED<br>
              <strong>Department:</strong> ${detection.assignedDepartment || 'Municipal Works'}<br>
              <strong>Total Citizen Reports:</strong> ${detection.reportCount || 1}
            </p>
            <p>Thank you for your active civic participation!</p>
          </div>
        </div>
      `
    };

    try {
      const info = await Promise.race([
        mailer.sendMail(mailOptions),
        new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP sendMail timed out')), 5000))
      ]);
      const previewUrl = nodemailer.getTestMessageUrl(info) || null;
      if (previewUrl) {
        console.log(`[DispatchService] Resolution email sent to citizen (${user.email})! Preview: ${previewUrl}`);
      }
      results.push({ userId, email: user.email, messageId: info.messageId, previewUrl });
    } catch (err) {
      console.error(`[DispatchService] Failed to send resolution email to ${user.email}:`, err.message);
    }
  }

  return results;
}

module.exports = {
  dispatchIncidentReport,
  dispatchEscalationAlert,
  sendResolutionNotifications,
  getTransporter
};
