
exports.initGame = function(req, res) {
  //aggiorno il db con started
  Lobby.findOneAndUpdate({room_id: req.query.roomId}, {started: true}, {new: true}, (err, doc) => {
    if (err) {console.log("Something wrong when updating data!");}
  });

  //creo il deck
  var deck = []
  var deckSeed = ['b', 'c', 's', 'd']
  var i;
  for (i = 1; i < 11; i++)
    for (const seed of deckSeed)
      deck.push(cards = {value: i,seed: seed})

  deck = deck.sort(() => Math.random() - 0.5)
  var randomTurn = Math.floor(Math.random() * req.query.players.length)
  var randomBriscola = Math.floor(Math.random() * deck.length)
  var playersJson = []
  var initPoints = []
  req.query.players.forEach((item, i) => {
    playersJson.push(JSON.parse(item))
    initPoints.push({username: JSON.parse(item).user_name,points: 0})
  });
  var new_Game = new Game({
    "game_id": req.query.roomId,
    "player_joined": playersJson,
    "current_player": playersJson[randomTurn].user_name,
    "deck": deck,
    "cards_on_table": [],
    "briscola": deck.shift(),
    "points_scored": initPoints,
    "endClickedCount": 0,
    "cardsOnHand": [],
    "chat":[]
  });
  new_Game.save(function(err, game) {res.status(200).send({})})
}

//pesco 3 carte dal mazzo e ritorno la briscola
exports.firstHand = function(req, res) {

Game.findOne({ game_id: req.query.roomId,}, (err, gameInfo) => {
  console.log(req.query.roomId)
  var current_player = gameInfo.current_player
  //ritorno 3 carte dal mazzo , se e' il mio turno prendo le prime 3, altrimenti le successive 3
  //se il deck ha 37 carte , significa che l'altro giocatore ha gia' pescato
  var cards = ''
  if(req.query.username == current_player)
    cards = gameInfo.deck.splice(0, 3)
  else
    if(gameInfo.deck.length == 37)
      cards = gameInfo.deck.splice(0, 3)
    else
      cards = gameInfo.deck.splice(3, 3)

  var briscola = gameInfo.briscola
  var deck = gameInfo.deck
  gameInfo.cardsOnHand.push({username: req.query.username,cards: cards})
  //ritorno le info iniziali
  Game.findOneAndUpdate({game_id: req.query.roomId}, {deck: deck,cardsOnHand: gameInfo.cardsOnHand}, {new: true},
     (err, updated) => {
    var returnObj = {cards,current_player,briscola}
    res.json(returnObj)
    })
  })
}

//invio al server la carta che il giocatore ha scelto
exports.sendCardPlayed = function(req, res) {

  var cardSelectedIndex = req.query.cardSelectedIndex-1
  var username = req.query.username
  var userHandCards = []

  Game.findOne({game_id: req.query.roomId},
    (err, doc)=>{
    userHandCards = doc.cardsOnHand
    //aggiorno il vettore con la posizione giocata
      doc.cardsOnHand.forEach((item, i) => {
        if(item.username == username)
          userHandCards[i].cards[cardSelectedIndex] = {value:"retro",seed:''}
      });
    //aggiorno nel server le carte in mano
      Game.findOneAndUpdate({game_id: req.query.roomId},{cardsOnHand: userHandCards},{new:true},(err,doc)=>{})
  })

  //aggiorno nel db le carte sulla tavola
  Game.findOneAndUpdate(
  {game_id: req.query.roomId},
  {$push: {cards_on_table: JSON.parse(req.query.cardOnTable)}}, {new: true},
   (err, doc) => {

    var nextTurn = ''
    var endTurn = false
    if (doc.cards_on_table.length == 2)
      endTurn = true
    //se non ci sono due carte sul tavolo
    //scelgo il prossimo giocatore
    doc.player_joined.forEach((player, i) => {
      if (player.user_name != doc.current_player)
        nextTurn = player.user_name
    })
    //conto le carte sul tavolo, se sono due do due carte e assegno il turno
    if (endTurn) {
      var cardPlayer1 = doc.cards_on_table[0]
      var cardPlayer2 = doc.cards_on_table[1]

      if (cardPlayer1.card.value == 1)
        cardPlayer1.card.value = 12
      if (cardPlayer2.card.value == 1)
        cardPlayer2.card.value = 12
      if (cardPlayer1.card.value == 3)
        cardPlayer1.card.value = 11
      if (cardPlayer2.card.value == 3)
        cardPlayer2.card.value = 11
      //assegno il turno al giocatore vincente
      nextTurn = getWinner(cardPlayer1, cardPlayer2, doc)
      //calcolo i punti e aggiorno

      var totalPoints = getPointFromCard(cardPlayer1.card.value) + getPointFromCard(cardPlayer2.card.value)
      doc.points_scored.forEach((item, i) => {
      //aggiorno il punteggio sul db
        if (item.username == nextTurn)
          doc.points_scored[i].points = item.points + totalPoints
      });
    }

    //aggiorno il db con nextTurn e i punti
    Game.findOneAndUpdate({game_id: doc.game_id}, {current_player: nextTurn,points_scored: doc.points_scored}, {new: true}
      , (err, doc) => {res.json({player: nextTurn})});
  })
}

exports.getCardPlayed = function(req, res) {
  Game.findOne({game_id: req.params.roomId}
    , (err, doc) => {
    res.json({cards_on_table: doc.cards_on_table,current_player: doc.current_player,deckLength:doc.deck.length})
  })
}

