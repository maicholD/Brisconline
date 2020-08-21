const UserCard = {
  props: ['user','isProfile'],
  data() {
    return {
      username: this.$props.user.user_name,
      points: this.$props.user.user_points,
      totalPoints: this.$props.user.user_points_total,
      level: this.$props.user.user_level,
      imgUrl: this.$props.user.user_img,
      cardBackground:this.$props.user.user_background,
      isProfile : this.$props.isProfile,
      totalPointsForLevel : this.$props.user.user_points_total,
      userPoint : this.$props.user.user_points,
      userWin : this.$props.user.user_win,
      userLose : this.$props.user.user_lose,
      userPlayed : this.$props.user.user_played,
      mail: this.$props.user.user_mail
    }
  },
  components: {},
  template: `
  <div class="userCard userCardBackground" :style="{ backgroundImage: 'url(' + cardBackground + ')' }">
      <div class="userCardImg" ><img :src="this.imgUrl" class="card-img" ></div>
			<div class="userCardInfo">
				<label class="userCardUsername" >{{ this.username }}</label>
				<label class="userCardLevel"> level: {{ this.level }}</label>
        <div v-if="isProfile == true" class="profileUserCard">
          <label class="userCardMail"> Mail : {{this.mail}}</label>
          <label class="userCardPoints"> Points: {{this.userPoint}} / {{this.totalPointsForLevel}}</label>
          <label class="userCardWin"> Total Win: {{this.userWin}}</label>
          <label class="userCardLose"> Total Lose: {{this.userLose}}</label>
          <label class="userCardPlayed"> Total played: {{this.userPlayed}}</label>
        </div>
			</div>
</div>`,
  mounted() {
    this.$root.$on('refresh',username =>{
      if(this.username == username)
      {
        axios.get("/api/user/refreshUserInfo/"+username).then(data=>{
          this.imgUrl = data.data.user_img
          this.cardBackground = data.data.user_background
        })
      }
    })
  }
}
