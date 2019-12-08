/*
    wa 3ndak tensa not active account raq commentitiha f route dial getPublic profile 
*/
var user = require('../models/User');
const form = require('../models/Form');
const path = require('../util/path');
const moment = require('moment');
const bcrypt = require('bcryptjs');
var _ = require('lodash');
var fs = require('fs');
var Distance = require('geo-distance');


exports.getProfile = (req, res) => {
  res.render('user/profile', {errorMsg: req.flash('error')});
};

exports.actions = async(req, res) => {
  const myId = req.session.userId;
  const action = req.query.action;
  const userIdT = parseInt(req.query.userId);
  var sockets = req.sockets;


  if (action != 'love' && action != 'report' && action != 'block')
    return res.json({ error: "action not correct" });
  else if (userIdT < 0)
    return res.json({ error: "a sb7an lah" });
  else if (myId == userIdT)
    return res.json({ error: "arrasi arrasi" });
  else
  {
    
    var checkUser = (await user.checkUserAction(myId,userIdT))[0];
    if (checkUser.length > 0)
    {      
      // check action state 
      var state = checkUser[0][action];
      // change to the new state
      await user.updateaction(action, myId, userIdT, !state);
      if (sockets[userIdT] && (action == "love"))
      {
        let stateMsg;
        if(state == 1)
          stateMsg = "Unliked ";
        else
          stateMsg = "Liked ";
        await user.addNewNotif(req.session.userId,userIdT,`${req.session.userName} ${stateMsg} you`);
        sockets[userIdT].emit('notification',{not: `${req.session.userName} ${stateMsg} you`});
      }
      
    }
    else
    {
      var  state = false;
      
      
      await user.addaction(action, myId, userIdT);
    }
    if(action == 'love')
    {
      var checkOtherUseriflikesMe = (await user.checkUserAction(userIdT,myId))[0];
      var checkMatchedUsers  = (await user.checkifMatched(myId,userIdT))[0];
      var checkifDo ;
      if(checkOtherUseriflikesMe.length > 0)
        checkifDo = checkOtherUseriflikesMe[0]['love']
      else
        checkifDo = 0;
      // check if x person liked me before and the new updated state is true
      if(checkifDo == 1 && !state == true && checkMatchedUsers.length == 0)
      {
        // if yes add it to matches table because where both like each other
        await user.addToMatches(myId, userIdT);
        await user.addNewNotif(req.session.userId,userIdT,`you are matched with ${req.session.userName}`);
        if(sockets[userIdT])
          sockets[userIdT].emit('notification',{not: `you are matched with ${req.session.userName}`});
      }//if we matched before but one of them unlike the other will be deleted from matches table
      else if(!state == false && checkMatchedUsers.length > 0)
      {
        // if he unliked me 
        await user.deleteMatches(myId,userIdT);
      }

      // fameRating
      var countLikes = (await user.fetchLikesCount(userIdT))[0][0];
      console.log(countLikes);
      if(countLikes.total >= 0 && countLikes.total <= 50)
      {
        await user.updateFameRating(Math.floor(countLikes.total/10),userIdT);
      }

    }
    const buttonsState = (await user.checkUserAction(myId,userIdT))[0][0];
    
    res.send({buttonsState : buttonsState}); 
  }
}


