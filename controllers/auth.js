const User = require('../models/User');
const form = require('../models/Form');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const publicIp = require('public-ip');
const iplocation = require("iplocation").default;


// render signup page
exports.getSignup = (req, res) => {
  res.render('auth/signup');
}

// render login page
exports.getLogin = (req, res) => {
  let message = req.flash('successMsg');
  if (message.length > 0)
    message = message[0];
  else
    message = null;
  res.render('auth/login', {
    successMsg: message
  });
}

// validate signup form and add the user
exports.postSignup = (req, res) => {
  const {
    username,
    firstName,
    lastName,
    email,
    password
  } = req.body;
  let errors = [];

  let notValidUserName = (name) => {
    if (name.length < 4 || name.length > 15 || /^\w+$/.test(name))
      return (0);
  };

  User.findUser(username).
  then(([response]) => {
    if (response.length > 0)
      errors.push({
        msg: "this userName already exists ."
      });
    if (!username || !firstName || !lastName || !email || !password)
      errors.push({
        msg: 'please fill in all fields'
      });
    else {
      if (!form.valideName(username))
        errors.push({
          msg: "username not valid"
        });
      if (!form.valideName(firstName))
        errors.push({
          msg: "firstName not valid"
        });
      if (!form.valideName(lastName))
        errors.push({
          msg: "lastName not valid"
        });
      if (!form.valideEmail(email))
        errors.push({
          msg: "email not valid"
        });
      if (!form.validePassword(password))
        errors.push({
          msg: "password not valid"
        });
    }
    // Check required fields

    if (errors.length > 0) {
      res.render('auth/signup', {
        errors: errors,
        username: username,
        firstName: firstName,
        lastName: lastName,
        email: email
      })
    } else {
      bcrypt.hash(password, 12, (err, hash) => {
        crypto.randomBytes(32, (err, buffer) => {
          var token = buffer.toString('hex');
          if (err)
            res.redirect('/auth/signup');
          const newUser = new User(username, firstName, lastName, email, hash, token);
          newUser.add().then(() => {
            const ip = (async () => {return await publicIp.v4();})();
            ip.then((ip) => {
              iplocation(ip,[],(err,response)=>{
                console.log(response);
                User.firstTimeSaveIpLocation(username,response.longitude,response.latitude)
                .then(() => {
                  // send email
                  form.sendEmail(email, 'Matcha Account', "Hello " + username + "click here to validate your account http://localhost:3000/auth/validate/" + token)
                    .then(() => {
                      req.flash('successMsg', 'you account is created, You need to check your email to activate!');
                      return res.redirect('/auth/login');
                    })
                    .catch((err) => console.log(err));
                })
              });
            });
          });
        })
      });
    }
  });
}


// validate email
exports.validateEmail = (req, res) => {
  const token = req.params.token;
  // Check if token exists
  User.checkTokenEmail(token)
    .then(([data]) => {
      // if the is token in db do update
      console.log(data);
      if (data.length > 0) {
        if (data[0].emailToken == token && data[0].accStat == "not active") {
          // activate account
          User.activateAccount(token)
            .then(() => {
              req.flash('successMsg', 'your account is activated You can login now!');
              return res.redirect('/auth/login');
            })
        } // redirect if account is already verified
        else if (data[0].accStat == "active") {
          req.flash('successMsg', 'your account is already verified');
          return res.redirect('/auth/login');
        } else {
          return res.redirect('/auth/login');
        }
      } else { // redirect because it's not found
        return res.render('auth/login', {
          errors: [{
            msg: "invalid Token"
          }],
          successMsg: null
        });
      }
    })
    .catch(err => console.log(err));
}

