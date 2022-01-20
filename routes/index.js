const express = require('express');
const router = express.Router();
const File = require('../models/file');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const multer = require('multer');
const User = require('../models/User');



//alocating storage
let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/profile_pic') ,
  filename: (req, file, cb) => {
      const uniqueName = `${req.user.email}${Math.random()*1}${path.extname(file.originalname)}`;
            cb(null, uniqueName)
  } ,
});
let upload = multer({ storage, limits:{ fileSize: 1000000 * 100 }, }).single('profile_pic');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, async(req, res) =>{
  
    const file = await File.find({ userOwnerId: req.user._id });
    res.render('dashboard', {
      user: req.user,
      file,
    })

}
);
router.get("/editInfo", ensureAuthenticated, (req, res)=>{
  res.render('editInfo', {user:req.user})
} );
router.post("/editInfo",ensureAuthenticated,upload, async (req, res)=>{
  try {
        var objForUpdate = {};
        if(req.body.name) objForUpdate.name =  req.body.name;
        if(req.body.email) objForUpdate.email = req.body.email;
        if(req.file){
          objForUpdate.profile_pic = req.file.filename;
          console.log(req.user.profile_pic);
          await fs.unlinkSync(`uploads/profile_pic/${req.user.profile_pic}`);
        } 
        if(req.body.password && req.body.password2) {
          if(req.body.password.length>6 && req.body.password==req.body.password2){
            objForUpdate.password = req.body.password;
            bcrypt.genSalt(10, async (err, salt)=>{
                bcrypt.hash(objForUpdate.password, salt, async(err, hash)=>{
                  if(err) throw err;
                  objForUpdate.password =  hash;
                  console.log(objForUpdate.password);
                  const updateUser= await User.updateOne({email:req.user.email},objForUpdate);
                  return res.render('/dashboard');
                })
            });
          } 
          
          
        }
        console.log(objForUpdate);
        const updateUser= await User.updateOne({email:req.user.email},objForUpdate);
        res.redirect('/dashboard')
    
  } catch (error) {
      console.log(error);
  }

})  

module.exports = router;
