exports.userSignup = (req,res) => {
    res.render('auth/signup');
}
exports.userLogin = (req,res) => {
	req.session.isLoggedIn = true;
    res.render('auth/login');
}

exports.userLogout = (req,res) => {
	req.session.destroy((err) => {
		if(err)
			console.log(err);
		res.redirect('/');
	});
}