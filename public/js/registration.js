const Registration = {
  data: function() {
    return {
      authError: false,
      mail: "",
      pass: "",
      passConf: "",
      username: ""
    }
  },
  template: `
	<div class="auth-body">
	  <div class="container-form">
	  <div>
	    <fieldset class="login-fieldset">
	      <legend> Registrati: </legend>
	      <input placeholder="Username" v-model="username" type="text" maxLength="8" required name="name">

	      <input placeholder="Email" v-model="mail" type="email" name="email" required>

	      <input placeholder="Password" v-model="pass" type="password" name="password" required>

	      <input placeholder="Conferma password" v-model="passConf" type="password" name="passwordRe" required>

				<label class="errorMessage" v-if="passConf!=pass">le password non corrispondono</label>

				<label class="errorMessage" v-if="authError">Email o Username già esistenti</label>

	      <button class="authButton" :disabled="passConf!=pass" v-on:click="submit"> Registrati </button>

	    </fieldset>
	  </div>
	  </div>
	</div>
	`,
  methods: {
    submit: function() {
      var cryptPass = CryptoJS.SHA256(this.pass).toString(CryptoJS.enc.Hex);
      axios.post("/api/register", null, {
        params: {
          mail: this.mail,
          username: this.username,
          pass: cryptPass
        }
      }).then(response => {
        if (response.status == 210) {
          this.authError = true
        } else {
          localStorage.username = this.username
          router.logged = true
          router.push({
            path: 'home'
          })
        }

      })
    }

  }
}
