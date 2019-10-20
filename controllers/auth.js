const User = require('../models/User');
const form = require('../models/Form');
const bcrypt = require('bcryptjs');



// render signup page
exports.getSignup = (req,res) => {
    res.render('auth/signup');
}

// render login page
exports.getLogin = (req,res) => {
	let message = req.flash('successMsg');
	if(message.length > 0)
		message = message[0];
	else
		message = null;
    res.render('auth/login',{
    	successMsg: message
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
	User.findUser(username).
	then(([response]) => {
		if(response.length > 0)
			errors.push({msg : "this userName already exists ."});
		if(!username || !firstName || !lastName || !email || !password)
				errors.push({msg: 'please fill in all fields'});
		else
		{	
			// Check username
			if(!form.valideName(username))
				errors.push({msg: "username not valid"});
			// Check firstName
			if(!form.valideName(firstName))
				errors.push({msg: "firstName not valid"});
			//Check lastName
			if(!form.valideName(lastName))
				errors.push({msg: "lastName not valid"});
			//Check email
			if(!form.valideEmail(email))
				errors.push({msg: "email not valid"});
			//Check password
			if(!form.validePassword(password))
				errors.push({msg: "passoword not valid"});
		}
		// Check required fields
		
		if(errors.length > 0)
		{
			res.render('auth/signup',{
				errors:errors,
				username : username,
				firstName: firstName,
				lastName:lastName,
				email:email
			})
		}
		else
		{
			bcrypt.hash(password,12,(err,hash) => {
				const newUser = new User(username,firstName,lastName,email,hash);
				newUser.add().then(() => {
					form.sendEmail(email,'Matcha Account',"Your Account Created successfuly")
					.then(() =>{
						req.flash('successMsg','You can Login now !');
						return res.redirect('/auth/login');
					})
					.catch((err)=> console.log(err));
					
				}).catch(err => console.log(err));
			});
		}
	});



}

// validate login form and give access to user
exports.postLogin = (req,res) => {
	const userName = req.body.username;
	const password = req.body.password;
	let errors = [];
	if(!userName || !password)
		errors.push({msg:"please fill in all fields!"});
	else if(!form.valideName(userName) || !form.validePassword(password))
		errors.push({msg:"Not valid input"});
	
	if(errors.length > 0)
	{
		res.render('auth/login',{
			errors:errors,
			username : userName,
			successMsg:null
		});
	}
	else
	{
		User.findUser(userName)
		.then(([user]) => {
			if(!user)
			{
				errors.push({msg:"No user found please try again!"});
				return res.render('auth/login',{errors:errors,successMsg:null});
			}
			else
			{
				bcrypt.compare(password,user[0].password)
				.then(doMatch => {
					if(doMatch)
					{
						req.session.isLoggedIn = true; 
						req.session.userName = user[0].userName;
						return req.session.save(err => {
							return res.redirect('/user/profile');
						});
					}
					else
					{
						errors.push({msg:"No account Found!"});
						return res.render('auth/login',{errors:errors,successMsg:null});
					}
				})
				.catch(err => console.log(err));
			}
		})
		.catch(err => console.log(err));
	}
}
exports.postLogout = (req,res) => {
	req.session.destroy((err) => {
		if(err)
			console.log(err);
		res.redirect('/');
	});
}