const Login = {
  data: function() {
    return {
      authError: false,
      mail: "a@a",
      pass: "a",
    }
  },
  template: `
	<div class="auth-body">
		<div class="container-form">
		  <div>
		    <fieldset class="login-fieldset">
		      <legend> Accedi </legend>
		      <input type="email" name="email" v-model="mail" placeholder="Email" required autofocus>
		      <input type="password" name="password" v-model="pass" placeholder="Password" required>
					<span v-if="authError" class="errorMessage"> Indirizzo e-mail o password non corretti </span>
		      <button class="authButton" v-on:click="checkUser">Login </button>
		    </fieldset>
		  </div>
		  <p> Non sei iscritto? <router-link to="/registration"> Registrati!</router-link> </p>
		</div>
	</div>
	`,
  methods: {
    checkUser: function() {
      var cryptPass = CryptoJS.SHA256(this.pass).toString(CryptoJS.enc.Hex);
      axios.post("/api/login", null, {
        params: {
          mail: this.mail,
          pass: cryptPass
        }
      }).then(response => {
        if (response.status != 210) {
          localStorage.username = response.data
          router.push({
            name: 'Home',
            params: {user_name: response.data}
          })
        }
        else
          this.authError = true

      })
    }
  }

}
