/**
 * nodemailer.js
 * Nodemailer transporter configuration using Gmail SMTP.
 *
 * Reads credentials from environment variables:
 *   SMTP_USER — the Gmail address used to send emails
 *   SMTP_PASS — the Gmail App Password (16-character, NOT account password)
 *
 * The transporter is created once and exported as a singleton — all calls
 * to emailService.js reuse this same connection pool.
 *
 * transporter.verify() is called on startup to confirm SMTP connectivity.
 * A warning is logged if verification fails (e.g. wrong credentials, no
 * network) but the server still starts — email is non-critical.
 *
 * Used by: backend/src/services/emailService.js
 */

'use strict';

const nodemailer = require('nodemailer');

// ── Transporter ───────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Startup Verification ──────────────────────────────────────────────────────
// Verify SMTP connection when the module is first loaded (server startup).
// This is fire-and-forget — a failure here logs a warning but does not crash
// the server. Production deployments should monitor this log line.
transporter.verify((error) => {
  if (error) {
    console.warn(
      '[Email] ⚠  SMTP connection failed — emails will not be sent.',
      '\n        Check SMTP_USER and SMTP_PASS in your .env file.',
      '\n        Error:', error.message
    );
  } else {
    console.log(`[Email] ✓  SMTP connected. Sending as: ${process.env.SMTP_USER}`);
  }
});

module.exports = transporter;