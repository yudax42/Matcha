exports.getProfile = (req,res) => {
    res.render('user/profile',{
    	errorMsg: req.flash('error')
    });
};