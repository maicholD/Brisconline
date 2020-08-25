const Home = {
  data() {
    return {
      showModal: false,
      createRoom: true,
      authError: false,
      username: localStorage.username,
      info: '',
      lobbySelected: "",
      userInfo : []
    }
  },
  components: {
    'roomList': RoomListTable,
    'modalGameConfig': ModalGameConfig,
    'globalChat': Chat,
    'globalLead': GlobalLeadBoard,
    'headerV': Header
  },
  template: `
  <div id="home-body">
      <headerV v-bind:userInfo="this.userInfo"> </headerV>
  		<div class="homeContainer">
  			<modalGameConfig v-if="showModal" v-bind:createRoom="this.createRoom" v-bind:authError="this.authError"></ModalGameConfig>
        <div id="main-column">
          <button id="btnAdd" v-on:click=onClickAddRoom() > Crea una nuova lobby </button>
          <input type="text" id="lobbyFilter" v-model="lobbySelected" placeholder="Ricerca stanza tramite IdRoom"> </input>
            <div id="room-list-div">
      			   <roomList id="room-list"></roomList>
            </div>
        </div>
        <div id="side-column">
          <globalLead></globalLead>
          <div id="chat-box-home">
            <globalChat v-bind:username ="this.username" v-bind:isGlobal="true" ></globalChat>
          </div>
        </div>
  	  </div>
    </div>
	`,
  watch: {'lobbySelected': function(){this.$root.$emit('lobbySelected',this.lobbySelected)}},
  methods:{
    onClickAddRoom() {
      this.showModal = true;
      this.createRoom = true;
    }
  },
  mounted() {
    axios.get("/api/user/userInfo/" + localStorage.username).then(response => {this.userInfo = response.data.playersInfo})

    this.$root.$on('roomDClick', data => {
        this.infoRoom = data.idRoom
      if(data.passwordReq != "si")
        this.$root.$emit('passwordTent', {needed:false,password:""})
      else {
        this.showModal = true;
        this.createRoom = false;
      }
    })
    this.$root.$on('close', data => {
      this.showModal = false;
    })
    this.$root.$on('passwordTent', passInsert => {
      //controllo che le info inserite siano corrette
      axios.post("/api/room/matchPass", null, {
        params: {
          idRoom: this.infoRoom,
          passIns: passInsert.password
        }
      }).then(response => {
        //se la password e' quella corretta, puo' entrare
        //l'evento on è catturato dalla chat per fermare il refresh
        this.$root.$emit('joinLobby',true)

       if (response.data != null) {
          this.showModal = false;
          this.authError = false;

          var selectJoinedPlayer = response.data.player_joined.length
          var selectMaxPlayer = response.data.player_count
          var playerJoin = selectJoinedPlayer + 1 + "/" + selectMaxPlayer

          axios.post("/api/lobby/join", null, {
            params: {
              idRoom: response.data.room_id,
              username: this.username,
              playerCount: response.data.player_count
            }
          }).then()

            this.doLoop = false
            localStorage.roomId = response.data.room_id
            localStorage.playerCount = playerJoin
            localStorage.roomLead = response.data.user_id,
            localStorage.iaDifficult = response.data.iaDifficult
            router.replace({
              name: 'Lobby'
            })
        } else
          //password errata
          this.authError = true;
      })
    })
  }
}
