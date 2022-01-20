const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuidv4 } = require('uuid');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/') ,
    filename: (req, file, cb) => {
        const uniqueName = `${path.parse(file.originalname).name}${Date.now()*Math.random()}${path.extname(file.originalname)}`;
              cb(null, uniqueName)
    } ,
});

let upload = multer({ storage, limits:{ fileSize: 1000000 * 100 }, }).single('myfile'); //100mb
router.post('/',ensureAuthenticated, (req, res) => {
  upload(req, res, async (err) => {
    try {
            // console.log(fileExt);
            if(!req.file ){
              return res.json({error: 'All fields are required'});
            }
  
            const file = new File({
              userOwnerId: req.user._id,
              userOwnerName: req.user.name,
              filename: req.file.filename,
              path: req.file.path,
              size: req.file.size,
              uuid: uuidv4(),
          });
          const response = await file.save();
          res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
      } catch (error) {
        console.log(error);
        res.send(error)
      }
      });
});

module.exports = router;