exports.getPublicProfile = async(req, res) => {
  const userToFind = req.params.user;
  var sockets = req.sockets;
  //firstName, last Name , fameRating, bio, tags, images

  // get the blocked users 
  var blockedUsers = (await user.blockedUsersName(req.session.userId))[0];
  var found = _.find(blockedUsers, function(o) { return o.userName == userToFind; });
  console.log(blockedUsers);
  console.log(found);
  // check it's valid 
  if (!form.valideUserName(userToFind))
    return res.redirect('/user/home');
  
  // check if user exists 
  var foundedUser = (await user.findUser(userToFind))[0][0];
  if (foundedUser.length == 0)
    return res.redirect('/user/home');
  else if(found != undefined)
    return res.redirect('/user/home');
  else
  {
    if (foundedUser.accStat != 'active')
      return res.redirect('/user/home');
    const data = {
      id: foundedUser.id,
      userName: foundedUser.userName,
      firstName: foundedUser.firstName,
      lastName: foundedUser.lastName,
      fameRating: foundedUser.fameRating,
      bio: foundedUser.bio,
      age: foundedUser.age,
      sexPref : foundedUser.sexPref,
    };
    // fetch images
    const userImages = (await user.fetchImages(foundedUser.id))[0];
    data.images = userImages;
    // fetch tags
    const tags = (await user.fetchInterest(foundedUser.id))[0];
    data.tags = tags;
    // fetch status
    console.log("==",foundedUser.id);
    const userState = (await user.getUserState(foundedUser.id))[0][0];
    data.userState = {online :userState.is_online,last_login: userState.last_login == null ? "never logged" : moment(userState.last_login).fromNow()};
    // data.userState.last_login = moment(userState.last_login).fromNow();
    // console.log("hi",userState.is_online);
    // fetch button state 
    const buttonsState = (await user.checkUserAction(req.session.userId,foundedUser.id))[0];
    if(buttonsState.length == 0)
      buttonsState[0] = {block:0,love:0,report:0};
    data.buttonsState = buttonsState[0];
    if(sockets[foundedUser.id])
    {
      await user.addNewNotif(req.session.userId,foundedUser.id,`${req.session.userName} visited you profile`);
      sockets[foundedUser.id].emit('notification',{not: `${req.session.userName} visited you profile`});
    }
    await user.addToVisiteHistory(req.session.userId,foundedUser.id);
    res.render('user/publicProfile', {errorMsg: req.flash('error'),data: data});
  }
};
exports.getMatch = (req, res) => {
  res.render('user/home', {errorMsg: req.flash('error')});
};

exports.getSearchData = async (req, res) => {
  var myInterests = (await user.fetchInterest(req.session.userId))[0];
  var age = req.session.age;
  var searchData = {
    fameRating : req.session.fameRating,
    maxDistance : 9500,
    age : age,
    max : age + 5,
    min : ((age - 18) > 5 ? age - 5 : 18),
    sexPref : req.session.sexPref,
    myInterests : myInterests
  }
  res.json(searchData);
}

