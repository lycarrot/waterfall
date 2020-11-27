import Vue from 'vue'
import Router from 'vue-router'
import Exmaple from '@/view/exmaple'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Exmaple',
      component: Exmaple
    }
  ]
})
