const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');
const applicationsRoutes = require('./routes/applications');
const userRoutes = require('./routes/users');
const dataServerRoutes = require('./routes/dataServer');

const app = express();

mongoose.connect('mongodb://' + process.env.MONGO_USERNAME + ':' + process.env.MONGO_PW + '@' + process.env.MONGO_HOST + '/' + process.env.MONGO_DB, { useCreateIndex: true, useNewUrlParser: true })
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(() => {
    console.log('Connection failed to database!');
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use("/scripts", express.static(path.join(__dirname, 'scripts')));
app.use("/images", express.static(path.join(__dirname, 'images')));
app.use("/", express.static(path.join(__dirname, 'angular')));

/* app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  next();
}); */

app.use("/api/posts", postsRoutes);
app.use("/api/apps", applicationsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/data-server", dataServerRoutes);
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, 'angular', 'index.html'));
});

module.exports = app;
