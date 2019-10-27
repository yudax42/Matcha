const user = require('../models/User');
const form = require('../models/Form');
const moment = require('moment');
const bcrypt = require('bcryptjs');
var _ = require('lodash');
var fs = require('fs');
var Distance = require('geo-distance');

exports.getProfile = (req, res) => {
  res.render('user/profile', {
    errorMsg: req.flash('error')
  });
};
exports.getMatch = (req, res) => {
  const userName = req.session.userName;
  const userId = req.session.userId;
  const gender = req.session.gender;
  const sexPref = req.session.sexPref;
  var myCor = {lat:req.session.latitude,lon:req.session.geoLong}
  const age = 25;
  var min;
  var max = age + 3;
  (age - 18) > 3 ? min = age-3 : min = 18;
  console.log(sexPref);
  if(sexPref[0] == "male" || sexPref[0] == "female")
  {
    user.filterUsersGender(sexPref[0],min,max,userName)
    .then(([data]) => {
      // console.log(data[0]);
     
    })
    .catch(err => console.log(err))
  }
  else if(sexPref == 'both')
  {
   
    var locArray = [];
    user.filterUsers(min,max,userName)
    .then(([data]) => {

      //sort by location
      locArray = _.orderBy(data,(data)=> {

        if(data.geoLong && data.geoLat)
        {
          var userPoint = {lat:data.geoLat,lon:data.geoLong};
          return (Distance.between(myCor, userPoint).radians);
        }
        // else
        // {
        //   var userPoint = {lat:data.ipLat,lon:data.ipLong};
        //   return (Distance.between(myCorIp, userPoint));
        // }
      },['asc']);
      console.log(data);
      console.log("________________");
      console.log(locArray);
    })
    .catch(err => console.log(err))
  }

  res.render('user/home', {
    errorMsg: req.flash('error')
  });
};

exports.addProfileImgs = (req, res) => {
  const image = req.file;
  const userId = req.session.userId;
  const imgIndex = req.query.imgIndex;
  var errors = [];

  if (!image) {
    console.log(image);
    res.json({
      msg: 'image must be JPG, JPEG, PNG'
    });
  } else {
    // file.size <
    console.log(image);
    if (image.size < 4194304) {
      //check if is there an image in imgIndex
      user.checkImgIndex(userId, imgIndex)
        .then(([data]) => {
          // if found delete old image path
          if (data.length == 1) {
            // delete file
            fs.unlink(data[0].imgPath, (err) => {
              if (err) throw err;
              console.log('File deleted!');
              // delete old path in db
              user.deleteImgIndex(userId, imgIndex)
                .then(() => {
                  // add new image
                  user.addImage(userId, image.path, imgIndex)
                    .then(() => res.send("done"));
                })
                .catch((err) => console.log(err))
            });
          } else {
            // add image
            user.addImage(userId, image.path, imgIndex)
              .then(() => res.send("done"));
          }

        });
    } else {
      //delete image uploaded
      fs.unlink(image.path, (err) => {
        res.json({
          msg: "image must not be > 4mb"
        });
      });
    }
  }
}

exports.getProfileData = (req, res) => {
  const userName = req.session.userName;
  const userId = req.session.userId;
  const sexPref = req.session.sexPref;
  user.fetchUserData(userName)
    .then(([data1]) => {
      user.fetchInterest(userId)
        .then(([data]) => {
          var i = 0;
          var dbInterestArr = [];
          while (i < data.length) {
            dbInterestArr.push(data[i].topic);
            i++;
          }
          user.fetchImages(userId)
            .then(([data3]) => {
              user.fetchGeoLoc(userName)
              .then(([data4]) => {
                res.json({
                  formData: data1[0],
                  listInterest: dbInterestArr,
                  imgData: data3,
                  geoInfo: data4[0]
                });
              })
            })
        });

    })
    .catch(err => console.log(err));
}

