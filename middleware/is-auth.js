const User = require('../models/User');


module.exports = async(req, res, next) => {
  let user = null;
  if (req.session.isLoggedIn)
    user = (await User.findUserId(req.session.userId))[0];
  if (!req.session.isLoggedIn || user.length != 1 || user[0].is_blocked == 1) {
    if (req.session.isLoggedIn){
      return req.session.destroy(err => {
        return res.redirect('/auth/login');
      });
    }
    return res.redirect('/auth/login');
  }
  next()
}
