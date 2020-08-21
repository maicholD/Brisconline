const ModalGameConfig = {
  props: ['createRoom', 'authError'],
  methods: {
    passMatch() {
      this.$root.$emit('passwordTent', {needed:false,password:this.passInser});
    },
    close() {
      this.$root.$emit('close');
    },
    insert() {
      var passReq = "no"
      if (this.password.length > 0)
        passReq = "si"

      axios.post("/api/room", null, {
        params: {
          password: this.password,
          playerCount: this.playerCount,
          passReq: passReq,
          iaDifficult:this.iaDifficult
        }
      }).then(response => {

        localStorage.roomId = response.data.room_id
        localStorage.playerCount = "1/" + response.data.player_count
        localStorage.roomLead = response.data.user_id
        localStorage.iaDifficult = response.data.iaDifficult

        //comunico alla grid di aggiungere la room
        this.$root.$emit('close');
        this.$root.$emit('addRoom');
      })
    }
  },
  data: function() {
    return {
      playerCount: "2",
      password: '',
      roomCreate: this.$props.createRoom,
      passInser: '',
      authError: this.$props.authError,
      iaDifficult:"facile"
    }
  },
  template: `
  <transition name="modal-fade">
	   <div class="modal-mask">
	       <div class="modal-wrapper">
	           <div class="modal-container"">

                <div class="modal-header">
                  <slot v-if="roomCreate" name="header">Crea una nuova stanza</slot>
    							<slot v-if="!roomCreate" name="header">Inserire password</slot>
                </div>

	              <div v-if="roomCreate"class="modal-body">
	                 <slot name="body">
											<label for="playerNumb" id="form-title">Seleziona il numero di giocatori</label>

                      <input type="radio" id="2" name="2" value="2"  v-model="playerCount">
                      <label for="2"> 1vs1 </label>

                      <input type="radio" id="4" name="4" value="4"  v-model="playerCount" disabled>
                      <label for="4"> 2vs2 (coming soon)</label>

                      <input type="radio" id="ia" name="ia" value="1" v-model="playerCount">
                      <label for="ia"> vsIA </label>
                      <form>
                        <div id="ia-div" v-if="playerCount=='1'" >
                          <label>Seleziona la difficoltà</label>
                          <input type="radio" name="facile" value="facile"  v-model="iaDifficult">facile<br>
                          <input type="radio" name="difficile" value="difficile"  v-model="iaDifficult">difficile<br>
                          <input type="radio" name="god" value="god" v-model="iaDifficult">Difficile e anche stronzo<br>
                        </div>
                      </form>
										  <label for="pwd">Password:</label><br>
										  <input type="password" input v-model="password" id="pwd" name="pwd"><br><br>
	                  </slot>
	              </div>

								<div v-if="!roomCreate"class="modal-body">
	                <slot name="body" class="pu-list">
										<label for="pwd">Password:</label><br>
										<input type="password" input v-model="passInser" id="pwd" name="pwd"><br><br>
										<span v-if="authError" class="errorMessage"> Password errata </span>
	                </slot>
	              </div>

	              <div class="modal-footer">
	                <slot name="footer">
	                  <button v-if="createRoom" class="modal-default-button" @click="insert">Conferma</button>
										<button v-if="!createRoom" class="modal-default-button" @click="passMatch">Conferma</button>
										<button class="modal-default-button" @click="close">Annulla</button>
	                </slot>
	              </div>
	            </div>
	          </div>
	        </div>
					</transition>
					`
}
