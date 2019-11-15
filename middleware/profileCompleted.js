var user = require('../models/User');

module.exports = async(req, res, next) => {
    const fuser = (await user.findUserId(req.session.userId))[0][0];
    var userImg = (await user.getProfileImgWithId(req.session.userId))[0];
    // age gender sexPref bio userName
    if(!fuser.age || !fuser.gender || !fuser.sexPref || !fuser.bio || !fuser.userName || userImg.length != 1)
        return res.render('user/profile', {errors: [{msg : 'please complete your profile and add least your profile picture'}]});
    next();
  }