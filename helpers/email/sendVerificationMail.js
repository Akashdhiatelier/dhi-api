const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const sendEmail = require("../../utils/sendEmail");
const config = require("../../config/config");

const sendVerificationEmail = async (account, origin, tokenData) => {
  let url;
  if (origin) {
    url = `${config.defaultRoute.apiDomain.replace("dhiatelierapi", "dhiatelier")}/reset-password/${tokenData.token}`;
  } else {
    url = `${config.defaultRoute.apiDomain}/reset-password/${tokenData.token}`;
  }

  const filePath = path.join(__dirname, "./signUpVerification.html");
  const source = fs.readFileSync(filePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    username: `${account.first_name} ${account.last_name}`,
    url,
  };
  const htmlToSend = template(replacements);

  await sendEmail({
    to: account.email,
    subject: "[DHI Atelier] Sign-up Verification - Verify Email",
    html: htmlToSend,
  });
};
const sendForgotPasswordEmail = async (account, origin, tokenData) => {
  let url;
  if (origin) {
    url = `${config.defaultRoute.apiDomain.replace("dhiatelierapi", "dhiatelier")}/reset-password/${tokenData.token}`;
  } else {
    url = `${config.defaultRoute.apiDomain}/reset-password/${tokenData.token}`;
  }

  const filePath = path.join(__dirname, "./resetPassword.html");
  const source = fs.readFileSync(filePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    username: `${account.first_name} ${account.last_name}`,
    url,
  };
  const htmlToSend = template(replacements);

  await sendEmail({
    to: account.email,
    subject: "[DHI Atelier] Forgot password",
    html: htmlToSend,
  });
};

module.exports = { sendVerificationEmail, sendForgotPasswordEmail };
