const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({ origin: 'https://erp-iasm.vercel.app', credentials: true }));
app.use(morgan('dev'));
app.use(cookieParser());

app.get('/', (req, res) => res.json({ message: 'ERP API running' }));

app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/employees', require('./routes/employeeRoutes'));
app.use('/api/v1/finance', require('./routes/financeRoutes'));
app.use('/api/v1/attendance', require('./routes/attendanceRoutes'));
app.use('/api/v1/inventory', require('./routes/inventoryRoutes'));
module.exports = app;