exports.postProfileData = (req, res) => {
  // session variable
  const sessionUser = req.session.userName;
  const userId = req.session.userId;
  var {
    userName,
    firstName,
    lastName,
    email,
    password,
    gender,
    secPredTotal,
    dateOfBirth,
    bio,
    interest,
    longitude,
    latitude
  } = req.query;
  const errors = [];
  const interests = ["science", "tech", "food", "swimming", "football", "anime", "e-games", "makeUp", "series", "movies", "cinema", "art", "music", "self improvement", "reading"];
  // Check if the userName is already in database
  user.findUser(userName).
  then(([response]) => {
      if (response.length > 0 && response[0].userName != sessionUser)
        errors.push({
          msg: "this userName already exists ."
        });
      // Check username , firstname , lastname
      if (!form.valideName(userName) || !form.valideName(firstName) || !form.valideName(lastName))
        errors.push({
          msg: "Not valid input"
        });
      //Check Email
      if (!form.valideEmail(email))
        errors.push({
          msg: "email Not Valid"
        });
      //Check Password
      if (!form.validePassword(password))
        errors.push({
          msg: "Password not valide"
        });
      // Check Gender
      if (!(gender == "male" || gender == "female"))
        errors.push({
          msg: "Please enter Valid gender value"
        });
      // Check Sex Preferences
      if (secPredTotal == undefined) {
        errors.push({
          msg: "at least one gender must be selected"
        });
      } else if (secPredTotal.length > 0) {
        if (!(secPredTotal.length <= 2 && (secPredTotal.includes("male") || secPredTotal.includes("female"))))
          errors.push({
            msg: "Please enter Valid SexPreferences values"
          });
      }
      // Check date of birth
      var dateCheck = moment(dateOfBirth, 'MM/DD/YYYY', true).isValid();
      if (dateCheck == true) {
        var age = moment().diff(dateOfBirth, 'years');
        // console.log(age);
        if (age < 17 || age > 100)
          errors.push({
            msg: "Restricted Age!"
          });
      } else
        errors.push({
          msg: "Date is not Valid"
        });

      // Check Biography
      if (bio.length > 255)
        errors.push({
          msg: "Your Bio is too long"
        });

      // Check interest
      if (!interest)
        errors.push({
          msg: "Please choose at least one interest"
        })
      else if (interest.length < 6) {
        var i = 0;
        while (i < interest.length) {
          if (interests.includes(interest[i].toLowerCase()))
            i++;
          else {
            errors.push({
              msg: "Please select interset from the list above"
            });
            break;
          }
        }
        // check GeoLocation
        if(!longitude)
          longitude = 0;
        if(!latitude)
          latitude = 0;
        // Remove duplicated items
        pushDbArray = _.uniq(interest);
      } else
        errors.push({
          msg: "You have 6 interest choices"
        });

      if (errors.length > 0) {
        res.json(errors);
      } else {
        if (secPredTotal.length == 2)
          secPredTotal[0] = "both";
        // Update
        var i = 0;
        // Delete all old interest to add new ones
        user.deleteAllInterest(userId)
          .then(() => {
            bcrypt.hash(password, 12, (err, hash) => {
              user.updateProfileData(userName, firstName, lastName, email, hash, gender, secPredTotal[0], dateOfBirth, age, bio, sessionUser)
                .then(() => {
                  user.saveGeoLocation(userName,longitude,latitude)
                  .then(() => {
                    req.session.userName = userName;
                    req.session.sexPref = secPredTotal;
                    req.session.gender = gender;
                    req.session.age = age;
                    req.session.longitude = response.longitude;
                    req.session.latitude = response.latitude;
                    while (i < pushDbArray.length) {
                      user.addInterest(userId, pushDbArray[i])
                        .then(() => {})
                        .catch((err) => console.log(err));
                      i++;
                    }
                    res.json([{
                      msg: "done"
                    }]);
                  })
                })
                .catch(err => console.log(err));
            });
          });

      }
    })
    .catch((err) => console.log(err));

}
