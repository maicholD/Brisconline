const Header = {
  props:['userInfo'],
  data() {
    return {
      userInfo : this.$props.userInfo
    }},
  template: `
  <div id="home-header">
     <img src="/img/brisconlineLogo.png" alt="Logo">
     <img src="/img/profileIcon.png" alt="profilo" v-on:click="pushToProfile()">
  </div>
  `,
  methods: {
    pushToProfile() {
      router.push({name: 'Profile',  params:{userInfo: this.userInfo}})
    }
  }
}
