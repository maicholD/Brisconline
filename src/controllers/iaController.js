exports.addIa= function(req,res){
  Game.findOneAndUpdate({game_id: req.query.roomId}, { $push:{ player_joined: JSON.parse(req.query.ia)} , endClickedCount:1}, {new: true},
     (err, updated) => {res.status(200).send()})
}

exports.firstHand = function(req,res){

    Game.findOne({ game_id: req.query.roomId,}, (err, gameInfo) => {
      if (gameInfo != null && gameInfo.cardsOnHand.length < 2) {
        var cards = gameInfo.deck.splice(0, 3)
        var deck = gameInfo.deck
        gameInfo.cardsOnHand.push({username: req.query.username,cards: cards})
        Game.findOneAndUpdate({game_id: req.query.roomId}, {deck: deck,cardsOnHand: gameInfo.cardsOnHand}, {new: true},
           (err, updated) => {})
      }
    })
}

exports.sendCardIa = function(req,res){
  var chosencard = ''
  var nextTurn =''
  Game.findOne({game_id: req.query.roomId},
    (err, doc)=>{
    //ia ha sempre posizione 1
    //prendo una carta,dipendentemente dalla difficolta
    if(doc != null)
    {
      switch (doc.cardsOnHand[1].username) {
        case "noob":
        chosencard = getCard(doc,'noob')
          break;
        case "pro":
        chosencard = getCard(doc,'pro')
          break;
        case "god":
        chosencard = getCard(doc,'god')
          break;
        default:

      }
    //get card prende una carta tramite splice, lo spazio vuoto lo riempio con un retro
    doc.cardsOnHand[1].cards.push({value:'retro',seed:''})
    var cards_on_table = doc.cards_on_table
    cards_on_table.push(chosencard)
    //aggiorno nel server le carte in mano e sulla tavola
     Game.findOneAndUpdate({game_id: req.query.roomId},{cardsOnHand: doc.cardsOnHand,cards_on_table: cards_on_table},{new:true},(err,doc)=>{
    /*  var cards_on_table = doc.cards_on_table
      cards_on_table.push(chosencard)*/
      if(doc.cards_on_table.length == 2)
        endTurn = true
      else
      {
        //se ho una sola carta sulla tavola, allora assegno il turno al player umano
        nextTurn = doc.player_joined[0].user_name
        endTurn = false
      }
      //se e' fine turno, controllo i punteggi e assegno il vincitore
      if(endTurn)
        {
          var cardPlayer1 = doc.cards_on_table[0]
          var cardPlayer2 = doc.cards_on_table[1]

          if (cardPlayer1.card.value == 1 )
            cardPlayer1.card.value = 12
          if (cardPlayer2.card.value == 1)
            cardPlayer2.card.value = 12
          if (cardPlayer1.card.value == 3)
            cardPlayer1.card.value = 11
          if (cardPlayer2.card.value == 3)
            cardPlayer2.card.value = 11
            //il primo a tirare nel prossimo turno e' il vincitore tra i due
            nextTurn = getWinner(cardPlayer1, cardPlayer2, doc)
            //calcolo i punti e aggiorno
            var totalPoints = getPointFromCard(cardPlayer1.card.value) + getPointFromCard(cardPlayer2.card.value)
            //se l'utente non ha ancora segnato, lo creo nel db
            if(doc.points_scored.length==1)
              doc.points_scored.push({ username: cardPlayer2.username,points: 0})

            doc.points_scored.forEach((item, i) => {
            //aggiorno il punteggio sul db
              if (item.username == nextTurn)
                doc.points_scored[i].points = item.points + totalPoints
              });
          }
          Game.findOneAndUpdate({game_id: doc.game_id}, {current_player: nextTurn,points_scored: doc.points_scored}, {new: true}
            , (err, doc) => {res.json({player: nextTurn,endTurn:endTurn})});
    })
    }
  })
}

exports.clearTable = function(req,res)
{
  Game.findOneAndUpdate({game_id: req.query.roomId}, {cards_on_table:[]},(err,doc)=>{res.status(200).send()})
}

