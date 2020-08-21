var mongoose = require('mongoose');
User = require("../models/userModel.js")(mongoose);
Lobby = require("../models/lobbyModel.js")(mongoose);
Game = require("../models/gameModel.js")(mongoose);
Chat = require("../models/globalChat.js")(mongoose)

exports.loadLoginPage = function(req, res) {
  res.sendFile(approot + '/www/Login.html');
};

exports.loadRegistrationPage = function(req, res) {
  res.sendFile(approot + '/www/registration.html');
};

exports.show_index = function(req, res) {
  res.sendFile(approot + '/www/index.html');
};

exports.login = function(req, res) {
  User.findOne({
    "user_mail": req.query.mail,
    "user_pass": req.query.pass
  },(err, user) =>{
    if (err)
      console.log("errore")
    else {
      if (user) {
        req.session.userid = user.user_name
        res.json(user.user_name)
      }else {
        res.status(210).send({description:"mail or password not valid"})
      }

  }})
};

exports.register = function(req, res) {
  User.countDocuments({
    $or: [{"user_mail": req.query.mail}, {"user_name": req.query.username}]
  }).then(count => {
    if (count > 0)
      res.status(210).send({description: "Username o password gia in uso"})
    else {
      var new_user = new User({
        "user_name": req.query.username,
        "user_pass": req.query.pass,
        "user_mail": req.query.mail,
        "user_points_total": 50,
        "user_points": 0,
        "user_level": 1,
        "user_img": "/img/icon/icon0.png",
        "user_background":"/img/cardBackground/back0.jpg",
        "user_table":"/img/table/table0.jpg",
        "user_cardBack":"/img/retro/retro0.jpg",
        "user_win":0,
        "user_lose":0,
        "user_played":0,
      });
      new_user.save(function(err, user) {
          req.session.userid = user.user_name
          res.status(200).send({});
        });
    }
  });
}

exports.getSessionID = function(req, res) {  res.json(req.session.userid)}

exports.logout = function(req, res) {
  req.session.userid = "";
  res.status(200).send({});
}
