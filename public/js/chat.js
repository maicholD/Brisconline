const Message = {
  props: ['info','myUsername'],
  data() {
    return {
      iconImg : this.$props.info.userIcon,
      message: this.$props.info.message,
      username : this.$props.info.username,
      myMessage : localStorage.username === this.$props.info.username
    }
  },
    template: `
    <div class="chatMessage" v-bind:class="{ myChatMessage: this.myMessage }">
			<div class="msgContainer">
			  <img :src="this.iconImg" >
        <h1>{{username}}</h1>
			  <p>{{message}}</p>
			</div>
  	</div>`,
    mounted(){
    }
}

const Chat = {
  props: ['username','isGlobal','roomId','icon'],
  data() {
    return {
      msgDb : [],
      username:this.$props.username,
      isGlobal:this.$props.isGlobal,
      roomId:this.$props.roomId,
      icon:this.$props.icon,
      autoScroll: true
    }
  },
  components: {
    'message': Message
  },
  template: `
  <div >
      <div class="Chat">
        <message v-for="message in this.msgDb" v-bind:info="message"></message>
      </div>
      <div class="textarea-container">
          <input type="text" id="textInsert"></input>
          <button v-on:click=sendMessage() >Invia</button>
      </div>
  </div>

  `,
  methods: {
    sendMessage(){
      var message = document.getElementById('textInsert').value
        if(message != '')
        {
          if(this.isGlobal)
            axios.post("/api/user/sendGlobalMsg",null,{params:{username:this.username,message:message}}).then(res=>{
              this.autoScroll = true
            })
          else
            axios.post("/api/game/sendMsg",null,{params:{roomId:this.roomId,username:this.username,message:message,icon:this.icon}}).then(res=>{
              this.autoScroll = true
            })
          document.getElementById('textInsert').value = ""
      }
    },
    chatScroll() {
      this.autoScroll = false;
    }
  },
  mounted(){
    document.getElementsByClassName("Chat")[0].addEventListener('scroll', this.chatScroll)
    var t= setInterval(()=> {
      if(this.isGlobal)
        axios.get("/api/user/getGlobalMsg").then(result =>{
          this.msgDb = result.data
          if(this.autoScroll){
            var objDiv = document.getElementsByClassName("Chat")[0];
            objDiv.scrollTop = objDiv.scrollHeight
            this.autoScroll = true
          }
        })

      else
        axios.get("/api/game/getMsgGame/"+this.roomId).then(result =>{this.msgDb = result.data })

      },500)

      this.$root.$on('addRoom',data=>{clearInterval(t)})
      this.$root.$on('joinLobby',data=>{clearInterval(t)})
      this.$root.$on('endGame',data=>{clearInterval(t)})

  }

}
