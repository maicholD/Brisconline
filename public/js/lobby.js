const LobbyComp = {
  data() {
    return {
      roomId: localStorage.roomId,
      roomLead: localStorage.roomLead,
      playerJoined: localStorage.playerCount.substring(0, 1),
      playerMaxCount: localStorage.playerCount.substring(3,2),
      playerUser_id: localStorage.username,
      userInfo: [],
      doLoop: true,
      ialevel: localStorage.iaDifficult,
      iaInfo:[],
      canExit: false
    }
  },
  methods: {
    startRefresh: function() {
      var t = setInterval(() => {
        if (!this.doLoop) {
          clearInterval(t)
        } else {
          this.getLobbyInfo()
        }
      }, 1000);
    },
    //aggiorno info lobby create
    getLobbyInfo() {
      axios.get("/api/lobby/info/" + localStorage.roomId).then(response => {
        if(response.status == 204) {
          this.doLoop = false
          this.canExit = true
          Swal.fire({
            icon: 'warning',
            html:
              'La lobby è stata chiusa',
            showCancelButton: false,
            focusConfirm: false,
            confirmButtonText:'OK'}).then(response => {
            router.replace({
              name: 'Home'
            }, () => router.go())
          })
        } else {
          var players = this.userInfo.length
          this.userInfo = []
          response.data.playersInfo.forEach((item, i) => {
            this.userInfo.push(item)
            this.playerJoined = players
            localStorage.playerCount = players+"/"+this.playerMaxCount
            if (response.data.started)
              this.pushToGame()
          })
        }
      })
    },
    start() {
      //this.canExit = true
      axios.post("/api/game/initGame", null, {
        params: {roomId: localStorage.roomId,players: this.userInfo}})
        .then(response => {this.pushToGame()})
    },
    pushToGame(){
      this.doLoop = false
      this.canExit = true
      //se la lobby e' stata creata, faccio partire
      router.replace({
        name: "Game",
        params: {players: this.userInfo,ia:this.iaInfo}
      })
    },
    backPressure() {
      Swal.fire({
        icon: 'question',
        html:
          'Vuoi davvero uscire dalla lobby?',
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText:
          'Esci',
        cancelButtonText:
          'Annulla',
      }).then((result) => {
        if (result.value) {
          if (localStorage.username == localStorage.roomLead) {
            axios.get("/api/lobby/close/" + localStorage.roomId).then(response => {})
          } else {
            axios.post("/api/lobby/leave", null, {
              params: {
                lobbyId: localStorage.roomId,
                leavingPlayer: localStorage.username,
                playerJoined: localStorage.roomLead
              }
            }).then(response => {})
          }
          this.canExit = true
          router.go()
        }
    })
  },
  leave() {
    router.go(-1)
  }
},
  beforeRouteLeave(to, from, next) {
   if(!this.canExit) {
     this.backPressure();
     return;
   }
   else {
       next()
     }
 },
  components: {
    'userCard': UserCard,
    'customize': Customize
  },
  template: `
  <div id="lobby-body">
    <div class="container-users">
      <button class="leaveButton" @click="leave"><img id="leaveImg" src="/img/uscitaW.png" alt="Leave game"> </button>
      <div id="roomInfoDiv">
        <p> Stanza n.{{localStorage.roomId}}</p>
        <p> Player {{this.playerJoined}}/{{this.playerMaxCount}} </p>
      </div>
      <userCard v-for="player in this.userInfo" v-bind:user="player" v-bind:key="player.user_name" ></userCard>
      <userCard v-if="playerMaxCount==1" v-for="info in this.iaInfo" v-bind:user="info" ></userCard>
      <button v-if="localStorage.username == localStorage.roomLead" :disabled="this.playerJoined != this.playerMaxCount " class="modal-default-button startGamebtn" @click="start">Inizia</button>

    </div>
    <div class="container-skin">
      <customize v-if="this.userInfo.length >0" v-bind:playersInfo="this.userInfo " ></customize>
    </div>
  </div>
  `,
  mounted() {
    if(this.playerMaxCount == '1'){
      switch (this.ialevel) {
        case "facile":
          this.iaInfo.push({user_name:'noob',user_points:20,user_points_total:20,user_level:10,user_img:'/img/noob.png',user_background:'/img/CardBackground/back1.jpg'})
          break;
        case "difficile":
          this.iaInfo.push({user_name:'pro',user_points:100,user_points_total:100,user_level:50,user_img:'/img/mid.png',user_background:'/img/CardBackground/back5.jpg'})
          break;
        case "god":
          this.iaInfo.push({user_name:'god',user_points:500,user_points_total:200,user_level:100,user_img:'/img/pro.png',user_background:'/img/CardBackground/back6.jpg'})
          break;
        default:
        break;
      }
    }
    this.getLobbyInfo()
    this.startRefresh()
  }

}
