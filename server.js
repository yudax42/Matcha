const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const errorController = require('./controllers/error');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const app = express();
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
const csrf = require('csurf');
const csrfProtection = csrf();

var options = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'matcha'
};
var sessionStore = new MySQLStore(options);
app.use(session({
    secret: 'atcIdeology',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

app.use(bodyParser.urlencoded({extended:false}));
app.use(csrfProtection);


app.use((req,res,next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.csrfToken = req.csrfToken();
	next();
});

app.use(express.static(path.join(__dirname,'public')));
app.set('view engine', 'ejs');
app.set('views', 'views');



app.use(expressLayouts);
app.use('/auth',authRouter);
app.use('/user',userRouter);
app.use(errorController.error404);
app.listen(3000);