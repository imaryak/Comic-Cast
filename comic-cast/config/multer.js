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
    var ext = path.extname(file.originalname);
    if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
        return cb(new Error('Only images are allowed'))
    }
    cb(null, true)
}

module.exports = multer({ storage: storage, fileFilter: fileFilter }).single('avatar');
