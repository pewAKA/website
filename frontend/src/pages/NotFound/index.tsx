import { Button, Result } from 'antd'
import { Link } from 'react-router'
import './index.scss'

function NotFound() {
  return (
    <div className="not-found-page">
      <Result
        status="404"
        title="页面不存在"
        subTitle="当前地址没有匹配到页面，请返回首页继续浏览。"
        extra={
          <Link to="/">
            <Button type="primary">返回首页</Button>
          </Link>
        }
      />
    </div>
  )
}

export default NotFound
