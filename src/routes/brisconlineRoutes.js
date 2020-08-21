module.exports = function(app) {
  var userAuthController = require('../controllers/userAuthController');
  var lobbyController = require('../controllers/lobbyController');
  var gameController = require('../controllers/gameController');
  var iaController = require('../controllers/iaController');
  var userController = require('../controllers/userInfoController');

  app.route('/api/login')
    .post(userAuthController.login);

  app.route('/api/register')
    .post(userAuthController.register);

  app.route('/api/room')
    .get(lobbyController.showRooms)
    .post(lobbyController.addRoom);

  app.route('/api/lobby/join')
    .post(lobbyController.joinLobby);

  app.route('/api/lobby/info/:roomId')
    .get(lobbyController.getLobbyInfo);

  app.route('/api/lobby/close/:lobbyId')
    .get(lobbyController.closeLobby)

  app.route('/api/lobby/leave')
    .post(lobbyController.leaveLobby)

  app.route('/api/room/matchPass')
    .post(lobbyController.matchPass);

  app.route('/api/user/updateUserBackground')
    .post(lobbyController.updateUserBackground)

  app.route('/api/user/updateUserTable')
    .post(lobbyController.updateUserTable)

  app.route('/api/user/updateUserWinLose')
    .post(userController.updateUserWinLose)

  app.route('/api/user/updateUserCardBack')
    .post(lobbyController.updateUserCardBack)

  app.route('/api/user/updateUserImg')
    .post(lobbyController.updateUserImg)

  app.route('/api/user/refreshUserInfo/:username')
    .get(lobbyController.refreshUserInfo)

  app.route('/api/game/addIa')
    .post(iaController.addIa)

  app.route('/api/game/ia/firstHand')
    .post(iaController.firstHand)

  app.route('/api/game/ia/sendCardIa')
    .post(iaController.sendCardIa)

  app.route('/api/game/ia/clearTable')
    .post(iaController.clearTable)

  app.route('/session/id')
      .get(userAuthController.getSessionID);

  app.route('/api/session/logout')
      .get(userAuthController.logout);

  app.route('/api/user/refreshUserLevel')
      .post(userController.refreshUserLevel);

  app.route('/api/user/getLead')
      .get(userController.getLead);

  app.route('/api/user/sendGlobalMsg')
      .post(lobbyController.sendGlobalMsg);

  app.route('/api/user/getGlobalMsg')
       .get(lobbyController.getGlobalMsg);

  app.route('/api/user/userInfo/:username')
      .get(userController.getUserInfo);

  app.route('/api/game/initGame')
      .post(gameController.initGame)

  app.route('/api/game/firstHand/')
      .post(gameController.firstHand);

  app.route('/api/game/sendCardPlayed')
      .post(gameController.sendCardPlayed)

  app.route('/api/game/getCardPlayed/:roomId')
      .get(gameController.getCardPlayed)

  app.route('/api/game/getHand')
      .post(gameController.getHand)

  app.route('/api/game/EndTurn')
      .post(gameController.endTurn)

  app.route('/api/game/EndGame')
      .post(gameController.endGame)
  app.route('/api/game/gameClosed/:roomId')
      .get(gameController.getGameClosed)

  app.route('/api/game/sendClick/:roomId')
      .get(gameController.sendClick)

  app.route('/api/game/sendMsg')
      .post(gameController.sendMsg);

  app.route('/api/game/getMsgGame/:roomId')
       .get(gameController.getMsgGame);

  app.use(userAuthController.show_index);
};
