const user = require('../models/User');
const form = require('../models/Form');
const moment = require('moment');
const bcrypt = require('bcryptjs');
var _ = require('lodash');

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
	const userId = req.session.userId;
	const {userName,firstName,lastName,email,password,gender,secPredTotal,dateOfBirth,bio,interest} = req.query;
	const errors = [];
	const interests = ["science","tech","food","swimming","football","anime","e-games","makeUp","series","movies","cinema","art","music","self improvement","reading"];
	// Check if the userName is already in database
	user.findUser(userName).
	then(([response]) => {
		if(response.length > 0 && response[0].userName != sessionUser)
			errors.push({msg : "this userName already exists ."});
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

		// Check interest 
		if(!interest)
			errors.push({msg: "Please choose at least one interest"})
		else if(interest.length < 6)
		{
			var i = 0;
			while(i < interest.length)
			{
				if(interests.includes(interest[i].toLowerCase()))
					i++;
				else
				{
					errors.push({msg : "Please select interset from the list above"});
					break;
				}
			}
			pushDbArray = _.uniq(interest);
		}
		else
			errors.push({msg : "You have 6 interest choices"});

		if(errors.length > 0)
		{
			res.json(errors);
		}
		else
		{
			if(secPredTotal.length == 2)
				secPredTotal[0] = "both";
			// Update
			var i = 0;
			user.deleteAllInterest(userId)
			.then(() => {
				bcrypt.hash(password,12,(err,hash) => {
					user.updateProfileData(userName,firstName,lastName,email,hash,gender,secPredTotal[0],dateOfBirth,age,bio,sessionUser)
					.then(() => {
						req.session.userName = userName;
						while(i < pushDbArray.length)
						{
							user.addInterest(userId,pushDbArray[i])
							.then(()=> {
								console.log("done");
							})
							.catch((err) => console.log(err));
							i++;
						}
						res.json([{msg: "done"}]);
					})
					.catch(err => console.log(err));
				});
			});
			
		}	
	})
	.catch((err) => console.log(err));
	
}