const db = require('../util/database');


module.exports = class Admin {

    static getTotalUsers()
    {
        return db.execute("SELECT count(*) as total FROM users");
    }
    static getTotalOnlineUsers()
    {
        return db.execute("SELECT count(*) as total FROM users where is_online = 1");
    }
    static getTotalReports()
    {
        return db.execute("select count(*) as total from actions where report = 1");
    }
    static getTotalMatched()
    {
        return db.execute("select count(*) as total from matches");
    }
    static getUsers()
    {
        return db.execute("SELECT userName, firstName, lastName, email, gender, age, is_blocked from users");
    }
    static getOnlineUsers()
    {
        return db.execute("SELECT userName, firstName, lastName, email, gender, age from users where is_online = 1");
    }
    static deleteUser(userName)
    {
        return db.execute("DELETE FROM users WHERE userName = ?",[userName]);
    }
    static updateUserState(userName,newState)
    {
        return db.execute("UPDATE users SET is_blocked = ? WHERE userName = ?",[newState,userName]);
    }
    static getUserEmail(userName)
    {
        return db.execute("SELECT email FROM users WHERE userName = ?",[userName]);
    }
    static getReportsFrom()
    {
        return db.execute("select users.userName from actions inner join users where users.id = actions.userIdF and report = 1");
    }
    static getReportsTo()
    {
        return db.execute("select users.userName from actions inner join users where users.id = actions.userIdT and report = 1");
    }
}