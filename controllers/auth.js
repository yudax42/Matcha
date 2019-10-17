const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getSignup = (req,res) => {
    res.render('auth/signup');
}
exports.getLogin = (req,res) => {
    res.render('auth/login');
}
exports.postSignup = (req,res) => {
	const userName = req.body.username;
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;
	const email = req.body.email;
	const password = req.body.password;

	bcrypt.hash(password,12,(err,hash) => {
		const newUser = new User(userName,firstName,lastName,email,hash);
		newUser.add().then(() => {res.redirect('auth/login')}).catch(err => console.log(err));
	})

}
exports.postLogin = (req,res) => {
	const userName = req.body.username;
	const password = req.body.password;
	User.findUser(userName)
	.then(([user]) => {
		if(!user)
			return res.redirect('auth/login');
		bcrypt.compare(password,user[0].password)
		.then(doMatch => {
			if(doMatch)
			{
				console.log(user[0].userName);
				req.session.isLoggedIn = true; 
				req.session.userName = user[0].username;
				return req.session.save(err => {
					console.log(err);
					return res.redirect('/user/profile');
				});
			}
			else
				return res.redirect('/auth/login');
		})
		.catch(err => console.log(err));
	})
	.catch(err => console.log(err));
}
exports.postLogout = (req,res) => {
	req.session.destroy((err) => {
		if(err)
			console.log(err);
		res.redirect('/');
	});
}