exports.getMatchData = async(req, res) => {
  const userName = req.session.userName;
  const userId = req.session.userId;
  const gender = req.session.gender;
  const age = req.session.age;
  var myCor = { lat: req.session.latitude, lon: req.session.longitude }
  let errors = [];
  const interests = ["science", "tech", "food", "swimming", "football", "anime", "e-games", "make up", "series", "movies", "cinema", "art", "music", "self improvement", "reading"];
  //search data
  var { fameRating, distance, ageRangeMin, ageRangeMax, genderPref, interest } = req.query;
  var myInterests = interest || await user.fetchInterest(userId);
  var maxFameRating = fameRating || req.session.fameRating;
  var defaultDistance =  distance || 9500;
  var max = parseInt(ageRangeMax) || age + 5;
  var min = parseInt(ageRangeMin) || ((age - 18) > 5 ? age-5 : 18);
  var sexPref = genderPref || req.session.sexPref;
  var search;
  if (fameRating || distance || ageRangeMin || ageRangeMax || genderPref || interest)
  {
    search = 1;    
    if (fameRating < 0 || fameRating > req.session.fameRating)
      errors.push({ error: "fame Rating gap not correct" });
    if (distance > 9500 || distance < 0)
      errors.push({ error: "Distance not correct" });
    if (ageRangeMin < ((age - 18) > 5 ? age - 5 : 18) || ageRangeMin > age + 5 || ageRangeMax > age + 5 || ageRangeMax < ((age - 18) > 5 ? age - 5 : 18))
      errors.push({error: "age gap not correct"});
    if (genderPref != "male" && genderPref != "female" && genderPref != "both")
      errors.push({ error: "Gender not correct" });
    if (!interest)
      errors.push({ error: "Please choose at least one interest" })
    else if (interest.length < 6) {
      var i = 0;
      while (i < interest.length) {
        if (interests.includes(interest[i].toLowerCase()))
          i++;
        else {
          errors.push({ error: "Please select interset from the list above" });
          break;
        }
      }
    }
    else
    {
      errors.push({ error: "You have the max of 5 tags." });
    }
      
    if (errors.length > 0)
      return res.json({ errors:errors });
  }
  else
    search = 0;

  var getRightusers = async (data) => {
    var rightUsers;

    // remove blocked users
    var blockedUsers = (await user.blockedUsers(req.session.userId))[0];
    blockedUsers = blockedUsers.map((obj) => {
      return obj.userIdT;
    });
    data = data.filter(function(user) {
      return !blockedUsers.includes(user.id); 
    })
    
    // remove elements with distance 
    rightUsers = _.map(data, (user) => {
      var userPoint = { lat: (user.geoLat || user.ipLat), lon: (user.geoLong || user.ipLong) };
      if ((Distance.between(myCor, userPoint).radians) * 6371 < defaultDistance)
        return user;
    })
    rightUsers = _.without(rightUsers, undefined); // remove undefined elements

    //sort by location
    rightUsers = _.orderBy(rightUsers,(data)=> {
        var userPoint = {lat:(data.geoLat || data.ipLat),lon:(data.geoLong || data.ipLong)};
        return (Distance.between(myCor, userPoint).radians);
        // m radians = distance in km / 6371 
    },['asc']);
      
    // add common tags count
    var appendCountTag = (rightUsers) => {
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
  rightUsers = await appendCountTag(rightUsers);
  return (rightUsers);
  }
 
  var users;
  if (sexPref == "male" || sexPref == "female")
  {
    users = (await user.filterUsersGender(sexPref, min, max, maxFameRating, userName))[0];
  }
  else if (sexPref == 'both')
  {
    users = (await user.filterUsers(min, max,userName,maxFameRating))[0];
    console.log(users);
  }
    

  var rightUsers = await getRightusers(users);

  res.json(rightUsers);
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
      var data = (await user.checkImgIndex(imgIndex,userId))[0];
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
        await user.addImage(userId, "/"+image.path, imgIndex);
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
  let visiteHistory = (await user.getMyvisiteHistory(userId))[0];
  let whoLookeAtMyProfile = (await user.getWhoLookedAtMyProfile(userId))[0];
  let whoLikedMyProfile = (await user.getWhoLikedMyProfile(userId))[0];
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
    geoInfo: Geoloc[0],
    visiteHistory: visiteHistory,
    whoLookeAtMyProfile:whoLookeAtMyProfile,
    whoLikedMyProfile: whoLikedMyProfile
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
  const interests = ["science", "tech", "food", "swimming", "football", "anime", "e-games", "make up", "series", "movies", "cinema", "art", "music", "self improvement", "reading"];

  
  var response = (await user.findUser(userName))[0];
  // Check username , firstname , lastname
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
      secPrefTotal = "both";
    else
      secPrefTotal = secPrefTotal[0];
    // Update
    var i = 0;
    // Delete all old interest to add new ones
    await user.deleteAllInterest(userId);
    // hash the new password || old password
    var hash = await bcrypt.hash(password, 12);
    await user.updateProfileData(userName, firstName, lastName, email, hash, gender, secPrefTotal, dateOfBirth, age, bio, sessionUser);
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

exports.chats = (req,res) => {
  res.render('user/chat');
}

exports.serveUserImg = async(req,res) =>{ 
  var userName = req.params.userName;
  if(form.valideUserName(userName))
  {
    const imgPath = (await user.getProfileImg(userName))[0][0];
    res.json({path:imgPath.imgPath});
  }
  else
    res.status(404).json({error:"resource not found"});
}

exports.getMatchedUsers = async(req,res) =>
{
  var users = [];
  users.push({sessionId: req.session.userId,sessionUserName: req.session.userName});
  const fetchMatchedUser = (await user.fetchMatchedLeft(req.session.userId))[0];
  const fetchMatchedUser2 = (await user.fetchMatchedRight(req.session.userId))[0];

  fetchMatchedUser.map(user => {
    users.push(user);
  })
  fetchMatchedUser2.map(user => {
    users.push(user);
  })

  res.json({users:users});
}

exports.getMessages = async(req,res) =>
{
  
  var messages = [];
  var userIdF = req.query.sender;
  var userIdT = req.query.receiver;

  
  var part1 = (await user.fetchMessages(userIdF,userIdT))[0];
  var part2 = (await user.fetchMessages(userIdT,userIdF))[0];
  part1.map(msg => {
    messages.push(msg);
  });
  part2.map(msg => {
    messages.push(msg);
  })

  var sorted = _.sortBy(messages,'msgDate');

  res.json({messages : sorted});
}

exports.getNotifications = async(req,res) =>
{
  var notifications = (await user.getNotifications(req.session.userId))[0];
  res.json({notifications: notifications});
}