var nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();

let transporter = nodemailer.createTransport({
  service: "gmail",
  secure: false,
  auth: {
    user: "", // add email here
    pass: "" // add pass here
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = transporter;
