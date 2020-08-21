const Profile = {
props:['userInfo'],
data(){
  return {
    userInfo :this.$props.userInfo ,
    playerUser_id : localStorage.username,
    isProfile: true
  }
},
  methods : {
    logout(){
      axios.get("/api/session/logout").then(response => {
        router.push({ name: 'Login'})
      })
    },
    leave() {
      router.go(-1)
    }
  },
  components: {
    'customize': Customize,
    'userCard' : UserCard
  },
  template: `
  <div id="profile-body">
    <div class="container-info">
      <userCard v-for="player in this.userInfo" v-bind:user="player" v-bind:isProfile ="isProfile" v-bind:key="player.user_name" ></userCard>
      <button class="leaveButton" @click="leave"><img id="leaveImg" src="/img/uscitaW.png" alt="Leave game"> </button>
      <button class="logout" @click="logout">Logout</button>
    </div>
    <div class="container-skin">
      <customize  v-if="this.userInfo.length >0" v-bind:playersInfo="this.userInfo " ></customize>
    </div>
  </div>
  `,
  mounted() {
      this.$root.$emit('joinLobby',"dw")

      axios.get("/api/user/userInfo/" + localStorage.username).then(response => {this.userInfo = response.data.playersInfo})
  }

}
