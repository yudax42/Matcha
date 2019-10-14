const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const errorController = require('./controllers/error');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const app = express();

app.use(express.static(path.join(__dirname,'public')));
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({extended:false}));

app.use(expressLayouts);
app.use('/auth',authRouter);
app.use('/user',userRouter);
app.use(errorController.error404);
app.listen(3000);