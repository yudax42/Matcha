const User = require("../models/User");
const form = require("../models/Form");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const publicIp = require("public-ip");
const iplocation = require("iplocation").default;

// render signup page
exports.getSignup = (req, res) => {
  res.render("auth/signup");
};

// render login page
exports.getLogin = (req, res) => {
  let message = req.flash("successMsg");
  if (message.length > 0) message = message[0];
  else message = null;
  res.render("auth/login", {
    successMsg: message
  });
};

// validate signup form and add the user
exports.postSignup = async (req, res) => {
  if(typeof req.body.username === 'undefined' || typeof req.body.firstName === 'undefined' || typeof req.body.lastName === 'undefined' || typeof req.body.email === 'undefined')
    return res.json({msg:"Please send the neccesary infos"});
  const username = (req.body.username).trim();
  const firstName = (req.body.firstName).trim();
  const lastName = (req.body.lastName).trim();
  const email = (req.body.email).trim();
  const password = req.body.password;
  let errors = [];

  var user = await User.findUser(username);
  if (user[0].length > 0)
    errors.push({msg: "Username already taken."});
  if (!username || !firstName || !lastName || !email || !password)
    errors.push({msg: "Please fill in all required fields."});
  else {
    if (!form.valideUserName(username))
      errors.push({msg: "Username not valid"});
    if (!form.valideName(firstName))
      errors.push({msg: "FirstName not valid"});
    if (!form.valideName(lastName))
      errors.push({msg: "LastName not valid"});
    if (!form.valideEmail(email))
      errors.push({msg: "Email not valid"});
    if (!form.validePassword(password))
      errors.push({msg: "Password not valid"});
  }
  // Check required fields
  if (errors.length > 0) {
    res.render("auth/signup", {
      errors: errors,
      username: username,
      firstName: firstName,
      lastName: lastName,
      email: email
    });
  } else {
    // Create hashed Password
    var hash = bcrypt.hashSync(password, 12);
    // Create Token
    var token = crypto.randomBytes(32).toString("hex");
    // Add new User
    const newUser = new User(username, firstName, lastName, email, hash, token);
    await newUser.add();
    // Save User ip Address
    const ip = await publicIp.v4();
    const ipLocation = await iplocation(ip);
    await User.firstTimeSaveIpLocation(username,ipLocation.longitude,ipLocation.latitude);
    // send email
    await form.sendEmail(email,"Matcha Account",username,"Please Click this link to activate your account","http://localhost:3000/auth/validate/" + token);
    // Create Flash Image
    req.flash("successMsg","you account is created, You need to check your email to activate!");
    // Redirect to Login
    return res.redirect("/auth/login");
  }
};

// activate Account
exports.activateAccount = async (req, res) => {
  const token = req.params.token;
  // Check if token exists
  var tokenCheck = await User.checkTokenEmail(token);
  var data = tokenCheck[0];
  if (data.length > 0) {
    if (data[0].emailToken == token && data[0].accStat == "not active") {
      // activate account
      await User.activateAccount(token);
      req.flash("successMsg", "your account is activated You can login now!");
      return res.redirect("/auth/login");
    } // redirect if account is already verified
    else if (data[0].accStat == "active") {
      req.flash("successMsg", "your account is already verified");
      return res.redirect("/auth/login");
    } else
      return res.redirect("/auth/login");
  } else {
    // redirect because it's not found
    return res.render("auth/login", {
      errors: [{msg: "invalid Token"}],
      successMsg: null
    });
  }
};

