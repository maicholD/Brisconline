module.exports = function(mongoose) {
  var Schema = mongoose.Schema;
  var LobbySchema = new Schema({
    room_id: Number,
    user_id: String,
    player_count: Number,
    player_joined: Array,
    pass_req: String,
    pass: String,
    started: false,
    iaDifficult:String
  });
  return mongoose.model('lobbyModel', LobbySchema, 'lobby');
};
