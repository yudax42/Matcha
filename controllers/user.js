const user = require('../models/User');
const form = require('../models/Form');
const moment = require('moment');
const bcrypt = require('bcryptjs');

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
	// session variable
	const sessionUser = req.session.userName;
	const {userName,firstName,lastName,email,password,gender,secPredTotal,dateOfBirth,bio} = req.query;
	const errors = [];
	// Check username , firstname , lastname
	if(!form.valideName(userName) || !form.valideName(firstName) || !form.valideName(lastName))
		errors.push({msg : "Not valid input"});
	//Check Email
	if(!form.valideEmail(email))
		errors.push({msg : "email Not Valid"});
	//Check Password
	if(!form.validePassword(password))
		errors.push({msg : "Password not valide"});
	// Check Gender
	if(!(gender == "male" || gender=="female"))
		errors.push({msg : "Please enter Valid gender value"});
	// Check Sex Preferences
	if (secPredTotal == undefined) {
		errors.push({msg : "at least one gender must be selected"});
	}
	else if(secPredTotal.length > 0)
	{
		if(!(secPredTotal.length <= 2 && (secPredTotal.includes("male") || secPredTotal.includes("female"))))
			errors.push({msg : "Please enter Valid SexPreferences values"});
	}
	// Check date of birth
	var dateCheck = moment(dateOfBirth, 'MM/DD/YYYY',true).isValid();
	if(dateCheck == true)
	{
		var age = moment().diff(dateOfBirth, 'years');
		// console.log(age);
		if(age < 17 || age > 100)
			errors.push({msg : "Restricted Age!"});
	}
	else
		errors.push({msg : "Date is not Valid"});

	// Check Biography
	if(bio.length > 255)
		errors.push({msg : "Your Bio is too long"});


	if(errors.length > 0)
	{
		res.json(errors);
	}
	else
	{
		// Update
		bcrypt.hash(password,12,(err,hash) => {
			user.updateProfileData(userName,firstName,lastName,email,hash,gender,secPredTotal[0],dateOfBirth,age,bio,sessionUser)
			.then((t) => {
				req.session.userName = userName;
				console.log("it's updated");
				res.json([{msg: "done"}]);
			})
			.catch(err => console.log(err));
		});
	}	
}