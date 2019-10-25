const db = require('../util/database');


module.exports = class User{
	constructor(userName,firstName,lastName,email,password)
	{
		this.userName =userName;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.password = password;
	}
	add()
	{
		return db.execute("insert into users(userName,firstName,lastName,email,password,accStat) values(?,?,?,?,?,?)",[
		this.userName,this.firstName,this.lastName,this.email,this.password,"not active"]);
	};
	static findUser(userName)
	{
		return db.execute('SELECT * FROM users WHERE userName = ?',[userName]);
	}
	static fetchInterest(userId)
	{
		return db.execute('SELECT topic FROM interest WHERE user_id = ?',[userId]);
	}
	static deleteAllInterest(userId)
	{
		return db.execute('DELETE FROM interest WHERE user_id = ?',[userId]);
	}
	static fetchUserData(userName)
	{
		return db.execute('SELECT userName,firstName,lastName,email,gender,sexPref,birthDate,age,bio FROM users WHERE userName = ?',[userName]);
	}
	static addInterest(userId,topic)
	{
		return db.execute('INSERT INTO interest(user_id,topic) VALUES(?,?)',[userId,topic]);
	}
	static addImage(userId,path,imgIndex)
	{
		return db.execute('INSERT INTO profilePictures(user_id,imgPath,imgIndex) VALUES(?,?,?)',[userId,path,imgIndex]);
	}
	static deleteImgIndex(userId,imgIndex)
	{
		return db.execute('DELETE FROM profilePictures WHERE imgIndex = ? AND user_id = ? ',[imgIndex,userId]);
	}
	static checkImgIndex(userId,imgIndex)
	{
		return db.execute('SELECT * FROM profilePictures WHERE imgIndex = ?',[imgIndex]);
	}
	static updateProfileData(userName,firstName,lastName,email,password,gender,secPredTotal,dateOfBirth,age,bio,sessionUser)
	{
		console.log(dateOfBirth);
		return db.execute('UPDATE users SET userName = ?, firstName = ?, lastName = ?, email = ?, password = ?, gender = ?, sexPref = ?,birthDate = STR_TO_DATE(REPLACE(?,"/","-"), "%m-%d-%Y"),age = ?,bio = ? WHERE userName = ?;',
			[userName,firstName,lastName,email,password,gender,secPredTotal,dateOfBirth,age,bio,sessionUser]);
	}
}
