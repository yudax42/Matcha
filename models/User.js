const db = require('../util/database');


module.exports = class User {
  constructor(userName, firstName, lastName, email, password,token) {
    this.userName = userName;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.token = token;
  }
  add() {
    return db.execute("insert into users(userName,firstName,lastName,email,password,accStat,emailToken,sexPref,fameRating) values(?,?,?,?,?,?,?,?,?)", [
      this.userName, this.firstName, this.lastName, this.email, this.password, "not active",this.token,"both",0
    ]);
  };
  static findUser(userName) {
    return db.execute('SELECT * FROM users WHERE userName = ?', [userName]);
  }
  static findUserId(id) {
    return db.execute('SELECT * FROM users WHERE id = ?', [id]);
  }
  static findAccountWithEmail(userName,email)
  {
    return db.execute('SELECT * FROM users WHERE userName = ? AND email = ?', [userName,email]);
  }
  static fetchInterest(userId) {
    return db.execute('SELECT topic FROM interest WHERE user_id = ?', [userId]);
  }
  static fetchInterestOthers(userName) {
    return db.execute('select topic from interest where user_id in (select id from users where userName = ?)', [userName]);
  }
  static getProfileImg(userName)
  {
    return db.execute('SELECT imgPath FROM profilePictures WHERE user_id in (select id from users where userName = ?) AND imgIndex="profile"', [userName]);
  }
  static getProfileImgWithId(id)
  {
    return db.execute('SELECT imgPath FROM profilePictures WHERE user_id in (select id from users where id = ?) AND imgIndex="profile"', [id]);
  }
  static fetchImages(userId) {
    return db.execute('SELECT imgPath,imgIndex FROM profilePictures WHERE user_id = ?', [userId]);
  }
  static addToken(userName, token) {
    return db.execute('INSERT INTO users(emailToken) VALUES(?) WHERE userName = ?', [token, userName]);
  }
  static addPassToken(userName, token) {
    return db.execute('UPDATE users SET resetPassToken = ? WHERE userName = ?', [token, userName]);
  }
  static addnewPass(hash, token,userName) {
    return db.execute('UPDATE users SET password = ? WHERE userName = ? AND resetPassToken = ?', [hash, userName,token]);
  }
  static checkTokenEmail(token) {
    return db.execute('SELECT * FROM users WHERE emailToken = ?', [token]);
  }
  static checkToken(userName,token) {
    return db.execute('SELECT * FROM users WHERE resetPassToken = ? AND userName = ?', [token,userName]);
  }
  static checkResetToken(token) {
    return db.execute('SELECT * FROM users WHERE emailToken = ?', [token]);
  }
  static activateAccount(token) {
    return db.execute('UPDATE users SET accStat = "active" WHERE emailToken = ?', [token]);
  }
  static accountStatus(userName) {
    return db.execute('SELECT accStat FROM users WHERE userName = ?', [userName]);
  }
  static deleteAllInterest(userId) {
    return db.execute('DELETE FROM interest WHERE user_id = ?', [userId]);
  }
  static fetchUserData(userName) {
    return db.execute('SELECT userName,firstName,fameRating,lastName,email,gender,sexPref,birthDate,age,bio FROM users WHERE userName = ?', [userName]);
  }
  static addInterest(userId, topic) {
    return db.execute('INSERT INTO interest(user_id,topic) VALUES(?,?)', [userId, topic]);
  }
  static addImage(userId, path, imgIndex) {
    return db.execute('INSERT INTO profilePictures(user_id,imgPath,imgIndex) VALUES(?,?,?)', [userId, path, imgIndex]);
  }

  // GeoLocation
  static firstTimeSaveIpLocation(userName,long,lat)
  {
    return db.execute('INSERT INTO userLocation(userName,ipLong,ipLat) VALUES(?,?,?)',[userName,long,lat]);
  }
  static saveIpLocation(userName,long,lat)
  {
    return db.execute('UPDATE userLocation SET ipLong = ?, ipLat = ? WHERE userName = ?',[long,lat,userName]);
  }
  static saveGeoLocation(userName,long,lat)
  {
    return db.execute('UPDATE userLocation SET geoLong = ?, geoLat = ? WHERE userName = ?',[long,lat,userName]);
  }
  static fetchGeoLoc(userName)
  {
    return db.execute('SELECT geoLong,geoLat FROM userLocation WHERE userName = ?',[userName]);
  }
  static deleteImgIndex(userId, imgIndex) {
    return db.execute('DELETE FROM profilePictures WHERE imgIndex = ? AND user_id = ? ', [imgIndex, userId]);
  }
  static checkImgIndex(imgIndex,userId) {
    return db.execute('SELECT * FROM profilePictures WHERE imgIndex = ? and user_id = ?', [imgIndex,userId]);
  }
  static filterUsersGender(sexPref,min,max,maxFameRating,userName)
  {
    return db.execute('select users.id,users.userName,users.gender,users.age,users.bio,users.fameRating,userLocation.geoLong,userLocation.geoLat,userLocation.ipLong,userLocation.ipLat FROM users INNER JOIN userLocation ON users.userName = userLocation.userName AND users.gender = ? AND users.age <= ? AND users.age >= ? AND users.userName != ? AND users.fameRating <= ?  ORDER BY age ASC',[sexPref,max,min,userName,maxFameRating]);
  }
  static filterUsers(min,max,userName,maxFameRating)
  {
    return db.execute('select users.id,users.userName,users.gender,users.age,users.bio,users.fameRating,userLocation.geoLong,userLocation.geoLat,userLocation.ipLong,userLocation.ipLat FROM users INNER JOIN userLocation ON users.userName = userLocation.userName AND users.age <= ? AND users.age >= ? AND users.userName != ? and users.fameRating <= ? ORDER BY age ASC',[max,min,userName,maxFameRating]);
  }
  static updateProfileData(userName, firstName, lastName, email, password, gender, secPredTotal, dateOfBirth, age, bio, sessionUser) {
    return db.execute('UPDATE users SET userName = ?, firstName = ?, lastName = ?, email = ?, password = ?, gender = ?, sexPref = ?,birthDate = STR_TO_DATE(REPLACE(?,"/","-"), "%m-%d-%Y"),age = ?,bio = ? WHERE userName = ?;',
      [userName, firstName, lastName, email, password, gender, secPredTotal, dateOfBirth, age, bio, sessionUser]);
  }

  static addaction(action, myId, userId)
  {
    return db.execute(`INSERT INTO actions(userIdF,userIdT,${action}) values(?,?,1)`, [myId,userId]);
  }
  static blockedUsers(myId)
  {
    return db.execute(`SELECT userIdT FROM actions where userIdF = ? and block = 1`, [myId]);
  }
  static blockedUsersChatT(myId)
  {
    return db.execute(`SELECT userIdT FROM actions where userIdF = ?  and block = 1`, [myId]);
  }
  static blockedUsersChatF(myId)
  {
    return db.execute(`SELECT userIdF FROM actions where userIdT = ?  and block = 1`, [myId]);
  }
  static blockedUsersNameF(myId)
  {
    return db.execute(`select users.userName from actions inner join users where actions.userIdT = users.id and actions.userIdF = ? and actions.block = 1`,[myId]);
  }
  static blockedUsersNameT(myId)
  {
    return db.execute(`select users.userName from actions inner join users where actions.userIdF = users.id and actions.userIdT = ? and actions.block = 1`,[myId]);
  }
  static updateaction(action, myId, userId,state)
  {
    return db.execute(`UPDATE actions SET ${action} = ? where userIdT = ? and userIdF = ?`,[state,userId,myId]);
  }
  static checkUserAction(myId,userIdT)
  {
    return db.execute(`SELECT * FROM actions where userIdT = ? and userIdF = ?`, [userIdT,myId]);
  }
  static fetchLikesCount(userId)
  {
    return db.execute(`SELECT count(love) as total  FROM actions where love = 1 and userIdT = ?`,[userId]);
  }
  static addToMatches(userIdF, userIdT)
  {
    return db.execute(`INSERT INTO matches(userIdF,userIdT) VALUES(?,?)`,[userIdF,userIdT]);
  }
  static checkifMatched(myId,userIdT)
  {
    return db.execute(`SELECT * FROM matches WHERE (userIdF = ? OR userIdT = ?) AND (userIdF = ? OR userIdT = ?)`,[myId,myId,userIdT,userIdT])
  }
  static checkifBlocked(myId,userIdT)
  {
    return db.execute(`SELECT * FROM actions WHERE (userIdF = ? OR userIdT = ?) AND (userIdF = ? OR userIdT = ?) AND block = 1`,[myId,myId,userIdT,userIdT])
  }
  static deleteMatches(myId,userIdT)
  {
    return db.execute(`DELETE FROM  matches WHERE (userIdF = ? OR userIdT = ?) AND (userIdF = ? OR userIdT = ?) `,[myId,myId,userIdT,userIdT]);
  }
  static fetchMatchedLeft(myId)
  {
    return db.execute(`SELECT profilePictures.imgPath,users.userName,users.is_online,users.id  FROM matches INNER JOIN users on matches.userIdT = users.id and userIdF = ? inner join profilePictures on profilePictures.user_id = users.id and imgIndex = "profile"`,[myId]);
  }
  static fetchMatchedRight(myId)
  {
    return db.execute(`SELECT profilePictures.imgPath,users.userName,users.is_online,users.id  FROM matches INNER JOIN users on matches.userIdF = users.id and userIdT = ? inner join profilePictures on profilePictures.user_id = users.id and imgIndex = "profile"`,[myId]);
  }
  static addMessage(userIdF, userIdT, message)
  {
    return db.execute(`INSERT INTO messages(userIdF,userIdT,message,msgDate) values(?,?,?,now())`,[userIdF,userIdT,message]);
  }
  static fetchMessages(userIdF,userIdT)
  {
    return db.execute(`select * from messages where userIdF = ? and userIdT = ?`,[userIdF,userIdT]);
  }
  // notifications
  static addNewNotif(from,to,notification)
  {
    return db.execute(`INSERT INTO notifications(userIdF,userIdT,notifications,notifDate) VALUES (?,?,?,now())`,[from,to,notification]);
  }
  static getNotifications(userId)
  {
    return db.execute(`SELECT notifications from notifications where userIdT = ?`,[userId]);
  }
  // visite History 
  static addToVisiteHistory(userId,userIdT)
  {
    return db.execute(`INSERT INTO visitHistory(userId,visited,visitDate) VALUES(?,?,now())`,[userId,userIdT]);
  }
  static getMyvisiteHistory(userId)
  {
    return db.execute(`SELECT users.userName, visitHistory.visitDate FROM visitHistory INNER JOIN users  where visitHistory.visited = users.id and userId = ?`,[userId]);
  }
  static getWhoLookedAtMyProfile(userId)
  {
    return db.execute(`SELECT users.userName, visitHistory.visitDate FROM visitHistory INNER JOIN users  where visitHistory.userId = users.id and visitHistory.userId != ? and visitHistory.visited = ?`,[userId,userId]);
  }
  static getWhoLikedMyProfile(userId)
  {
    return db.execute(`SELECT users.userName FROM actions INNER JOIN users WHERE users.id = actions.userIdF and actions.userIdT = ? and love = 1`,[userId]);
  }
  static updateUserStatus(state,userId)
  {
    return db.execute(`UPDATE users SET is_online = ? where id = ?`,[state,userId]);
  }
  static addLastLogin(userId)
  {

    return db.execute(`UPDATE users SET last_login = now() where id = ?`,[userId]);
  }
  static getUserState(userId)
  {
    return db.execute(`SELECT is_online,last_login FROM users where id = ?`,[userId]);
  }
  static updateFameRating(value,userId)
  {
    return db.execute(`UPDATE users SET fameRating = ? where id = ?`,[value,userId]);
  }

}
