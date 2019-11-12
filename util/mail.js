var nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();

let transporter = nodemailer.createTransport({
  service: "gmail",
  secure: false,
  auth: {
    user: "matcha469@gmail.com",
    pass: "Youssef123#"
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = transporter;
