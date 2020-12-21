import Vue from 'vue'
import VueRouter from 'vue-router'
const NotFound = () => import('../components/NotFound.vue')
const Main = () => import('../views/Main.vue')
const Editor = () => import('../views/Editor.vue')
const Article = () => import('../views/Article.vue')
const ArticleList = () => import('../views/ArticleList.vue')

Vue.use(VueRouter)
const routes = [
  {
    path: '/',
    component: Main,
    redirect: '/view'
  },
  {
    path: '/view',
    component: Main,
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
    component: () => Editor
  },
  {
    path: '/edit/:id',
    component: () => Editor
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
