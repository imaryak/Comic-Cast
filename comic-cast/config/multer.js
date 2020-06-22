const multer = require('multer');
const path = require('path');

// Multer Config
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/avatar_uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const fileFilter = function (req, file, cb) {
    const authorizedMimetypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (authorizedMimetypes.includes(file.mimetype)) {
        return cb(null, true);
    }else{
        return cb(null, false, console.log("multerError"));
    }
}

module.exports = multer({storage: storage, fileFilter: fileFilter}).single('avatar');
