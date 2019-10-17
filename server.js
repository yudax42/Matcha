// Packages Requirement 
const path              = require('path');
const express           = require('express');
const bodyParser        = require('body-parser');
const expressLayouts    = require('express-ejs-layouts');
const session           = require('express-session');
const csrf              = require('csurf');
const flash             = require('connect-flash');
const MySQLStore        = require('express-mysql-session')(session);


// Controllers Requirement
const errorController   = require('./controllers/error');
const authRouter        = require('./routes/auth');
const userRouter        = require('./routes/user');

// initialize
const app               = express();
const csrfProtection    = csrf();
const sessionStore      = new MySQLStore({host:'localhost',user:'root',password:'',database:'matcha'});

// set
app.set('view engine', 'ejs');
app.set('views', 'views');

// Middlewares
app.use(session({
    secret: 'atcIdeology',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({extended:false}));
app.use(csrfProtection);
// we used this two variables in the page every time so it's better to add them in any response
app.use((req,res,next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.csrfToken = req.csrfToken();
	next();
});
app.use(express.static(path.join(__dirname,'public')));
app.use(expressLayouts);
app.use(flash());
app.get('/',(req,res) => {res.render('user/root');});
app.use('/auth',authRouter);
app.use('/user',userRouter);
app.use(errorController.error404);

// Server Settings
app.listen(3000);