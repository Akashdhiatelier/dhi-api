const nodemailer = require("nodemailer");
const config = require("../config/config");

const sendEmail = async ({ to, subject, html, from = config.email.from }) => {
  let testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport(config.email.smtp);
  await transporter.sendMail({ from, to, subject, html });
};

module.exports = sendEmail;
