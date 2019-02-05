const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email
        , password: hash
        , username: req.body.username
        , isAdmin: false
      });
      user.save()
        .then(result => {
          res.status(201).json({
            message: 'User created!'
            , result: result
          });
        })
        .catch(err => {
          res.status(500).json({
            message: 'Invalid authentication credentials!'
          })
        });
    });
}

exports.userLogin = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: 'Auth Failed!'
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: 'Auth Failed!'
        });
      }
      const token = jwt.sign({ email: fetchedUser.email, userId : fetchedUser._id, isAdmin: fetchedUser.isAdmin }, process.env.JWT_KEY, { expiresIn: '1h' });
      res.status(200).json({
        token: token
        , expiresIn: 3600
        , userId: fetchedUser._id
        , isAdmin: fetchedUser.isAdmin
      })
    })
    .catch(err => {
      return res.status(401).json({
        message: 'Invalid authentication credentials!'
      });
    });
}

exports.getUser = (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({message: 'User not found!'});
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: 'Fetching user failed!'
      });
    });
}

exports.getUsers = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const userQuery = User.find();
  let fectchedUsers;
  if(pageSize && currentPage) {
    userQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  userQuery
    .then(documents => {
      fectchedUsers = documents;
      return User.countDocuments();
    })
    .then(count => {
      res.status(200).json({
        message: 'Users fetched succesfully!'
        , users: fectchedUsers
        , maxUsers: count
      });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: 'Fetching users failed!'
      });
    });
}
