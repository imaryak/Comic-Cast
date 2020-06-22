const User = require('../models/User');

module.exports = (req, res) => {
    var mongooseId = req.params.id;
    User.findOne({_id: mongooseId}, function (err, user){ 
        if (err) throw err;
        if(user){
            User.findByIdAndUpdate( {_id: mongooseId} , {confirmed: true}, function(err, result) {
                if (err) {
                    res.send(err);
                } else {
                    req.flash("success", "Email is now Verified");
                    res.redirect("/users/login");
                }
            });
        }else{
            req.flash("error", "Request is from an Unknown Source");
            res.redirect("/users/login");            
        }
    });
}