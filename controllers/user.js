var user = require('../models/User');
const form = require('../models/Form');
const moment = require('moment');
const bcrypt = require('bcryptjs');
var _ = require('lodash');
var fs = require('fs');
var Distance = require('geo-distance');

exports.getProfile = (req, res) => {
  res.render('user/profile', {errorMsg: req.flash('error')});
};
exports.getMatch = (req, res) => {
  res.render('user/home', {errorMsg: req.flash('error')});
};


exports.getMatchData = (req, res) => {
  const userName = req.session.userName;
  const userId = req.session.userId;
  const gender = req.session.gender;
  const age = req.session.age;
  var myCor = {lat:req.session.latitude,lon:req.session.longitude}
  
  //search data
  var {fameRating,distance,ageRangeMin,ageRangeMax,genderPref,interest} = req.query;
  var maxFameRating = fameRating || 5;
  var defaultDistance =  8000;
  var max = parseInt(ageRangeMax) || age + 3;
  var min = parseInt(ageRangeMin) || ((age - 18) > 3 ? age-3 : 18);
  var sexPref = [genderPref] || req.session.sexPref;
  
  if(sexPref[0] == "male" || sexPref[0] == "female")
  {
    user.filterUsersGender(sexPref[0],min,max,maxFameRating,userName)
    .then(async ([data]) => {
      // remove users above 80 km
      rightUsers = _.map(data,(user) => {
        var userPoint = {lat:(user.geoLat || user.ipLat),lon:(user.geoLong || user.ipLong)};
        if((Distance.between(myCor, userPoint).radians)*6371 < defaultDistance)
          return user;
      })
      rightUsers = _.without(rightUsers,undefined); // remove undefined elements

      //sort by location
      rightUsers = _.orderBy(rightUsers,(data)=> {
          var userPoint = {lat:(user.geoLat || user.ipLat),lon:(user.geoLong || user.ipLong)};
          return (Distance.between(myCor, userPoint).radians);
          // m radians = distance in km / 6371 
      },['asc']);
      //sort by fame rating
      rightUsers = _.orderBy(rightUsers,['fameRating'],['desc']);
      //sort by tags
      var myInterests = interest || await user.fetchInterest(userId);
      // add common tags count
      var sortByTags = (rightUsers) => {
        return new Promise(async (resolve,reject) => {
          if (!rightUsers)
            reject("No parameter");
          for(const userR of rightUsers)
          {
            var otherInterests = await user.fetchInterestOthers(userR.userName);
            var profileImg = await user.getProfileImg(userR.userName);
            var common = _.intersectionWith(myInterests[0], otherInterests[0], _.isEqual);
            userR.commonTagsCount = common.length;
            userR.profileImg = profileImg[0][0].imgPath;
          }
          resolve(rightUsers)
        })
      }
      rightUsers = await sortByTags(rightUsers);
      rightUsers =  _.orderBy(rightUsers,['commonTagsCount'],['desc']);
      console.log(rightUsers);
      res.json(rightUsers);

    })
    .catch(err => console.log(err))
  }
  else if(sexPref == 'both' || sexPref[0] == 'both')
  {
    console.log("I'm here 2");
    var locArray = [];
    user.filterUsers(min,max,userName)
    .then(async ([data]) => {
      // remove users above 80 km
      rightUsers = _.map(data,(user) => {
        var userPoint = {lat:(user.geoLat || user.ipLat),lon:(user.geoLong || user.ipLong)};
        if((Distance.between(myCor, userPoint).radians)*6371 < defaultDistance)
          return user;
      })
      rightUsers = _.without(rightUsers,undefined); // remove undefined elements

      //sort by location
      rightUsers = _.orderBy(rightUsers,(data)=> {
          var userPoint = {lat:(user.geoLat || user.ipLat),lon:(user.geoLong || user.ipLong)};
          return (Distance.between(myCor, userPoint).radians);
          // m radians = distance in km / 6371
      },['asc']);
      //sort by fame rating
      rightUsers = _.orderBy(rightUsers,['fameRating'],['desc']);
      //sort by tags
      var myInterests = await user.fetchInterest(userId);
      // add common tags count
      // var sortByTags = (rightUsers) => {
      //   return new Promise(async (resolve,reject) => {
      //     if (!rightUsers)
      //       reject("No parameter");
      //     for(const userR of rightUsers)
      //     {
      //       var otherInterests = await user.fetchInterestOthers(userR.userName);
      //       var profileImg = await user.getProfileImg(userR.userName);
      //       var common = _.intersectionWith(myInterests[0], otherInterests[0], _.isEqual);
      //       userR.commonTagsCount = common.length;
      //       userR.profileImg = profileImg[0][0].imgPath;
      //     }
      //     resolve(rightUsers)
      //   })
      // }
      // rightUsers = await sortByTags(rightUsers);
      // rightUsers =  _.orderBy(rightUsers,['commonTagsCount'],['desc']);
      // console.log(rightUsers);
      res.json(rightUsers);
    })
    .catch(err => console.log(err))
  }
};

