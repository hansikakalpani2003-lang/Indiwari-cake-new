const qrcode = require('qrcode');
const db     = require('../config/db');

async function generateAndSaveQR(orderId, qrToken) {
  // ✅ Fix: Frontend URL use කරනවා, backend URL නෙවෙයි
  const baseUrl   = process.env.FRONTEND_URL || 'http://localhost:5173';
  const publicUrl = `${baseUrl}/order/${qrToken}`;

  const qrDataUrl = await qrcode.toDataURL(publicUrl, {
    errorCorrectionLevel: 'H',
    type:                 'image/png',
    width:                300,
    margin:               2,
    color: {
      dark:  '#1a1a1a',
      light: '#ffffff',
    },
  });

  await db.query(
    'UPDATE orders SET qr_code_data_url = ? WHERE id = ?',
    [qrDataUrl, orderId]
  );

  return qrDataUrl;
}

module.exports = { generateAndSaveQR };