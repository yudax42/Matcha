const User = require('../models/User');
const form = require('../models/Form');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');



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
          msg: "passoword not valid"
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
          const newUser = new User(username, firstName, lastName, email, hash,token);
          newUser.add().then(() => {
            // send email
            form.sendEmail(email, 'Matcha Account', "Hello "+username+ "click here to validate your account http://localhost:3000/auth/validate/"+token)
              .then(() => {
                req.flash('successMsg', 'you account is created, You need to check your email to activate!');
                return res.redirect('/auth/login');
              })
              .catch((err) => console.log(err));
          });
        })
      });
    }
  });
}


// validate email
exports.validateEmail = (req, res) => {
  const token = req.param('token');
  // Check if token exists
  User.checkToken(token)
  .then(([data]) => {
    // if the is token in db do update
    if(data.length > 0)
    {
      if(data[0].emailToken == token && data[0].accStat == "not active")
      {
        // activate account
        User.activateAccount(token)
        .then(() => {
          req.flash('successMsg', 'your account is activated You can login now!');
          return res.redirect('/auth/login');
        })
      }// redirect if account is already verified
      else if(data[0].accStat == "active"){
        req.flash('successMsg', 'your account is already verified');
        return res.redirect('/auth/login');
      }
      else {
        return res.redirect('/auth/login');
      }
    }
    else { // redirect because it's not found
      return res.render('auth/login', {
        errors: [{msg:"invalid Token"}],
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
        }
        else if(user[0].accStat == "not active") {
          errors.push({
            msg: "Your account is not active please check your email"
          });
          return res.render('auth/login', {
            errors: errors,
            successMsg: null
          });
        }
        else {
          bcrypt.compare(password, user[0].password)
            .then(doMatch => {
              if (doMatch) {
                req.session.isLoggedIn = true;
                req.session.userName = user[0].userName;
                req.session.userId = user[0].id;
                return req.session.save(err => {
                  return res.redirect('/user/profile');
                });
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
exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err)
      console.log(err);
    res.redirect('/');
  });
}
