const User = require('../models/User');
const bcrypt = require('bcryptjs');


// render signup page
exports.getSignup = (req,res) => {
    res.render('auth/signup');
}

// render login page
exports.getLogin = (req,res) => {
    res.render('auth/login',{
    	errorMsg: req.flash('error')
    });
}

// validate signup form and add the user 
exports.postSignup = (req,res) => {
	const {username,firstName,lastName,email,password} = req.body;
	let errors = [];
	let notValidUserName = (name) => {
		if(name.length < 4 || name.length > 15 || /^\w+$/.test(name))
			return(0);
	};

	// Check required fields
	if(!username || !firstName || !lastName || !email || !password)
		errors.push({msg: 'please fill in all fields'});
	else
	{
		// Check username
		if(notValidUserName(username))
			errors.push({msg: "username not valid"});

		// Check firstName
		if(notValidUserName(firstName))
			errors.push({msg: "firstName not valid"});

		//Check lastName
		if(notValidUserName(firstName))
			errors.push({msg: "lastName not valid"});
		//Check email



		//Check password
	}












	bcrypt.hash(password,12,(err,hash) => {
		const newUser = new User(username,firstName,lastName,email,hash);
		newUser.add().then(() => {res.redirect('auth/login')}).catch(err => console.log(err));
	})

}

// validate login form and give access to user
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
				req.session.isLoggedIn = true; 
				req.session.userName = user[0].username;
				return req.session.save(err => {
					console.log(err);
					return res.redirect('/user/profile');
				});
			}
			else
			{
				req.flash('error','invalid username or password');
				return res.redirect('/auth/login');
			}
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