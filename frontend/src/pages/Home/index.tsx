import { Link } from 'react-router'
import { getAsset } from '@/three/assets/catalog'
import './index.scss'

const stackTags = ['React', 'TypeScript', 'Vite', 'Sass', 'Ant Design', 'Axios', 'R3F']

const hubLinks = [
  {
    title: '项目作品',
    path: '/works',
    label: 'Works',
    description: '展示项目、工具和交互实验。',
  },
  {
    title: '技术文章',
    path: '/articles',
    label: 'Notes',
    description: '沉淀工程实践与技术观察。',
  },
  {
    title: '关于我',
    path: '/about',
    label: 'Profile',
    description: '放置经历、能力和联系方式。',
  },
  {
    title: '后续扩展',
    path: '/roadmap',
    label: 'Roadmap',
    description: '记录内容系统的下一步计划。',
  },
]

function Home() {
  const heroImage = getAsset('home.hero').url

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__content">
          <span className="home-hero__eyebrow">Personal knowledge hub</span>
          <h1>Lynco Hub</h1>
          <p>一个安静但可扩展的个人内容中枢，用来整理项目作品、技术文章、个人信息和后续构想。</p>

          <div className="home-hero__actions">
            <Link className="home-action home-action--primary" to="/works">
              查看项目作品
            </Link>
            <Link className="home-action" to="/articles">
              阅读技术文章
            </Link>
          </div>

          <div className="home-hero__tags" aria-label="当前技术栈">
            {stackTags.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="home-hero__visual" aria-hidden="true">
          <div className="home-hero__visual-frame">
            <img src={heroImage} alt="" />
            <span>Layered hub</span>
          </div>
        </div>
      </section>

      <section className="home-directory">
        <div className="home-directory__heading">
          <span>Hub map</span>
          <h2>内容入口</h2>
        </div>

        <div className="home-directory__grid">
          {hubLinks.map((item) => (
            <Link className="home-directory-card" key={item.path} to={item.path}>
              <small>{item.label}</small>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
