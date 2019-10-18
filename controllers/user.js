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