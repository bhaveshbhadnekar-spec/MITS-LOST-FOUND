const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

async function sendPasswordResetEmail(toEmail, resetUrl) {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: process.env.EMAIL_FROM || "MITS Lost & Found <noreply@mitsgwalior.ac.in>",
    to: toEmail,
    subject: "Reset your MITS Lost & Found password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Password reset requested</h2>
        <p>We received a request to reset your MITS Lost &amp; Found account password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}" style="display:inline-block;background:#4338ca;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Reset Password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p style="color:#888;font-size:12px;">Link not working? Copy this into your browser:<br>${resetUrl}</p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail };