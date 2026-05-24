require('dotenv').config();
const app = require('./app');
const pool = require('./src/config/db'); // ඩේටාබේස් එක සර්වර් එකට සම්බන්ධ කරන පේළිය

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅  Indiwari Cake API running on http://localhost:${PORT}`);
  console.log(`📦  Environment: ${process.env.NODE_ENV}`);
});