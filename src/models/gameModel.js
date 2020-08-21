module.exports = function(mongoose) {
  var Schema = mongoose.Schema;
  var GameSchema = new Schema({
    game_id: Number,
    player_joined: Array,
    current_player: Object,
    deck: Array,
    cards_on_table: Array,
    briscola: Object,
    points_scored: Array,
    endClickedCount: Number,
    cardsOnHand: Array,
    chat:Array
  });
  return mongoose.model('gameModel', GameSchema, 'game');
};
