const RoomListTable = {
  data() {
    return {
      rowInfo: [],
      selecteRow: 0,
      username: localStorage.username,
      doLoop: true,
      lobbySel:""
    }
  },
  methods: {
    startRefresh: function() {
      var t = setInterval(() => {
        if (!this.doLoop)
          clearInterval(t)
        else
          this.getLobbies()
      }, 2000);
    },

    getLobbies() {
      axios.get("/api/room").then(response => {
        this.rowInfo = []
        response.data.forEach((item, i) => {
          var roomObj = {
            idRoom: item.room_id,
            playerId: item.user_id,
            playerCount: item.player_joined.length + "/" + item.player_count,
            passwordReq: item.pass_req,
            started: item.started
          };
          this.rowInfo.push(roomObj);
        });
      })
    },
    activate: function(trIndex) {
      var selectedRow = this.rowInfo[trIndex]
      var selectJoinedPlayer = selectedRow.playerCount.substring(0, 1)
      var selectMaxPlayer = selectedRow.playerCount.substring(3, 2)
      //se serve la pass allora la richiedo con il modal
      if (selectJoinedPlayer < selectMaxPlayer)
          this.$root.$emit('roomDClick',selectedRow)
    }
  },
  template: `
		<table class="rowHeader">
		  <tr>
		    <th>IdRoom</th>
		    <th>PlayerId</th>
		    <th>Player Count</th>
				<th>Password Req.</th>
		  </tr>

			<tr v-if="lobbySel.length==0" class="rowInfo" v-for="(item,index) in rowInfo"  v-on:dblclick="activate(index)">
      <td>{{ item.idRoom }}</td>
      <td>{{ item.playerId }}</td>
      <td>{{ item.playerCount }}</td>
      <td>{{ item.passwordReq }}</td>
      </tr>
      <tr v-if="lobbySel.length !=0" class="rowInfo" v-for="(item,index) in rowInfo.filter(room => room.idRoom == this.lobbySel)"  v-on:dblclick="activate(index)">
			 <td>{{ item.idRoom }}</td>
			 <td>{{ item.playerId }}</td>
			 <td>{{ item.playerCount }}</td>
			 <td>{{ item.passwordReq }}</td>
	 		</tr>
    `,
  mounted() {
    this.$root.$on('lobbySelected', data => {
    this.lobbySel = data
    })
    //carico  tutte le room
    this.getLobbies()
    this.startRefresh()


    this.$root.$on('addRoom', data => {
      this.doLoop = false
      //entro nella stanza
      router.replace({name: 'Lobby'})
    })
  }
}
