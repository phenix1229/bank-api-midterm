const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users/userRoutes');
const accountsRouter = require('./routes/accounts/accountRoutes');
require('dotenv').config();
require('./lib/passport');

const app = express();

mongoose.connect("mongodb+srv://pgaray1229:Newyer98!@cluster0-dnsdm.azure.mongodb.net/test?retryWrites=true&w=majority", {
  useNewUrlParser:true,
  useUnifiedTopology:true,
  useCreateIndex:true
}).then(()=>{
  console.log('MongoDB connected');
}).catch(err => console.log(`Mongo Error: ${err}`));

// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://pgaray1229:Newyer98!@cluster0-dnsdm.azure.mongodb.net/test?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.use(session({
  resave:true,
  saveUninitialized:true,
  secret:process.env.SESSION_SECRET,
  store: new MongoStore({
    url:process.env.MONGODB_URI,
    autoReconnect:true,
    cookie: {maxAge: 60000}
  })
}));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
})

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/auth', accountsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;