// validate login form and give access to user
exports.postLogin = (req, res) => {
  const userName = req.body.username;
  const password = req.body.password;
  let errors = [];

  if (!userName || !password)
    errors.push({
      msg: "please fill in all fields!"
    });
  else if (!form.valideName(userName) || !form.validePassword(password))
    errors.push({
      msg: "Not valid input"
    });
  if (errors.length > 0) {
    res.render('auth/login', {
      errors: errors,
      username: userName,
      successMsg: null
    });
  } else {
    User.findUser(userName)
      .then(([user]) => {
        if (!user) {
          errors.push({
            msg: "No user found please try again!"
          });
          return res.render('auth/login', {
            errors: errors,
            successMsg: null
          });
        } else if (user[0].accStat == "not active") {
          errors.push({
            msg: "Your account is not active please check your email"
          });
          return res.render('auth/login', {
            errors: errors,
            successMsg: null
          });
        } else {
          bcrypt.compare(password, user[0].password)
            .then(doMatch => {
              if (doMatch) {
                const ip = (async () => {return await publicIp.v4();})();
                ip.then((ip) => {
                  iplocation(ip,[],(err,response)=>{
                    console.log(response);
                    User.saveIpLocation(user[0].userName,response.longitude,response.latitude)
                    .then(() => {
                      req.session.isLoggedIn = true;
                      req.session.userName = user[0].userName;
                      req.session.userId = user[0].id;
                      req.session.age = user[0].age;
                      req.session.longitude = response.longitude;
                      req.session.latitude = response.latitude;
                      req.session.sexPref = user[0].sexPref;
                      req.session.gender = user[0].gender;
                      console.log(req.session.sexPref);
                      return req.session.save(err => {
                        return res.redirect('/user/profile');
                      });
                    });
                  });
                })
              } else {
                errors.push({
                  msg: "No account Found!"
                });
                return res.render('auth/login', {
                  errors: errors,
                  successMsg: null
                });
              }
            })
            .catch(err => console.log(err));
        }
      })
      .catch(err => console.log(err));
  }
}
// verifie user email and check if found send token
exports.resetPass = (req, res) => {
  const userName = req.body.username;
  const email = req.body.email;
  var errors = [];
  if (!email)
    errors.push({
      msg: "please insert email to send you reset information"
    });
  else if (!form.valideEmail(email)) {
    errors.push({
      msg: "Please insert correct email address"
    });
  } else if (!form.valideName(userName)) {
    errors.push({
      msg: "Please insert correct Username"
    });
  }

  if (errors.length == 0) {
    // Check email in DATABASE
    User.findAccountWithEmail(userName, email)
      .then(([data]) => {
        if (data.length == 1) {
          // generate token
          crypto.randomBytes(32, (err, buffer) => {
            var token = buffer.toString('hex');
            // insert to DATABASE
            User.addPassToken(userName, token)
              .then(() => {
                // send email
                form.sendEmail(email, 'Matcha Account', "Hello " + userName + "click here to reset your password http://localhost:3000/auth/reset/" + token)
                  .then(() => {
                    req.flash('successMsg', 'Please check your email to reset Password');
                    return res.redirect('/auth/login');
                  })
                  .catch((err) => console.log(err));
              })
          });
        } else {
          errors.push({
            msg: "no account found with that email"
          })
          return res.render('auth/login', {
            errors: errors,
            successMsg: null
          });
        }


      });
  } else {
    return res.render('auth/login', {
      errors: errors,
      successMsg: null
    });
  }
  // res.render('auth/resetPass',{successMsg: null});
}

// get reset page with token
exports.getResetPass = (req, res) => {
  var token = req.params.token;
  res.render("auth/resetPass", {
    successMsg: null,
    token: token
  });
}
// post token userName newPass to verifie and add images
exports.postResetPass = (req, res) => {
  var userName = req.body.username;
  var newPass = req.body.newPassword;
  var token = req.body.token;
  var errors = [];
  if (!form.validePassword(newPass))
    errors.push({
      msg: "passoword not valid"
    });
  if (errors.length == 0) {
    User.checkToken(userName, token)
      .then(([data]) => {
        if (data.length == 1) {
          //add new password
          bcrypt.hash(newPass, 12, (err, hash) => {
            User.addnewPass(hash, token, userName)
              .then(() => {
                req.flash('successMsg', 'Your Password have been updated!');
                return res.redirect('/auth/login');
              })
              .catch(err => console.log(err));
          });
          //redirect login
        } else {
          errors.push({
            msg: "invalid details"
          });
          return res.render('auth/login', {
            errors: errors,
            successMsg: null
          });
        }
      })
  } else {
    return res.render('auth/login', {
      errors: errors,
      successMsg: null
    });
  }

}

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err)
      console.log(err);
    res.redirect('/');
  });
}