exports.endTurn = function(req, res) {
  var user = req.query.username
  Game.findOneAndUpdate({game_id: req.query.roomId}, {cards_on_table: []},{new:true},
    (err, doc) => {
      //se il deck non ha piu' carte
      if(doc.deck.length == 0)
        res.json(getNewCard(doc,user))
      else{
        //solo il vincitore dice al db di dare le carte
        if(doc.current_player == user)
        {
          //assegno le carte
           doc.cardsOnHand.forEach((item, i) => {
          //se la mano corrisponde al vincitore, gli do la prima carta nel mazzo
          //essendo il vincitore non puo' mai essere la briscola uscita inizialmente
             if(item.username == doc.current_player)
             {
                item.cards.forEach((card, s) => {
                  if(card.value =="retro")
                    doc.cardsOnHand[i].cards[s]=doc.deck.shift()
                });
             }else {
               //se la mano e' del giocatore che ha perso
              //per ogni carta controllo quale e' stata giocata(value='retro1')
              //e la sostituisco con la seconda carta
                item.cards.forEach((card, s) => {
                    if(card.value == "retro"){

                    if(doc.deck.length>1){
                      //se il perdente ha indice 0 nel vettore cardsOnHand significa che dovra' avere la seconda carta del mazzo(splice(1,1))
                      if(i==0){
                        var tmp = doc.deck.splice(1,1)
                        doc.cardsOnHand[i].cards[s]=tmp[0]
                      }
                      else
                      //se il perdente ha indice 1 nel vettore cardsOnHand , dovra' avere la prima carta del mazzo, avendo il vincitore, gia' preso la sua
                        doc.cardsOnHand[i].cards[s]= doc.deck.shift()
                      }
                    else
                    //se e' l'ultima pescata ritorno la briscola
                    doc.cardsOnHand[i].cards[s]=doc.briscola
                  }
                });
             }
           });
           //pescate le carte, aggiorno il db
           Game.findOneAndUpdate({game_id: req.query.roomId}, {cardsOnHand: doc.cardsOnHand,deck: doc.deck},
             (err, doc) => {})
             //ritorno le carte dei giocatori
             res.json(getNewCard(doc,user))
           }
        else {
           //ritorno le carte dei giocatori al giocatore perdente
           //entrambi i giocatori chiamano EndTurn , solo 1 effettua l'aggiornamento, l'altro riceve le carte scelte
            Game.findOne({ game_id: req.query.roomId},(err,docUpdated)=>{
              res.json(getNewCard(docUpdated,user))
            })
          }
      }
    })
}

exports.endGame = function(req, res) {
  Game.findOne({game_id: req.query.roomId}, (err, doc) => {res.json(doc.points_scored)})
  if(req.query.ia == 'true')
   Game.findOneAndUpdate({game_id: req.query.roomId},{$inc: {endClickedCount: 1}}, (err, doc) => {})

}

exports.sendClick = function(req, res) {
  Game.findOneAndUpdate({game_id: req.params.roomId}, {$inc: {endClickedCount: 1}}, {new: true},
     (err, doc) => {
    //elimino la lobby se entrambi hanno cliccato su close
    if ((doc.endClickedCount >= 2)) {
      Game.findOneAndDelete({game_id: req.params.roomId}).then(deletedDocument => {})
      Lobby.findOneAndDelete({room_id: req.params.roomId}).then(deletedDocument => {})
    }
    res.json(doc)
  })
}

exports.getHand = function(req,res){
  Game.findOne({ game_id: req.query.roomId},(err,doc)=>{
      doc.cardsOnHand.forEach((item, i) => {
        if(item.username == req.query.username)
          res.json(doc.cardsOnHand[i].cards)
      });

  })
}

function getNewCard(doc,user){
  //ritorno le carte dei giocatori
  var obj=''
  var lastTurn=false
  doc.cardsOnHand.forEach((item, i) => {
    if(item.username == user)
    {
      if (doc.deck.length <= 1)
        lastTurn = true
      obj = {cards:doc.cardsOnHand[i].cards, deckLength : doc.deck.length}
    }
  })
  return obj
}

function getWinner(cardPlayer1, cardPlayer2, doc) {
  var nextTurn = ''
  if (cardPlayer1.card.seed == cardPlayer2.card.seed) {
    if (cardPlayer1.card.value > cardPlayer2.card.value)
      nextTurn = cardPlayer1.username
    else
      nextTurn = cardPlayer2.username
  } else {
    //seed diversi
    //controllo Briscola
    if (cardPlayer2.card.seed == doc.briscola.seed) {
      nextTurn = cardPlayer2.username
    } else {
      nextTurn = cardPlayer1.username
    }
  }
  return nextTurn
}

function getPointFromCard(cardValue) {
  switch (cardValue) {
    case 12:
      return 11
      break;
    case 11:
      return 10
      break;
    case 10:
      return 4
      break;
    case 9:
      return 3
      break;
    case 8:
      return 2
      break;
    default:
      return 0
  }
  return 0;
}


exports.sendMsg = function(req,res){
    var msg = {
    "username": req.query.username,
    "userIcon": req.query.icon,
    "message": req.query.message}
  Game.findOneAndUpdate({game_id: req.query.roomId},{$push:{chat:msg}},{new:true},(err,doc)=>{res.json(doc.chat)})
}

exports.getMsgGame = function(req,res){
  Game.findOne({game_id: req.params.roomId}).then(doc =>{res.json(doc.chat)})}

exports.getGameClosed = function(req,res){
  Game.findOne({game_id: req.params.roomId}).then(doc =>{res.json(doc.endClickedCount)})}
