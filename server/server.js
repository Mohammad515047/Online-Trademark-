const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.log('MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/certificate', require('./routes/certificate.routes'));
app.use('/api/verify', require('./routes/verify.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'DPDT Trademark Server Running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
