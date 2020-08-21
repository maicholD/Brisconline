const router = new VueRouter({
  mode: 'history',
  routes: [{
      path: '/',
      meta: {
        noPath: true
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        requiresNoAuth: true
      }
    },
    {
      path: '/home',
      name: 'Home',
      props: true,
      component: Home,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/registration',
      name: 'Registration',
      component: Registration,
      meta: {
        requiresNoAuth: true
      }
    },
    {
      path: '/lobby',
      name: 'Lobby',
      component: LobbyComp,
      props: true,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/game',
      name: 'Game',
      component: Game,
      props: true,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/profile',
      name: 'Profile',
      props:true,
      component: Profile,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/404',
      component: NotFound
    },
    {
      path: '*',
      redirect: '/404'
    }
  ]
})
//guarda le rotte, cerca i meta e se matchano controlla l'id nella session con l'api
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    axios({
      method: "GET",
      "url": "/session/id",
      withCredentials: true
    }).then(result => {
      if (result.data == "") {
        next({
          path: '/login',
          query: {
            redirect: to.fullPath
          }
        })
      } else {
        next()
      }
    })
  } else if (to.matched.some(record => record.meta.requiresNoAuth)) {
    axios({
      method: "GET",
      "url": "/session/id",
      withCredentials: true
    }).then(result => {
      if (result.data !== "") {
        next({
          path: '/home',
          query: {
            redirect: to.fullPath
          }
        })
      } else {
        next()
      }
    })
  } else if (to.matched.some(record => record.meta.noPath)) {
    axios({
      method: "GET",
      "url": "/session/id",
      withCredentials: true
    }).then(result => {
      if (result.data == "") {
        next({
          path: '/login',
          query: {
            redirect: to.fullPath
          }
        })
      } else {
        next({
          path: '/home',
          query: {
            redirect: to.fullPath
          }
        })
      }
    })
  } else {
    next()
  }
})