exports.addProfileImgs = async(req, res) => {
  const image = req.file;
  const userId = req.session.userId;
  const imgIndex = req.query.imgIndex;

  if (!image) 
    res.json({msg: 'image must be JPG, JPEG, PNG'});
  else {
    if (image.size < 50)
      fs.unlink(image.path, (err) => {res.json({msg: "not valide image"});});
    else if (image.size < 4194304) {
      //check if is there an image in imgIndex
      console.log(imgIndex, userId);
      var data = (await user.checkImgIndex(imgIndex,userId))[0];
      console.log(data);
      // if found delete old image path
      if (data.length == 1) {
        // delete file
        fs.unlink(data[0].imgPath, async(err) => {
          if (err) throw err;
          // delete old path in db
          await user.deleteImgIndex(userId, imgIndex);
          await user.addImage(userId, image.path, imgIndex);
          res.send("done");
        });
      } else {
        // add image
        await user.addImage(userId, image.path, imgIndex);
        res.send("done");
      }
    }
    else {
      //delete image uploaded
      fs.unlink(image.path, (err) => {res.json({msg: "image must not be > 4mb"});});
    }
  }
}

exports.getProfileData = async (req, res) => {
  let userName = req.session.userName;
  let userId = req.session.userId;
  console.log(userId);
  let userData = (await user.fetchUserData(userName))[0];
  let interest = (await user.fetchInterest(userId))[0];
  let images = (await user.fetchImages(userId))[0];
  let Geoloc = (await user.fetchGeoLoc(userName))[0];
  let i = 0;
  let dbInterestArr = [];

  while (i < interest.length) {
    dbInterestArr.push(interest[i].topic);
    i++;
  }

  res.json({
    formData: userData[0],
    listInterest: dbInterestArr,
    imgData: images,
    geoInfo: Geoloc[0]
  });
}

exports.postProfileData = async(req, res) => {
  const sessionUser = req.session.userName;
  const userId = req.session.userId;
  const userName = (req.query.userName).trim();
  const firstName = (req.query.firstName).trim();
  const lastName = (req.query.lastName).trim();
  const email = (req.query.email).trim();
  const bio = (req.query.bio).trim();
  var {
    password,
    gender,
    secPrefTotal,
    dateOfBirth,
    interest,
    longitude,
    latitude
  } = req.query;
  const errors = [];
  const interests = ["science", "tech", "food", "swimming", "football", "anime", "e-games", "makeUp", "series", "movies", "cinema", "art", "music", "self improvement", "reading"];

  
  var response = (await user.findUser(userName))[0];
  // Check username , firstname , lastname
  // console.log(firstName,form.valideName(firstName));
  if (!form.valideUserName(userName) || !form.valideName(firstName) || !form.valideName(lastName))
    errors.push({msg: "Not valid input"});
  // Check if the userName is already in database
  if (response.length > 0 && response[0].userName != sessionUser)
    errors.push({ msg: "This username already exists." });
  //Check Email
  if (!form.valideEmail(email))
    errors.push({msg: "Email Not Valid"});
  //Check Password
  if (!form.validePassword(password))
    errors.push({msg: "Password not valide"});
  // Check Gender
  if (!(gender == "male" || gender == "female"))
    errors.push({msg: "Please enter valid gender value"});
  // Check Sex Preferences
  if (secPrefTotal == undefined) {
    errors.push({msg: "At least one gender must be selected"
    });
  } else if (secPrefTotal.length > 0) {
    if (!(secPrefTotal.length <= 2 && (secPrefTotal.includes("male") || secPrefTotal.includes("female"))))
      errors.push({msg: "Please enter Valid SexPreferences values"});
  }
  // Check date of birth
  var dateCheck = new Date();
  var dateCheck = moment(new Date(dateOfBirth), 'MM/DD/YYYY', true).isValid();
  if (dateCheck == true) {
    var age = moment().diff(new Date(dateOfBirth), 'years');
    // console.log(age);
    if (age < 17 || age > 100)
      errors.push({msg: "Restricted Age!"});
  } else
    errors.push({msg: "Date is not Valid"});
  // Check Biography
  if (bio.length > 255)
    errors.push({msg: "Your Bio is too long"});
  // check GeoLocation
  if(!longitude)
    longitude = 0;
  if(!latitude)
    latitude = 0;
  // Check interest
  if (!interest)
    errors.push({msg: "Please choose at least one interest"})
  else if (interest.length < 6) {
    var i = 0;
    while (i < interest.length) {
      if (interests.includes(interest[i].toLowerCase()))
        i++;
      else {
        errors.push({msg: "Please select interset from the list above"});
        break;
      }
    }
    // Remove duplicated items
    pushDbArray = _.uniq(interest);
  } else
    errors.push({ msg: "You have 6 interest choices" });
  
  if (errors.length > 0) {
    res.json(errors);
  } else {
    if (secPrefTotal.length == 2)
      secPrefTotal[0] = "both";
    // Update
    var i = 0;
    // Delete all old interest to add new ones
    await user.deleteAllInterest(userId);
    // hash the new password || old password
    var hash = await bcrypt.hash(password, 12);
    await user.updateProfileData(userName, firstName, lastName, email, hash, gender, secPrefTotal[0], dateOfBirth, age, bio, sessionUser);
    await user.saveGeoLocation(userName, parseFloat(longitude).toFixed(4), parseFloat(latitude).toFixed(4));
    // save new values to session
    req.session.userName = userName;
    req.session.sexPref = secPrefTotal;
    req.session.gender = gender;
    req.session.age = age;
    req.session.longitude = parseFloat(longitude).toFixed(4);
    req.session.latitude = parseFloat(latitude).toFixed(4);
    // add new interests
    while (i < pushDbArray.length) {
      await user.addInterest(userId, pushDbArray[i]);
      i++;
    }
    res.json([{msg: "done"}]);
  }

}
