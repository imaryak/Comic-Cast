const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "comicast.standup@gmail.com",
        pass: "pbagmypuomnestlb"
    },
}); 
