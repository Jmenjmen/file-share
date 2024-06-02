const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require("fs");

const multer = require("multer");
const jwt = require("jsonwebtoken");

//user schema
const User = require("../schemas/userSchema");

//secret key
const key = require("../tokenKey");



//check folder existing
const createFolderIfNotExists = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const token = req.headers['authorization'];
        if(!token) {
            return res.status(409).json({
                response: "You are not authorized"
            })
        }

        const data = jwt.verify(token, key);
        const user = await User.findOne({ username: data.username });

        if (!user) {
            return cb(new Error('Пользователь не найден'), null);
        }

        const uploadPath = path.join(__dirname, '..', 'files', user._id.toString());
        createFolderIfNotExists(uploadPath);

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Имя файла остается оригинальным
    }
});

const upload = multer({ storage: storage });



const Routes = require('../routes/routes');

//auth routes
router.post('/auth/register', Routes.register);
router.post('/auth/login', Routes.login);

//account route
router.post('/account/details', Routes.AccDetails);

//account file upload
router.post('/account/upload', upload.single('avatar'), Routes.FileUpload);

//get all account and files
router.post('/account/accounts', Routes.GetAllFiles);
router.post('/account/:user', Routes.getUserFiles);

//download file
router.get('/file/download/:user/:fileId', Routes.downloadFile);

//file details
router.get('/file/detail/:user/:fileId', Routes.FileDetail)

module.exports = router