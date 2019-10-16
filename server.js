const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const errorController = require('./controllers/error');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const app = express();
const mysql = require('mysql2');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
const pool = mysql.createPool(
{
	host: 'localhost',
	user: 'root',
	database: 'matcha',
	waitForConnections: true
});
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

// pool.query("select * from users", (err,rows) => {
// 	if(err)
// 		console.log(err);
// 	console.log(rows[0].name);
// });

app.use(express.static(path.join(__dirname,'public')));
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({extended:false}));

app.use(expressLayouts);
app.use('/auth',authRouter);
app.use('/user',userRouter);
app.use(errorController.error404);
app.listen(3000);