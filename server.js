const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const authController = require('./controllers/auth');
const authRouter = require('./routes/auth');
const app = express();


app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));
app.use(expressLayouts);
app.use(authRouter);


app.listen(3000);