function getCard(doc,iaDifficult){
/*
facile: 50% di fare la risposta giusta
-inizio :  giocando scartino -> figura ->scartino briscola -> figura Briscola -> prima carta
-risposta:
  -se e' briscola :scartino -> figura ->scartino briscola -> figura Briscola -> prima carta
  -se e' un carico : rispondo con briscola , se non ho briscola scartino -> figura ->scartino briscola -> figura Briscola -> prima carta
  -se e' un'altra carta :  cerco di lanciare il suo carico, se non ho il carico , lancio carta dello stesso seme , superiore  altrimenti scartino -> figura ->scartino briscola -> figura Briscola -> prima carta
difficile: 100% mossa giusta
  -inizio: scelgo il seme con meno carte
god:ia guarda la tua mano e gioca di conseguenza
inizio:
- se avversario non ha briscola, lancio un carico
- se avversario non ha un seme, lancio una carta di quel seme (non carico)
- se avversario ha un carico di un seme, non lancio quel seme
+tutte cose del hard

*/
  var randProb = Math.floor(Math.random() * 101)
  if(randProb >=50 || iaDifficult != 'noob')
  {
    if(doc.cards_on_table != 0)
    {

      var endfor=false
      var cardPlayer1 = doc.cards_on_table[0].card
      var isBriscola = (cardPlayer1.seed== doc.briscola.seed)
      var briscolaSeed = doc.briscola.seed
      var chosencard = ''
      //devo rispondere
      var cardIndex = -1
        if(isBriscola){
        cardIndex = getNotOptimalLoopEasy(doc)
        chosencard={username:doc.cardsOnHand[1].username , card: doc.cardsOnHand[1].cards.splice(cardIndex,1)[0]}
      }
      else
        {
          //se ha giocato un carico, rispondo con una briscola
          if(cardPlayer1.value =='1' || cardPlayer1.value =='3'){
            cardIndex = getBriscolaIndex(doc)
            if(cardIndex == -1)
            cardIndex = getNotOptimalLoopEasy(doc)
          }
          else{
            //cerco di rispondere con il carico della carta scelta
            cardIndex=getCaricoFromCard(doc,cardPlayer1)
            if(cardIndex == -1)
            //cerco di rispondere con una carta superiore dello stesso seme
            cardIndex=getUpperFromCard(doc,cardPlayer1)
            //se non ho una carta maggiore, faccio il solito loop scartino -> figura ->scartino briscola -> figura Briscola -> prima carta
            if(cardIndex == -1 )
            cardIndex = getNotOptimalLoopEasy(doc)
          }
          if(cardIndex == -1)
            cardIndex = getNotOptimalLoopEasy(doc)

          chosencard={username:doc.cardsOnHand[1].username , card: doc.cardsOnHand[1].cards.splice(cardIndex,1)[0]}
        }

    }else{
      //devo iniziare io
      //faccio il solito loop scartino -> figura ->scartino briscola -> figura Briscola -> prima carta
      if(iaDifficult=='noob')
        cardIndex = getNotOptimalLoopEasy(doc)

      if(iaDifficult =='pro')
        cardIndex = getFirstCardHard(doc)

      if(iaDifficult =='god')
        cardIndex = getFirstCardGod(doc)

      chosencard={username:doc.cardsOnHand[1].username , card: doc.cardsOnHand[1].cards.splice(cardIndex,1)[0]}
    }
  }else
    chosencard={username:doc.cardsOnHand[1].username , card: doc.cardsOnHand[1].cards.splice(0,1)[0]}
  return chosencard
}

