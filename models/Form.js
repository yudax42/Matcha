const trans = require('../util/mail');

exports.valideEmail = (email) => {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
    return (1);
}
exports.valideName = (name) => {
  if (name.length > 4 && name.length <= 15 && /^\w+$/.test(name))
    return (1);
}
exports.validePassword = (password) => {
  if (password.match(/[a-z]/g) && password.match(/[A-Z]/g) && password.match(/[0-9]/g) && password.match(/[^a-zA-Z\d]/g) && password.length >= 8)
    return (1);
}

exports.sendEmail = (to, subject, text) => {
  var HelperOptions = {
    from: '"youssef" <matcha469@gmail.com',
    to: to,
    subject: subject,
    text: text
  };
  return new Promise((resolve, reject) => {
    if (trans.sendMail(HelperOptions)) {
      resolve("Mail Sent !");
    } else {
      reject(Error("It broke"));
    }
  });
}
