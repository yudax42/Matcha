var Admin = require('../models/Admin');
var Form = require('../models/Form');



exports.getAdminAuth = (req,res) => {
    res.render("admin/auth");
};

exports.getAdminHome = (req,res) => {
    res.render("admin/control");
}

exports.getStatistics = async(req,res) =>{
    const totalUsers = (await Admin.getTotalUsers())[0][0];
    const totalOnlineUsers = (await Admin.getTotalOnlineUsers())[0][0];
    const totalReports = (await Admin.getTotalReports())[0][0];
    const totalMatched = (await Admin.getTotalMatched())[0][0];
    res.json({
        stateData : {totalUsers: totalUsers.total,totalOnlineUsers: totalOnlineUsers.total,totalReports: totalReports.total,totalMatched:totalMatched.total}
    });
}

exports.postAdminEnter = (req,res) => {
    var key = "actx3ng";
    
    if(req.body.adminKey == key)
    {
        req.session.adminLoggedIn = true;
        return req.session.save(err => {
            return res.redirect("/admin/backdoor/home");
        });
    }
    else
        res.render("admin/auth",{errors: [{msg: "mmmm ??"}]});

    
};

exports.getAllUsers = (req,res) => {
    res.render("admin/allUsers");
}

exports.getUsers = async(req,res)=> {
    const users = (await Admin.getUsers())[0];
    res.json({users: users});
}
exports.deleteUser = async(req,res) =>{
    const userName = req.query.userName;
    if(Form.valideUserName(userName))
    {
        await Admin.deleteUser(userName);
        return res.send("ok");
    }
    else
        return res.json({error:"not valid UserName"});
}

exports.updateUserState = async(req,res) => {
    const userName = req.query.userName;
    const newState = req.query.newState;
    if(Form.valideUserName(userName))
    {
        await Admin.updateUserState(userName,newState);
        res.send("ok");
    }
    else
        return res.json({error:"not valid UserName"});

}

exports.sendEmail = async(req,res) => {
    var userName = req.params.userName;
    res.render('admin/sendEmail',{userName:userName});
}
exports.actionSendEmail = async(req,res) => {
    var userName = req.body.userName;
    var subject = req.body.subject;
    var message = req.body.message;
    var email  = (await Admin.getUserEmail(userName))[0][0].email;
    const sent = await Form.sendEmail(email,subject,userName,message,"http://localhost:3000/auth/login");
    if(sent == "Mail Sent !")
        res.redirect('/admin/backDoor/');
    else
        res.render("admin/auth",{errors: [{msg: "there was an error, try again later"}]});
}

exports.getOnlineUsers = async(req,res) => {
    const users = (await Admin.getOnlineUsers())[0];
    res.json({users: users});
}
exports.onlineUsers = (req,res) => {
    res.render("admin/onlineUsers");
};

exports.getReports = async(req,res) => {
    const from = (await Admin.getReportsFrom())[0];
    const to = (await Admin.getReportsTo())[0];
    res.json({from: from,to : to});
}
exports.reports = (req,res) => {
    res.render("admin/reports");
};

exports.adminLogout = (req, res) => {
    req.session.destroy(err => {
      res.redirect("/admin/BackDoor/");
    });
};