//2,4+ 7-
//briscolaNeed se si vuole la carta di briscola
function getWasteIndex(doc,briscola){
  if(!briscola)
  return doc.cardsOnHand[1].cards.findIndex(card => (((parseInt(card.value))==2 || (parseInt(card.value)>=4 && (parseInt(card.value)<=7)))) && card.seed != doc.briscola.seed )
  else
  return doc.cardsOnHand[1].cards.findIndex(card => (((parseInt(card.value))==2 || (parseInt(card.value)>=4 && (parseInt(card.value)<=7)))) && card.seed == doc.briscola.seed )
}
//8,9,10
//briscola se si vuole la carta di briscola
function getFigureIndex(doc,briscola){
  if(!briscola)
  return doc.cardsOnHand[1].cards.findIndex(card => ( parseInt(card.value) >=8  && card.seed != doc.briscola.seed ))
  else
  return doc.cardsOnHand[1].cards.findIndex(card => ( parseInt(card.value) >=8  && card.seed == doc.briscola.seed ))

}
function getBriscolaIndex(doc){
  return doc.cardsOnHand[1].cards.findIndex(card => card.seed == doc.briscola.seed)
}
function getNotOptimalLoopEasy(doc){
  //allora gioco prima uno scartino , se non lo ho allora lancio una figura
  cardIndex = getWasteIndex(doc,false)
  if(cardIndex ==-1)
  cardIndex = getFigureIndex(doc,false)
  //se non ho figure o scartini, allora cerco tra le briscole
  if(cardIndex ==-1)
  cardIndex = getWasteIndex(doc,true)
  if(cardIndex ==-1)
  cardIndex = getFigureIndex(doc,true)
  /*if(cardIndex ==-1)
  cardIndex =  doc.cardsOnHand[1].cards.findIndex(card => (card.seed != doc.briscola.seed) && (card.value =='1' || card.value =='3'))*/
  if(cardIndex ==-1)
  cardIndex =0

  return cardIndex
}
function getCaricoFromCard(doc,cardPlayer1){
  return doc.cardsOnHand[1].cards.findIndex(card => (card.seed == cardPlayer1.seed) && (card.value =='1' || card.value =='3'))
}
function getUpperFromCard(doc,cardPlayer1){
  return doc.cardsOnHand[1].cards.findIndex(card => (card.seed == cardPlayer1.seed) && (card.value > cardPlayer1.value))
}
function getFirstCardHard(doc){
  var bastoniRimanenti = doc.deck.filter(card => card.seed =='b')
  var spadeRimanenti = doc.deck.filter(card => card.seed =='s')
  var denariRimanenti = doc.deck.filter(card => card.seed =='d')
  var coppeRimanenti = doc.deck.filter(card => card.seed =='c')
  var cardIndex = -1
  var maxLength=6;

  //se ci sono pochi semi rimasti , lanciare una carta di quel seme ha una percentuale maggiore di vittoria
  if(doc.deck.length <= 10)
  maxLength=2
  else if(doc.deck.length <= 20)
  maxLength=4

    if(10-bastoniRimanenti.length >= maxLength  && doc.briscola.seed != 'b')
      cardIndex= doc.cardsOnHand[1].cards.findIndex(card => (((parseInt(card.value))==2 || (parseInt(card.value)>=4 ))) && card.seed == 'b')

    if(10-spadeRimanenti.length>= maxLength && doc.briscola.seed != 's' && cardIndex==-1 )
        cardIndex= doc.cardsOnHand[1].cards.findIndex(card => (((parseInt(card.value))==2 || (parseInt(card.value)>=4 ))) && card.seed == 's')

    if(10-denariRimanenti.length >= maxLength && doc.briscola.seed != 'd' && cardIndex==-1)
        cardIndex= doc.cardsOnHand[1].cards.findIndex(card => (((parseInt(card.value))==2 || (parseInt(card.value)>=4 ))) && card.seed == 'd')

    if(10-coppeRimanenti.length >= maxLength && doc.briscola.seed != 'c' && cardIndex==-1)
        cardIndex= doc.cardsOnHand[1].cards.findIndex(card => (((parseInt(card.value))==2 || (parseInt(card.value)>=4 ))) && card.seed == 'c')

    //se ho 3 carichi in mano, ne gioco uno non di briscola
    cardIndex = sendCarico(doc)

  if(cardIndex==-1)
    cardIndex=getNotOptimalLoopEasy(doc)

    return cardIndex
}
function sendCarico(doc){
  var soloCarichi =  doc.cardsOnHand[1].cards.filter(card => card.value == '3' || card.value == '1')
  if(soloCarichi.length == 3)
    return doc.cardsOnHand[1].cards.findIndex(card => card.seed != doc.briscola.seed)
  else
    return -1
}
function getFirstCardGod(doc){
  var cardsPlayer1 = doc.cardsOnHand[0].cards

  var briscola = cardsPlayer1.filter(card => card.seed == doc.briscola.seed)
  var carico =  cardsPlayer1.filter(card => ((card.value=='1' || card.value == '3')&& card.seed != doc.briscola.seed))
  var cardIndex = -1
  //se avversario non ha briscole, lancio carico o punti
  if(briscola.length == 0){
    cardIndex=doc.cardsOnHand[1].cards.findIndex(card => ( (card.value=='1' && card.seed != doc.briscola.seed)  || (card.value == '3' && card.seed != doc.briscola.seed ) ))
  if(cardIndex==-1)
    cardIndex = doc.cardsOnHand[1].cards.findIndex(card => ((parseInt(card.value)>=8) && card.seed != doc.briscola.seed ))
  }else {
    //invio il seme che non ha l'avversario
    cardIndex = getNotSeedP1(doc)
    if(cardIndex == -1){
      //se avversario ha un carico , non butto quel seme
      if(carico.length>0)
        cardIndex = getNoCaricoP1(doc,carico)
    }
  }
  if(cardIndex == -1)
    cardIndex= getFirstCardHard(doc)

return cardIndex
}
//se avversario non ha un seme, butto una carta (non carico) di quel seme
function getNotSeedP1(doc){
  var i =0
  var cardIndex= -1
  var seed =['b','s','d','c']
  for(i=0;i<4;i++)
  {
    if(doc.briscola.seed != seed[i] && cardIndex== -1 )
    {
      //se avversario non ha il seme
      cardIndex = doc.cardsOnHand[0].cards.findIndex(card =>  card.seed != seed[i])
      if(cardIndex!=-1)
      {
       //cerco nella mia mano quel seme
        cardIndex=-1
        cardIndex = doc.cardsOnHand[1].cards.findIndex(card => card.seed ==seed[i] && ( (parseInt(card.value)>=8 || (card.value)=='2')))
      }
    }
  }
  return cardIndex
}
function getNoCaricoP1(doc,carico){
  var cardIndex = -1
  var trovata =false
  var cards = doc.cardsOnHand[1].cards.filter(card => ((parseInt(card.value)>=4 || card.value=='2') ))
  cards.forEach((card, i) => {
        carico.forEach((item, i) => {
            if(item.seed == card.seed)
              trovata =true
        })
    if(trovata)
      cardIndex = doc.cardsOnHand[1].cards.findIndex(carta => carta.value == card.value && carta.seed == card.seed)
  })
  return cardIndex
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
