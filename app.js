var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
const expressLayouts = require('express-ejs-layouts')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const db = require('./db/db');
const User = require('./models/User');
const jwt = require('jsonwebtoken')
require('dotenv').config()

var app = express();

app.use(helmet({
  contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "*", "'unsafe-inline'"],
    connectSrc: ["'self'", "https://some-domain.com", "https://some.other.domain.com"],
    styleSrc: ["'self'", "fonts.googleapis.com","*", "'unsafe-inline'","*"],
    fontSrc: ["'self'", "*"],
    imgSrc: ["'self'", "https://maps.gstatic.com", "https://maps.googleapis.com", "data:", "https://another-domain.com"],
    frameSrc: ["'self'", "https://www.google.com"]
  }
},
    }
));



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);



app.use(logger('tiny'));


//to add body to default request object generated by express
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//to add cookies to default request object generated by express
app.use(cookieParser());

app.use(async(req, res, next) => {
  const token = req.cookies["token"]
 
  if(token){
    const data = jwt.verify(token,process.env.JWT_REFRESH_KEY) ;
    const user = await User.findById(data._id) ;
    res.locals.user = user ;
    req.user = user ;
    next()
  }
  res.locals.user = false ;
  next();
})

app.use('/static', express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/accounts', usersRouter);


// error handler
app.use(function (err, req, res, next) {

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err)
  res.status(err.status || 500);
   res.send("Error")
});




app.listen(3000, () => {
  console.log(`http://localhost:3000`)
})

