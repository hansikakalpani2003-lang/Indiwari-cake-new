require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅  Indiwari Cake API running on http://localhost:${PORT}`);
  console.log(`📦  Environment: ${process.env.NODE_ENV}`);
});