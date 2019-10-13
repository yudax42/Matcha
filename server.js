const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
var expressLayouts = require('express-ejs-layouts');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));
app.use(expressLayouts);

app.get('/',(req,res) => {
    res.render('auth/login');
})
app.get('/login',(req,res) => {
    res.render('auth/login');
})
app.get('/signup',(req,res) => {
    res.render('auth/signup');
})

app.listen(3000);