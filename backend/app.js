//dotenv
require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
// import router
var userRouter = require('./routes/userRouter');
var adminRouter = require('./routes/adminRouter');
//mongo db connect
var mongoDB = require('./db/config')
mongoDB
var app = express();

const allowedOrigins = [
  'http://localhost:3000', // Add your frontend url here
  // Add more allowed origins if needed
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// app.use(cors(corsOptions));
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname,'..','frontend', 'dist')));
// use router
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
// Serve static images from the public folder folder
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname,'..','frontend', "dist", "index.html"));
});
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
  res.send({error : err.message});
});


module.exports = app;
