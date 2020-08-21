exports.refreshUserLevel = function(req,res){
    User.findOne({user_name : req.query.username}).then((doc)=>{
      var pointToAdd = req.query.points
      doc.user_points  = parseInt(pointToAdd)+parseInt(doc.user_points)
      var pointRemain = parseInt(doc.user_points) - parseInt(doc.user_points_total)
      while(doc.user_points >= doc.user_points_total)
      {
        doc.user_points_total += 50
        doc.user_level += 1
        if(pointRemain>0)
          doc.user_points = pointRemain
      }
      User.findOneAndUpdate({user_name: req.query.username},
      {user_points_total:doc.user_points_total, user_points:doc.user_points, user_level:doc.user_level}, {new: true},
         (err, updated) => {res.json(updated)})
    })
}

exports.getLead = function(req,res){
    User.find({},(err,doc) =>{ res.json(doc)}).sort({'user_level': -1}).limit(10)
}

exports.getUserInfo = function(req,res){
    User.find({user_name: req.params.username})
    .then(player => {
      res.json({playersInfo: player})})
}

exports.updateUserWinLose = function(req,res){
  var win = 0
  var lose = 0
  console.log(req.query.user_win)
  if(req.query.user_win == true)
  win= 1
  else
  lose = 1
User.findOneAndUpdate({user_name: req.query.username},
  {$inc:{user_played:1 , user_win:win , user_lose:lose} },(err,update)=>{res.status(200).send()})
}
