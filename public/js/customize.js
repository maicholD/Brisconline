const CustomItem = {
  props: ['img', 'selectedInfo'],
  data: function() {
    return {
        img : this.$props.img,
        lv :this.$props.selectedInfo.lv,
        userBackGroundSelected:this.$props.selectedInfo.background,
        userRetroSelected:this.$props.selectedInfo.retro,
        userTableSelected:this.$props.selectedInfo.table,
        userIconSelected:this.$props.selectedInfo.img,
        lvRequired: this.$props.img.split('/')[3].split('.')[0].slice(-1)*5
    }
  },
  template: `

  <div class="imgCustomizeContainer" v-bind:id="img"  :class="(img == userBackGroundSelected || img == userRetroSelected || img == userTableSelected || img == userIconSelected )  ? 'active-class-img' : 'inactive-class-img' ">
    <div class="imgCustomize" >
      <button :disabled="lv < lvRequired" v-on:click="select(img)" :style="(lv < lvRequired ? { opacity: '0.4' } :{ opacity: '1' }) ">
       <img :src="img" class="customImage" v-bind:id="img"  >
      </button>
      <div v-if="lv < lvRequired" class="after">È richiesto il livello {{lvRequired}}</div>
    </div>
  </div>`,
  mounted(){
  },
  methods:{
    select(img){
       switch(img.split('/')[2])
       {
         case "CardBackground":
         axios.post("/api/user/updateUserBackground",null,{params:{username: localStorage.username,newObj:img}}).then(data=>{
          this.userBackGroundSelected = img
          this.refreshSelected("UserBackground",img)
         })
         break;
         case "table":
         axios.post("/api/user/updateUserTable",null,{params:{username: localStorage.username,newObj:img}}).then(data=>{
           this.userTableSelected = img
           this.refreshSelected("Table",img)
        })
         break;
         case "retro":
         axios.post("/api/user/updateUserCardBack",null,{params:{username: localStorage.username,newObj:img}}).then(data=>{
          this.userRetroSelected = img
          this.refreshSelected("RetroCard",img)
        })
         break;
         case "icon":
         axios.post("/api/user/updateUserImg",null,{params:{username: localStorage.username,newObj:img}}).then(data=>{
          this.userIconSelected = img
          this.refreshSelected("Icon",img)
        })
         break;
       }
       this.$root.$emit('refresh', localStorage.username)
     },
     refreshSelected (elementId,img){
       var doc = document.getElementById(elementId)
       for (var i = 0; i < doc.childNodes.length; i++) {
          if (doc.childNodes[i].className == "imgCustomizeContainer active-class-img" && doc.childNodes[i].getAttribute('id') != img)
             doc.childNodes[i].className = "imgCustomizeContainer inactive-class-img"
          else if(doc.childNodes[i].getAttribute('id') == img)
            doc.childNodes[i].className = "imgCustomizeContainer active-class-img"
        }
     }
  }
}

const Customize = {
  props:['playersInfo'],
  data: function() {
    return {
       username : localStorage.username,
       playersInfo : this.$props.playersInfo,
       activeItem: 'home',
       imgUserBackList:[],
       imgTableList:[],
       imgBackgroundCardList:[],
       imgIconList:[],
       usersInfoSelected:''
    }
  },components: {
    'customItem': CustomItem
  },
  template: `
  <div id="custom">
    <div class="containerCustomize">
      <br>
      <ul class="nav nav-tabs nav-justified">
        <li class="nav-item">
          <a class="nav-link" @click.prevent="setActive('UserBackground')" :class="{ active: isActive('UserBackground') }"  href="#UserBackGround">Sfondo</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" @click.prevent="setActive('RetroCard')" :class="{ active: isActive('RetroCard') }" href="#RetroCard">Retro Carte</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" @click.prevent="setActive('Table')" :class="{ active: isActive('Table') }" href="#Table">Tavolo</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" @click.prevent="setActive('Icon')" :class="{ active: isActive('Icon') }" href="#Icon">Icona</a>
        </li>
      </ul>
      <div class="tab-content" id="myTabContent">
        <div class="tab-pane fade" :class="{ 'active show': isActive('RetroCard') }" id="RetroCard">
            <customItem v-for="img in imgBackgroundCardList"  v-bind:selectedInfo="usersInfoSelected"  v-bind:img='img'> </customItem>
        </div>
        <div class="tab-pane fade" :class="{ 'active show': isActive('UserBackground') }" id="UserBackground">
          <customItem v-for="img in imgUserBackList "    v-bind:selectedInfo="usersInfoSelected" v-bind:img='img'> </customItem>
        </div>
        <div class="tab-pane fade" :class="{ 'active show': isActive('Table') }" id="Table">
          <customItem v-for="img in imgTableList "   v-bind:selectedInfo="usersInfoSelected" v-bind:img='img'> </customItem>
        </div>
        <div class="tab-pane fade" :class="{ 'active show': isActive('Icon') }" id="Icon">
        <customItem v-for="img in imgIconList " v-bind:selectedInfo="usersInfoSelected"  v-bind:img='img' > </customItem>
        </div>
      </div>
    </div>
  </div>
  `,
//  class="description" :class="darkMode ? 'dark-theme' : 'light-theme'"
  methods: {
    isActive (menuItem) {
      return this.activeItem === menuItem
    },
    setActive (menuItem) {
      document.getElementById("RetroCard").style.display = "none";
      document.getElementById("UserBackground").style.display = "none";
      document.getElementById("Table").style.display = "none";
      document.getElementById("Icon").style.display = "none";
      document.getElementById(menuItem).style.display = "flex";
      this.activeItem = menuItem
    }
  },
  mounted(){
    this.setActive('UserBackground')
    var currentPlayerInfo =''
    currentPlayerInfo = this.playersInfo.find(player => player.user_name == localStorage.username)
    this.usersInfoSelected = {lv:currentPlayerInfo.user_level , background:currentPlayerInfo.user_background,retro :currentPlayerInfo.user_cardBack ,table : currentPlayerInfo.user_table ,img:currentPlayerInfo.user_img}
    var i =0
    for(i=0;i<7;i++)
    {
      this.imgUserBackList.push("/img/CardBackground/back"+i+".jpg")
      this.imgTableList.push("/img/table/table"+i+".jpg")
      this.imgBackgroundCardList.push("/img/retro/retro"+i+".jpg")
      this.imgIconList.push("/img/icon/icon"+i+".png")

    }
  }
}
