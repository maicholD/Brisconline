module.exports = function(mongoose) {
    var Schema = mongoose.Schema;

    var UserSchema = new Schema({
        user_name: String,
        user_mail: String,
        user_pass: String,
        user_points_total: Number,
        user_points: Number,
        user_level:Number,
        user_img:String,
        user_background:String,
        user_cardBack:String,
        user_table:String,
        user_win:Number,
        user_lose:Number,
        user_played:Number
    });
    return mongoose.model('userModel', UserSchema, 'users');


};
