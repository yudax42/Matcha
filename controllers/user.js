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
	const sessionUser = req.session.userName;
	console.log(req.query);
	const {userName,firstName,lastName,email,password,gender,secPredTotal} = req.query;
	console.log(userName,firstName,lastName,email,password,gender,secPredTotal[0]);
	user.updateProfileData(userName,firstName,lastName,email,password,gender,secPredTotal[0],sessionUser)
	.then((t) => {
		req.session.userName = userName;
		res.send("hell ya");
	});
}