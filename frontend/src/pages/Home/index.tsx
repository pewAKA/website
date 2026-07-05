import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd'
import chunk from 'lodash/chunk'
import heroImage from '@/assets/hero.png'
import './index.scss'

const { Title, Paragraph, Text } = Typography

const focusItems = [
  {
    title: '项目作品',
    description: '沉淀可展示的产品、工具与实验项目，让每一次迭代都有清晰记录。',
  },
  {
    title: '技术文章',
    description: '整理 React、TypeScript、工程化与三维交互相关的实践笔记。',
  },
  {
    title: '关于我',
    description: '保留一块安静空间，介绍经历、技能栈、联系方式与当前关注方向。',
  },
  {
    title: '后续扩展',
    description: '预留 3D 场景、后端接口、内容管理与多页面导航的演进位置。',
  },
]

const groupedFocusItems = chunk(focusItems, 2)

function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__mark" aria-hidden="true">
          <img src={heroImage} alt="" />
        </div>
        <Text className="home-hero__eyebrow">Personal Website Starter</Text>
        <Title>个人网站</Title>
        <Paragraph>
          一个从零开始的前端基座，先把路由、请求、样式规范与组件体系铺好，再逐步长成完整的作品展示空间。
        </Paragraph>
        <Space className="home-hero__actions" wrap>
          <Button type="primary" size="large" href="#works">
            查看规划
          </Button>
          <Button size="large" href="#stack">
            技术栈
          </Button>
        </Space>
        <div className="home-hero__tags" id="stack">
          {['React', 'TypeScript', 'Vite', 'Sass', 'Ant Design', 'Axios', 'R3F'].map((item) => (
            <Tag key={item}>{item}</Tag>
          ))}
        </div>
      </section>

      <section className="home-section" id="works">
        <div className="home-section__heading">
          <Text>Next Milestones</Text>
          <Title level={2}>下一步可以展开的内容</Title>
        </div>
        <div className="home-section__grid">
          {groupedFocusItems.map((group, groupIndex) => (
            <Row key={groupIndex} gutter={[16, 16]}>
              {group.map((item) => (
                <Col key={item.title} xs={24} md={12}>
                  <Card className="home-card" bordered>
                    <Title level={3}>{item.title}</Title>
                    <Paragraph>{item.description}</Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
