const GlobalLeadBoard = {
  data: function() {
    return {
      usersInfo:[]
    }
  },
  template: `
	<div class="globalLeadContainer">
		<h2>Classifica Globale</h2>
			<div v-for="user in this.usersInfo" class="singleLeadContainer userCardBackground" :style="{ backgroundImage: 'url(' + user.user_background + ')' }" >
				<img :src="user.user_img" >
        <div id="lead-info">
  				<p>{{user.user_name}}</p>
  				<p>Lv:{{user.user_level}}</p>
        </div>
			</div>
		</div>
	`,
  methods: {},
  mounted(){
    axios.get("/api/user/getLead").then(res =>{res.data.forEach((item, i) => {this.usersInfo.push(item)})})
  }
}
