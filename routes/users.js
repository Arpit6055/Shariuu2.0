const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');
const passport = require('passport');
const multer = require('multer');

//alocating storage
let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/profile_pic') ,
  filename: (req, file, cb) => {
      const uniqueName = `${req.body.email}${path.extname(file.originalname)}`;
            cb(null, uniqueName)
  } ,
});


let upload = multer({ storage, limits:{ fileSize: 1000000 * 100 }, }).single('profile_pic');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', upload,(req, res) => {
  const profile_pic = req.file.fieldname;

  const { name, email, password, password2} = req.body;

  let errors = [];

  if (!name || !email || !password || !password2 || !profile_pic) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        req.flash(
          'error_msg',
          'Email already exists'
        );
        res.redirect('/users/register');
      } else {
        const newUser = new User({
          name,
          email,
          password,
          profile_pic : req.file.filename
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});



module.exports = router;
