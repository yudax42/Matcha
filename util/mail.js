var nodemailer = require('nodemailer');
const dotenv      = require('dotenv').config();

let transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: false,
  auth: {
    user: 'matcha469@gmail.com',
    pass: process.env.MAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = transporter;
