import Vue from 'vue'
import VueRouter from 'vue-router'
const NotFound = () => import('../components/NotFound.vue')
const Article = () => import('../views/Article.vue')
const ArticleList = () => import('../views/ArticleList.vue')

Vue.use(VueRouter)
const routes = [
  {
    path: '/',
    component: () => import('../views/Main.vue'),
    redirect: '/view'
  },
  {
    path: '/view',
    component: () => import('../views/Main.vue'),
    redirect: '/view/new',
    children: [
      {
        path: 'new',
        component: ArticleList
      },
      {
        path: 'new/:id',
        component: Article
      },
      {
        path: 'html',
        component: ArticleList
      },
      {
        path: 'html/:id',
        component: Article
      },
      {
        path: 'javascript',
        component: ArticleList
      },
      {
        path: 'javascript/:id',
        component: Article
      },
      {
        path: 'frame',
        component: ArticleList
      },
      {
        path: 'frame/:id',
        component: Article
      },
      {
        path: 'tool',
        component: ArticleList
      },
      {
        path: 'tool/:id',
        component: Article
      }
    ]
  },
  {
    path: '/add',
    component: () => import('../views/Editor.vue')
  },
  {
    path: '/edit/:id',
    component: () => import('../views/Editor.vue')
  },
  {
    path: '*',
    component: NotFound
  }
]

export default new VueRouter({
  mode: 'history',
  routes: routes
})
