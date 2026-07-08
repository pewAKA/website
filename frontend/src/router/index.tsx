import { createBrowserRouter } from 'react-router'
import App from '@/App'
import About from '@/pages/About'
import Articles from '@/pages/Articles'
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
])
