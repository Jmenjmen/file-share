const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const path = require("path");
const fs = require("fs");

//import schemas
const userModule = require("../schemas/userSchema");
const accountModel = require("../schemas/accountSchema");

//secret key
const key = require("../tokenKey");
const AccountModel = require("../schemas/accountSchema");

function generateToken(payload) {
    return jwt.sign(payload, key, { expiresIn: '90d' });
}

//auth routes
module.exports.register = async function Register(req, res) {
    try {
        const { username, password } = req.body;

        const candidate = await userModule.findOne({ username: username });
        if(candidate) {
            res.status(409).json({
                response: "user with this username is now exist"
            })
            return 0
        }

        const salt = bcrypt.genSaltSync(7);
        const hashedPasswd = bcrypt.hashSync(password, salt);

        const newUser = new userModule({ username: username, hashedPasswd: hashedPasswd });

        const newAccount = new accountModel({ user: newUser });
        
        try{
            await newUser.save();
            await newAccount.save();
            const token = generateToken({
                username: username,
                hashedPasswd: hashedPasswd
            });
            return res.status(202).json({
                token: token
            })
        } catch(e) {
            console.log('user save error', e)
        }

    } catch(e) {
        console.log(e)
    }
}

module.exports.login = async function login(req, res) {
    try {
        const { username, password } = req.body;

        const candidate = await userModule.findOne({ username: username });
        if(!candidate) {
            return res.status(409).json({
                response: "user with this username does not exist"
            })
        }

        const checkPassword = bcrypt.compareSync(password, candidate.hashedPasswd);
        if(!checkPassword) {
            return res.status(409).json({
                response: "password is not correct"
            })
        }

        try {
            const token = generateToken({
                username: username,
                hashedPasswd: candidate.hashedPasswd
            })
            return res.status(202).json({
                token: token
            })
        } catch(e) {
            console.log(e)
        }

    } catch(e) {
        console.log(e)
    }
}

//account check
module.exports.AccDetails = async function account_details(req, res) {
    try {
        const token = req.headers['authorization'];
        if(!token) {
            return res.status(409).json({
                response: "You are not authorized"
            })
        }

        const data = jwt.verify(token, key);
        const user = await userModule.findOne({ username: data.username });

        const detail = await accountModel.findOne({ user: user._id });

        return res.status(202).json({
            response: detail
        })
    } catch(e) {
        console.log(e)
    }
}

module.exports.FileUpload = async function fileUpload(req, res) {
    try {
        const token = req.headers['authorization'];
        if(!token) {
            return res.status(409).json({
                response: "You are not authorized"
            })
        }

        const data = jwt.verify(token, key);
        const user = await userModule.findOne({ username: data.username });

        const detail = await accountModel.findOne({ user: user._id });

        const fileName = req.file.originalname;

        await accountModel.findByIdAndUpdate(
            detail._id,
            { $push: { files: fileName } },
            { new: true, useFindAndModify: false }
        );

        return res.status(202).json({
            response: "file successfully uploaded"
        })
    } catch (e) {
        console.log(e)
    }
}

module.exports.GetAllFiles = async function getAllFiles(req, res) {
    try {
        const AccountMap = await accountModel.find({})
        res.status(202).json(AccountMap)
    } catch(e) {
        console.log(e)
    }
}

module.exports.getUserFiles = async function getUserFiles(req, res) {
    try {
        const userId = req.params.user;
        console.log(userId)

        const userAccount = await AccountModel.findOne({ user: userId });
        if(!userAccount) {
            return res.status(404).json({
                response: "User not found"
            })
        }

        res.status(202).json(userAccount.files)
    } catch(e) {
        console.log(e)
    }
}

module.exports.downloadFile = async function downloadFile(req, res) {
    try {
        const { user, fileId } = req.params;

        const userAccount = await accountModel.findOne({ user: user });
        console.log(userAccount)
        if(!userAccount) {
            return res.status(404).json({
                response: "User not found"
            })
        }

        const userFiles = userAccount.files;
        console.log(userFiles[fileId]);
        if(!userFiles[fileId]) {
            return res.status(404).json({
                response: "file not found"
            })
        }
        const filePath = path.join(__dirname, '..', 'files', user, userFiles[fileId]);

        res.download(filePath)
    } catch(e) {
        console.log(e)
    }
}

module.exports.FileDetail = async function FileDetail(req, res) {
    try {
        const { user, fileId } = req.params;

        const userAccount = await accountModel.findOne({ user: user });
        console.log(userAccount)
        if(!userAccount) {
            return res.status(404).json({
                response: "User not found"
            })
        }

        const userFiles = userAccount.files;
        console.log(userFiles[fileId]);
        if(!userFiles[fileId]) {
            return res.status(404).json({
                response: "file not found"
            })
        }
        const filePath = path.join(__dirname, '..', 'files', user, userFiles[fileId]);

        const fileStats = fs.stat(filePath, (err, stat) => {
            if(err) {
                console.log(err, "lox");
                return res.status(404).json({
                    response: "Something gone wrong"
                })
            }

            console.log(stat)
            return res.status(202).json(stat)
        })

    } catch(e) {
        console.log(e)
    }
} 