// validate login form and give access to user
exports.postLogin = async(req, res) => {
  if(typeof req.body.username == 'undefined' || typeof req.body.password == 'undefined')
    return res.json({msg:"Please send the neccesary infos"});
  const userName = (req.body.username).trim();
  const password = req.body.password;
  let errors = [];
  if (!userName || !password)
    errors.push({msg: "please fill in all fields!"});
  else if (!form.valideUserName(userName) || !form.validePassword(password))
    errors.push({ msg: "Not valid input" });
  if (errors.length > 0) 
    res.render("auth/login", {errors: errors,username: userName,successMsg: null});
  else {
    const user = (await User.findUser(userName))[0];
    if (user.length == 0) {
      errors.push({msg: "No user found please try again!"});
      return res.render("auth/login", {errors: errors,successMsg: null});
    } else if (user[0].accStat == "not active") {
      errors.push({msg: "Your account is not active please check your email"});
      return res.render("auth/login", {errors: errors,successMsg: null});
    }else if (user[0].is_blocked == 1)
    {
      errors.push({msg: "We are sorry, you're account is blocked for now"});
      return res.render("auth/login", {errors: errors,successMsg: null});
    } 
    else {
      var doMatch = await bcrypt.compare(password, user[0].password);
      if (doMatch) {
        const ip = await publicIp.v4();
        var response = await iplocation(ip);
        await User.saveIpLocation(user[0].userName, response.longitude, response.latitude);
        req.session.isLoggedIn = true;
        req.session.userName = user[0].userName;
        req.session.userId = user[0].id;
        req.session.age = user[0].age;
        req.session.longitude = response.longitude;
        req.session.latitude = response.latitude;
        req.session.sexPref = user[0].sexPref;
        req.session.gender = user[0].gender;
        req.session.fameRating = user[0].fameRating;
        return req.session.save(err => {
          return res.redirect("/user/profile");
        });
      } else {
        errors.push({ msg: "No account Found!" });
        return res.render("auth/login", { errors: errors, successMsg: null });
      }
    }
  }
};
// verifie user email and check if found send token
exports.resetPass = async (req, res) => {
  const userName = (req.body.username).trim();
  const email = req.body.email;
  var errors = [];
  if (!email)
    errors.push({msg: "please insert email to send you reset information"});
  else if (!form.valideEmail(email)) {
    errors.push({msg: "Please insert correct email address"});
  } else if (!form.valideUserName(userName)) {
    errors.push({msg: "Please insert correct Username"});
  }
  if (errors.length == 0) {
    // Check email in DATABASE
    var data = (await User.findAccountWithEmail(userName, email))[0];
    if (data.length == 1) {
      // generate token
      crypto.randomBytes(32, async(err, buffer) => {
        var token = buffer.toString("hex");
        // insert to DATABASE
        await User.addPassToken(userName, token);
        // send email
        await form.sendEmail(email, "Matcha Account",userName, "Please click the link below to reset your password ", "http://localhost:3000/auth/reset/" + token);
        // add flash msg
        req.flash("successMsg", "Please check your email to reset Password");
        // Redirect to login
        return res.redirect("/auth/login");
      });
    } else {
      errors.push({msg: "no account found with that email"});
      return res.render("auth/login", {errors: errors,successMsg: null});
    }
  } else 
    return res.render("auth/login", {errors: errors,successMsg: null});
};

// get reset page with token
exports.getResetPass = (req, res) => {
  var token = req.params.token;
  res.render("auth/resetPass", {successMsg: null,token: token});
};

// post token userName newPass to verifie and add images
exports.postResetPass = async(req, res) => {
  var userName = (req.body.username).trim();
  var newPass = req.body.newPassword;
  var token = req.body.token;
  var errors = [];
  if (!form.validePassword(newPass))
    errors.push({msg: "passoword not valid"});
  if (errors.length == 0) {
    var data = (await User.checkToken(userName, token))[0];
    if (data.length == 1) {
      //add new password
      bcrypt.hash(newPass, 12, async(err, hash) => {
        await User.addnewPass(hash, token, userName)
        req.flash("successMsg", "Your Password have been updated!");
        return res.redirect("/auth/login");
      });
    }
    else {
      errors.push({msg: "invalid details"});
      return res.render("auth/login", {errors: errors,successMsg: null});
    }
  }
  else 
    return res.render("auth/login", {errors: errors,successMsg: null});

};

exports.postLogout = (req, res) => {
  req.session.destroy(err => {
    res.redirect("/");
  });
};
