const trans = require('../util/mail');
var ejs = require("ejs");
var path = require('../util/path');

exports.valideEmail = (email) => {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
    return (1);
}
exports.valideUserName = (userName) => {
  if (userName.length > 4 && userName.length <= 15 && /^\w+$/.test(userName))
    return (1);
}
exports.valideName = (name) => {
  if (name.length > 4 && name.length <= 15 && name.match(/^[A-Za-z]+$/))
    return (1);
}
exports.validePassword = (password) => {
  if (password.match(/[a-z]/g) && password.match(/[A-Z]/g) && password.match(/[0-9]/g) && password.match(/[^a-zA-Z\d]/g) && password.length >= 8)
    return (1);
}

exports.sendEmail = async (to, subject, userName , msg, link) => {
  var data = await ejs.renderFile(path+"/views/email/email.ejs", { userName: userName,text: msg,link:link });
  var HelperOptions = {
    from: '"youssef" <matcha469@gmail.com',
    to: to,
    subject: subject,
    html: data
  };
  return new Promise((resolve, reject) => {
    if (trans.sendMail(HelperOptions)) {
      resolve("Mail Sent !");
    } else {
      reject(Error("It broke"));
    }
  });
}
