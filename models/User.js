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
	static fetchUserData(userName)
	{
		return db.execute('SELECT userName,firstName,lastName,email FROM users WHERE userName = ?',[userName]);
	}
}