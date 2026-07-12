import { createBrowserRouter } from 'react-router'
import App from '@/App'
import About from '@/pages/About'
import {
  AdminArticleEditor,
  AdminArticles,
  AdminLayout,
  AdminLogin,
  AdminTaxonomy,
} from '@/pages/Admin'
import { AdminSecurity } from '@/pages/Admin/Security'
import Articles from '@/pages/Articles'
import ArticleDetail from '@/pages/ArticleDetail'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import Roadmap from '@/pages/Roadmap'
import Works from '@/pages/Works'
import TestPage from '@/pages/Test'

// 主导航页面保持显式声明，方便后续接入权限、数据预取或页面级布局。
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'works',
        element: <Works />,
      },
      {
        path: 'articles',
        element: <Articles />,
      },
      {
        path: 'articles/:slug',
        element: <ArticleDetail />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'roadmap',
        element: <Roadmap />,
      },
      {
        path: 'test',
        element: <TestPage />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminArticles />,
      },
      {
        path: 'articles',
        element: <AdminArticles />,
      },
      {
        path: 'articles/new',
        element: <AdminArticleEditor />,
      },
      {
        path: 'articles/:id',
        element: <AdminArticleEditor />,
      },
      {
        path: 'taxonomy',
        element: <AdminTaxonomy />,
      },
      {
        path: 'security',
        element: <AdminSecurity />,
      },
    ],
  },
])
