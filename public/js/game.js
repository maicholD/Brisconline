const Game = {
  props: ['players','ia'],
  data() {
    return {
      t2 :'',
      tmpCnt : 0,
      timerCount:'',
      timer :0,
      retroCard:'',
      table :'',
      played:false,
      versusIa :false,
      iaInfo:this.$props.ia,
      points_scored: [],
      showModalEnd: false,
      gameEnded: false,
      deckVisible: true,
      lastTurn: false,
      endTurn: false,
      winHand: false,
      cardSelectedIndex: -1,
      username: localStorage.username,
      roomId: localStorage.roomId,
      players: this.$props.players,
      cards_in_hand: [{value: 'retro',seed: ''}, {value: 'retro',seed: ''}, {value: 'retro',seed: ''}],
      briscola: 'null',
      cardSelected: {value: 'null',seed: 'null'},
      cardPlayer2: {value: 'null',seed: 'null'},
      myTurn: false,
      doLoop: true,
      deckSize:40
    }
  },
  methods: {
    playIa(){
        var t = setInterval(() => {
        //se non e' il mio turno, faccio tirare una carta all'ia
        if(!this.myTurn )
        {
          clearInterval(t)
          axios.post("/api/game/ia/sendCardIa",null,{params:{roomId: this.roomId}}).
          then(response=>{
            setTimeout(()=> {
              this.myTurn = (response.data.player == this.username)
              if((response.data.endTurn && !this.myTurn) ) {
                     setTimeout(()=> {
                        axios.post("/api/game/ia/clearTable",null,{params:{roomId: this.roomId}})
                        .then(result => {
                               axios.post("/api/game/EndTurn",null,{params:{username:response.data.player,roomId: this.roomId,retro:this.retroCard}})
                               .then(result => {})
                           })
                       },1000)
                }
              },1000)
        })}
      },2000)
      if(this.endGame){
        clearInterval(t)
      }
    },
    initIa(iaInfo){
      axios.post("/api/game/addIa",null,{params:{ia:iaInfo,roomId: this.roomId}}).
        then(result=>{
          //consegno le prime 3 carte all'ia
          axios.post("/api/game/ia/firstHand",null,{params:{roomId: this.roomId,username:iaInfo.user_name}}).then()
          })
    },
    getFirstHand() {
      //prendo 3 carte e mi faccio dire la briscola ed il turno attuale
      axios.post("/api/game/firstHand", null, {
        params: {roomId: this.roomId, username: this.username}
      }).then(response => {

        var current_playerInfo = response.data.current_player
        this.myTurn = (this.username == current_playerInfo)
        this.cards_in_hand = response.data.cards;
        this.briscola = { value: response.data.briscola.value,seed: response.data.briscola.seed}
      })
    },
    play(cardSelect) {
      this.played = true;
      this.cardSelectedIndex = cardSelect
      this.cardSelected = {value: this.cards_in_hand[cardSelect - 1].value, seed: this.cards_in_hand[cardSelect - 1].seed}
      axios.post("/api/game/sendCardPlayed", null, {params: {
          username:this.username,
          roomId: this.roomId,
          cardSelectedIndex:this.cardSelectedIndex,
          cardOnTable: {
            username: this.username,
            card: this.cardSelected
          },
          retro:this.retroCard
        }}
      ).then(response => {
        this.myTurn = (response.data.user_name == this.username)
      })
      this.cards_in_hand[cardSelect - 1].value = 'retro'
      this.cards_in_hand[cardSelect - 1].seed = ''
    },
    //resetto la giocata e controllo la fine del gioco
    resetHand() {
      this.cardSelectedIndex = -1
      this.cardSelected = {value: 'null',seed: 'null'}
      this.cardPlayer2 = {value: 'null',seed: 'null'}
      if (this.gameEnded) {
        this.$root.$emit('endGame',true)
        this.doLoop = false
        this.getCardsOnTable()
        axios.post("/api/game/EndGame", null, {params: {roomId: this.roomId,ia:this.versusIa,username:this.username}}).then(response => {
          this.points_scored = response.data
          this.showModalEnd = true
          console.log("punti "+this.points_scored > 60)
          axios.post("/api/user/updateUserWinLose",null,{params:{
            username: localStorage.username,
            user_win : this.points_scored > 60
          }})
        })
      } else {
        this.doLoop = true
        this.getCardsOnTableLoop()
      }
    },
    //prendo le info del tavolo (carte giocate-in mano)
    getCardsOnTableLoop() {
      var t = setInterval(() => {
        if (!this.doLoop || this.gameEnded ) {
          clearInterval(t)
        } else {
          //controllo se l'altro player e' quittato
          axios.get("/api/game/gameClosed/" + localStorage.roomId).then(response => {
            if(response.data>0 && !this.versusIa){
              this.gameEnded = true
              this.doLoop = false
              Swal.fire({
                icon: 'warning',
                html:
                  "L'avversario ha abbandonato la partita",
                showCancelButton: false,
                focusConfirm: false,
                confirmButtonText:
                  'OK'
              }).then(response => {
                axios.get("/api/game/sendClick/" + localStorage.roomId).then(response => {
                  router.replace({
                    name: 'Home'
                  }, () => router.go())
                })
              })
            }
          })
          this.getCardsOnTable()
        }
      }, 1000)
    },
    getCardsOnTable() {
      this.endTurn = false
      this.winHand = false
      axios.post("/api/game/getHand",null,
      {params:{
         username:this.username,
         roomId: this.roomId}}
       ).then(result => {
         this.cards_in_hand = result.data});

         axios.get("/api/game/getCardPlayed/" + this.roomId).then(response => {
          this.deckSize = response.data.deckLength
        if(response.data.deckLength == 0)
        {
            this.briscola = 'null'
            this.deckVisible = false
        }
        //controllo le carte sul tavolo e assegno quella corretta al giocatore avversario
        response.data.cards_on_table.forEach((item, i) => {
          //se c e' una carta sul tavolo e non e' la mia, la assegno a player2
          if (item.username != this.username) {
            this.cardPlayer2 = item.card
            //se entrambi abbiamo lanciato una carta, allora devo fare EndTurn
            if (this.cardSelectedIndex != -1) {
              this.doLoop = false
              this.refreshTable()
            }
          }
        });

        if (this.username == response.data.current_player) {
          //se ho giocato la mia carta e tocca ancora a me, significa che ho vinto
          if (this.cardSelectedIndex != -1)
            this.winHand = true

          this.myTurn = true
        } else
          this.myTurn = false
      })
    },
    refreshTable() {
      setTimeout(() => {
        if (!this.showModalEnd) {
          axios.post(
            "/api/game/EndTurn",null,{params:{
               username:this.username,
               roomId: this.roomId}}
             ).then(result => {
               if(this.versusIa){
                axios.post("/api/game/EndTurn",null,{params:{username:this.iaInfo[0].user_name,roomId: this.roomId}})
                 .then(result => { this.playIa()})
               }
            this.played = false
            this.endTurn = true
            this.gameEnded = true
            this.cards_in_hand = result.data.cards
            var pescato = this.cards_in_hand.filter(card => card.value!= "retro")
            if(result.data.deckLength == 0  && pescato.length ==3 )
              this.lastTurn = true
              if (this.lastTurn) {
                this.briscola = 'null'
                this.deckVisible = false
              }
            //se non ho piu' carte in mano, allora finisco la partita
            this.cards_in_hand.forEach((item, i) => {
              if (item.value != "retro")
                this.gameEnded = false
            });
            this.resetHand()
          })
        }
      }, 1000);
    },
    leave(){
      router.go(-1)
    }
  },
   beforeRouteLeave(to, from, next) {
    if(!this.gameEnded){

    Swal.fire({
      icon: 'question',
      html:
        'Vuoi davvero uscire dal gioco?',
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText:
        'Esci',
      cancelButtonText:
        'Annulla',
    }).then((result) => {
      if (result.value) {
        this.doLoop = false
        axios.get("/api/game/sendClick/" + localStorage.roomId).then(response => {
          router.go()
        })
      }}).catch()
      return

    }else {
        next()
      }
  },
  components: {
    'modalGameEnd': ModalGameEnd,
    'headerV': Header,
    'userCard': UserCard,
    'chat': Chat
  },
  template: `
  <div id="game-body">

    <div class="game-table" :style="{ backgroundImage: 'url(' + table + ')' }">
    <userCard v-if="this.players.length==2" id="userIngameCardOpponent"  v-bind:user="this.players[this.players.findIndex(p=> p.user_name != this.username)]" :class="!(this.myTurn) ? 'myTurn-active' : 'myTurn-notActive'" ></userCard>
    <userCard v-if="this.players.length==1" id="userIngameCardIa"  v-bind:user="iaInfo[0]" :class="!(this.myTurn) ? 'myTurn-active' : 'myTurn-notActive' " ></userCard>

        <div class="player-2">
          <img class="player-2-1" :src="this.retroCard"></img>
          <img class="player-2-2" :src="this.retroCard"></img>
          <img class="player-2-3" :src="this.retroCard"></img>
        </div>

        <div id="leaveButtonDiv">
          <button class="leaveButton" @click="leave"><img id="leaveImg" src="/img/uscitaW.png" alt="Leave game"> </button>
        </div>



        <div id="deck-div">
          <div id="timer" v-if="this.timer > 0 && !this.gameEnded"  class ="timer"> <label> {{19-this.timer}} </label> </div>
          <div id="mazzo">
            <img v-if="deckVisible" class="deck" :src="this.retroCard"></img>
            <div v-if="this.deckSize > 0 " class ="deckSize"><label>{{this.deckSize}}/40</label></div>
          </div>
          <img v-if="briscola != 'null'" class="briscola" :src=" '/img/cards/'+ this.briscola.value + this.briscola.seed + '.png' "></img>
          <img v-if="cardSelected.value != 'null'" class="giocata1" :src=" '/img/cards/'+ this.cardSelected.value + this.cardSelected.seed + '.png' "></img>
          <img v-if="cardPlayer2.value != 'null'" class="giocata2" :src=" '/img/cards/'+ this.cardPlayer2.value + this.cardPlayer2.seed + '.png' "></img>
        </div>

        <div v-if="endTurn" class="EndTurn">
          <img v-if="winHand" class="EndTurnImg" src="/img/winHand.jpg"></img>
          <img v-if="!winHand" class="EndTurnImg" src="/img/loseImage.jpeg"></img>
        </div>


        <modalGameEnd v-if="showModalEnd" v-bind:roomId="localStorage.roomId" v-bind:username="localStorage.username" v-bind:showModalEnd="this.showModalEnd" v-bind:points="this.points_scored"></modalGameEnd>
        <userCard id="userIngameCardMe"  v-bind:user="this.players[this.players.findIndex(p=> p.user_name == this.username)]" :class="(this.myTurn) ? 'myTurn-active' : 'myTurn-notActive' " ></userCard>

        <div class="player-hand">
          <button :disabled="cardSelected.value!='null' || myTurn==false || this.cards_in_hand[0].value=='retro' " class="card1btn" v-on:click="play(1)" >
          <img class="card1img" :src=" this.cards_in_hand[0].value != 'retro' ? '/img/cards/'+ this.cards_in_hand[0].value + this.cards_in_hand[0].seed + '.png'  : this.retroCard"></button>

          <button :disabled="cardSelected.value!='null' || myTurn==false || this.cards_in_hand[1].value=='retro' " class="card2btn" v-on:click="play(2)">
          <img class="card2img" :src=" this.cards_in_hand[1].value != 'retro' ? '/img/cards/'+ this.cards_in_hand[1].value + this.cards_in_hand[1].seed + '.png'  : this.retroCard"></button>

          <button :disabled="cardSelected.value!='null' || myTurn==false || this.cards_in_hand[2].value=='retro' " class="card3btn" v-on:click="play(3)">
          <img class="card3img" :src=" this.cards_in_hand[2].value != 'retro' ? '/img/cards/'+ this.cards_in_hand[2].value + this.cards_in_hand[2].seed + '.png'  : this.retroCard"></button>
        </div>
        <chat class="chatGame"  v-if="(this.players.length==2)" v-bind:roomId="this.roomId" v-bind:icon="this.players[this.players.findIndex(p=> p.user_name == this.username)].user_img" v-bind:username ="this.username" v-bind:isGlobal="false" ></chat>
    </div>
  </div>
    `,
  watch: {
       'timer': function(){},
       'played': function(){
         if(this.played)
         {
           if(this.gameEnded)
             clearInterval(t2)
           this.timer = 0
           clearInterval(timerCount)
           tmpCnt=0
         }
       },
       'myTurn': function(){
         if(this.myTurn)
         {
           var t2 = setInterval(()=>{
             if(!this.played) {
               if(this.timer >= 18)
               //lancio timeout
               {
                 clearInterval(timerCount)
                 tmpCnt=0
                 this.timeoutTimer =0
                 selectedIndex = this.cards_in_hand.findIndex(card=> card.value != 'retro')
                 this.play(selectedIndex+1)
                 if(selectedIndex == -1)
                   clearInterval(t2)
               }
             }
           },1000)
           if(this.timer == 0)
           {
               timerCount = setInterval(() => {this.timer += 1},1000)
           }
         }
       }
   },
  mounted() {
    this.players.forEach((item, i) => {
      if(item.user_name == this.username)
      {
        this.table = item.user_table
        this.retroCard = item.user_cardBack
     }
    })
    this.getFirstHand()
    //parte ia
    if(this.iaInfo.length != 0 && !this.gameEnded){
      this.versusIa=true
      var iaInfo = this.iaInfo[0]
      this.initIa(iaInfo)
      this.playIa()
    }
    this.getCardsOnTableLoop()
  }
}
