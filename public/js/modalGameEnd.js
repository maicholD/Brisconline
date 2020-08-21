const ModalGameEnd = {
  props: ['points', 'showModalEnd', 'roomId','username'],
  methods: {
    close() {
      this.showModalEnd == false
      axios.get("/api/game/sendClick/" + localStorage.roomId).then(response => {
        router.replace({
        name: 'Home',
        params: {user_name: this.username}
      }, () => router.go())
    })
    }
  },
  data: function() {
    return {
      username : this.$props.username,
      points: this.$props.points,
      maxPoints:0,
      userPoint:0,
      userLevel:0,
      ia:false,
      expShow:false,
      gameWon: "Hai perso!",
      expPercentage: 0
    }
  },mounted(){
      var pointsGained = this.points.find(points => points.username == this.username)
      axios.post("/api/user/refreshUserLevel",null,{params:{username: this.username, points:pointsGained.points}}).
      then(response=>{
        this.maxPoints = parseInt(response.data.user_points_total)
        this.userLevel = response.data.user_level
        this.userPoint = parseInt(response.data.user_points)
        this.expPercentage = (this.userPoint/this.maxPoints) * 100
        console.log(this.expPercentage)
        /*var elem = document.getElementById("myBar");
        elem.width = this.expPercentage + '%';*/
      })
      if (this.points > 60)
        this.gameWon = "Hai Vinto!"
  },
  template: `
  <transition name="modal-fade">
    	<div class="modal-mask">
      	     <div class="modal-wrapper">
      	         <div class="modal-container"">
      	              <div class="modal-header"><slot  name="header">Punteggio Stanza</slot>
      	              </div>
      								<div class="modal-body">
      	                <slot name="body">
                        <label id="result"> {{gameWon}} </label>
                          <div v-for="(player, index)  in this.points">
          										<label >Player: </label>
          										<label >{{player.username}}</label> <br>
                              <label >Points: </label>
                              <label >{{player.points}}</label> <br>
                              <div v-if="(player.username === username)" id="player-stats">
                                <label>Level:</label>
                                <label>{{userLevel}}</label>
                                <div class="w3-light-grey w3-round-large">
                                  <div id="myBar" class="w3-container w3-khaki w3-round-large" :style="{width:expPercentage+'%'}">{{userPoint}}/{{maxPoints}}</div>
                                </div>
                              </div>

                            </div>
      	                </slot>
      	              </div>
      	              <div class="modal-footer">
      	                <slot name="footer"><button  class="modal-default-button" @click="close()">Chiudi</button></slot>
                      </div>
      	        </div>
      	    </div>
      	</div>
		</transition>
  `
}
