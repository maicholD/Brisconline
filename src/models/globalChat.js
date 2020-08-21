module.exports = function(mongoose) {
  var Schema = mongoose.Schema;
  var GlobalChatSchema = new Schema({
    username: String,
    userIcon:String,
    message: String,
    time:{ type : Date, default: Date.now }
  });
  return mongoose.model('globalModel', GlobalChatSchema, 'globalchat');
};
