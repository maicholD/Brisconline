exports.showRooms = function(req, res) {
  Lobby.find({},(err, lobby) => {res.json(lobby)})
}
exports.matchPass = function(req, res) {
  if(req.query.passIns.needed)
    Lobby.findOne({"room_id": req.query.idRoom,"pass": req.query.passIns.password}).then((doc) => {res.json(doc)})
  else
    Lobby.findOne({"room_id": req.query.idRoom}).then((doc) => {res.json(doc)})
};
exports.addRoom = function(req, res) {
  //se non ci sono room , allora le creo con id=0
  //altrimenti prendo l'ultimo id e lo incremento di 1
  Lobby.countDocuments().then((count) => {
    Lobby.findOne({}, {}, {
      sort: {  room_id: -1}
    }, (err, lobby) => {
      var id = 0
      if (count > 0)
        id = lobby.room_id + 1

      var new_lobby = new Lobby({
        "room_id": id,
        "user_id": req.session.userid,
        "player_count": req.query.playerCount,
        "player_joined": [{
          "player": req.session.userid
        }],
        "pass_req": req.query.passReq,
        "pass": req.query.password,
        "started": false,
        "iaDifficult":req.query.iaDifficult
      });
      new_lobby.save((err, lobby) => {res.json(lobby)})

    })
  });
}
exports.joinLobby = function(req, res) {
  Lobby.findOneAndUpdate({room_id: req.query.idRoom}, {$push: {player_joined: {"player": req.query.username}}}, {new: true},
   (err, doc) => {});
}
exports.getLobbyInfo = function(req, res) {
  Lobby.findOne({room_id: req.params.roomId}, (err, doc) => {
    if(doc){
      //prendo tutti i nomi dei giocatori
      var playersName = []
      doc.player_joined.forEach((item, i) => {playersName.push(item.player)});
      User.find({user_name: {$in: playersName}})
      //.select('user_name user_points user_points_total user_level user_img user_background user_table user_cardBack ')
      .then(players => {res.json({playersInfo: players,started: doc.started})})
    } else {
      res.status(204).send({})
    }
  })
}
exports.updateUserBackground = function(req,res){
  console.log(req.query.newObj);
  User.findOneAndUpdate({user_name:req.query.username},{ user_background: req.query.newObj},{new:true},(err,doc)=>{
    res.status(200).send()
  })
}
exports.updateUserTable = function(req,res){

  User.findOneAndUpdate({user_name:req.query.username},{ user_table: req.query.newObj},{new:true},(err,doc)=>{
    res.status(200).send()
  })
}
exports.updateUserCardBack = function(req,res){
  User.findOneAndUpdate({user_name:req.query.username},{ user_cardBack: req.query.newObj},{new:true},(err,doc)=>{
    res.status(200).send()
  })
}
exports.updateUserImg = function(req,res){
  User.findOneAndUpdate({user_name:req.query.username},{ user_img: req.query.newObj},{new:true},(err,doc)=>{
    res.status(200).send()
  })
}
exports.refreshUserInfo = function(req,res){
  User.findOne({user_name:req.params.username},(err,doc)=>{
    res.json(doc)
  })
}
exports.getGlobalMsg = function(req,res){
  Chat.find({},(err,doc)=>{
    res.json(doc)
  }).limit(30).sort({'time':'asc'})
}
exports.sendGlobalMsg = function(req,res){
  User.findOne({user_name:req.query.username},(err,doc) =>{
    var new_chatMsg = new Chat({
      "username": req.query.username,
      "userIcon": doc.user_img,
      "message": req.query.message
    })
    new_chatMsg.save(function(err, msg) {res.status(200).send({})})
  })
}

exports.closeLobby = function(req, res) {
    Lobby.findOneAndDelete({room_id: req.params.lobbyId}).then(deletedDocument => {})
    res.status(200).send({})
}

exports.leaveLobby = function(req, res) {
  var leavingPlayer = req.query.leavingPlayer
  var lobbyId = req.query.lobbyId
  var playerJoined = req.query.playerJoined
    Lobby.findOneAndUpdate({room_id: lobbyId}, {player_joined: {player: playerJoined}}).then(response => {
      console.log("update?")
      res.status(200).send({})
    })
}
