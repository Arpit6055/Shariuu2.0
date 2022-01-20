const router = require('express').Router();
const File = require('../models/file');
const fs = require('fs');
const { ensureAuthenticated } = require('../config/auth');

router.get('/:uuid', ensureAuthenticated, async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
      
        return res.render('download', { uuid: file.uuid, fileName: file.filename, user: req.user.name,fileSize: file.size, downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}` });
     
    } catch(err) {
        return res.render('download', { error: 'Something went wrong.'});
    }
});

router.get('/delete/:uuid', ensureAuthenticated, async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        fs.unlinkSync(file.path);
        await file.remove();
        console.log(`successfully deleted ${file.filename}`);
        res.redirect('/dashboard')
     
    } catch(err) {
        return res.render('download', { error: 'Something went wrong.'});
    }
});


module.exports = router;