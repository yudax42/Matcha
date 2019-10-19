const user = require('../models/User');

exports.getProfile = (req,res) => {
    res.render('user/profile',{
    	errorMsg: req.flash('error')
    });
};
exports.getMatch = (req,res) => {
    res.render('user/home',{
    	errorMsg: req.flash('error')
    });
};

exports.getProfileData = (req,res) => {
	const userName = req.session.userName;
	user.fetchUserData(userName)
	.then(([data]) => {
		res.json(data[0])
	}) 
	.catch(err => console.log(err));
}

exports.postProfileData = (req,res) => {
	
	
}