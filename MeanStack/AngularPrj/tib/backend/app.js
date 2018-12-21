const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Post = require('./models/post');

const app = express();

mongoose.connect('mongodb://brotherhood:brotherhood@localhost/TIBDB', { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(() => {
    console.log('Connection failed to database!');
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  next();
});

app.post('/api/posts', (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });
  post.save();
  console.log(post);
  res.status(201).json({
    message: 'Post added successfully!'
  });
});

app.get('/api/posts', (req, res, next) => {
  const posts = [
    {
      id: 'fadsqdqsdqd2123'
      , title: 'First server-side post'
      , content: 'This is coming from the server'
    },
    {
      id: 'qsdmlqksd456'
      , title: 'Second server-side post'
      , content: 'This is coming from the server!'
    },
  ];
  res.status(200).json({
    message: 'Posts fetched succesfully!'
    , posts: posts
  });
});

module.exports = app;
