import { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { useNavigate } from 'react-router'
import { changePassword, type ChangePasswordPayload } from '@/services/articles'
import { clearAdminToken } from '@/services/request'
import './index.scss'

type PasswordFormValues = ChangePasswordPayload & {
  confirmPassword: string
}

export function AdminSecurity() {
  const [form] = Form.useForm<PasswordFormValues>()
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function submit(values: PasswordFormValues) {
    setSubmitting(true)
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      clearAdminToken()
      navigate('/admin/login', { replace: true, state: { passwordChanged: true } })
    } catch (error) {
      message.error(error instanceof Error ? error.message : '密码未能更新，请稍后重试。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-page admin-security">
      <header className="admin-page__heading">
        <div>
          <p>Account security</p>
          <h1>安全设置</h1>
          <span>用新密码保护后台访问权限。</span>
        </div>
      </header>
      <section className="admin-security__card">
        <div className="admin-security__notice">
          <strong>修改后，所有设备需重新登录。</strong>
          <span>当前会话和其他已登录设备会立即失效。</span>
        </div>
        <Form<PasswordFormValues>
          form={form}
          layout="vertical"
          onFinish={(values) => void submit(values)}
          requiredMark={false}
        >
          <Form.Item
            label="当前密码"
            name="currentPassword"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 12, max: 72, message: '新密码长度需为 12 到 72 位' },
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            dependencies={['newPassword']}
            label="确认新密码"
            name="confirmPassword"
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value: string) {
                  return !value || getFieldValue('newPassword') === value
                    ? Promise.resolve()
                    : Promise.reject(new Error('两次输入的新密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Button htmlType="submit" loading={submitting} type="primary">
            更新密码并退出登录
          </Button>
        </Form>
      </section>
    </section>
  )
}
