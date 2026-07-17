import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AdminSecurity } from '@/pages/Admin/Security'
import { changePassword } from '@/services/articles'
import { clearAdminToken } from '@/services/request'
import { renderWithQueryClient } from '@/test/renderWithQueryClient'

vi.mock('@/services/articles', () => ({
  changePassword: vi.fn(),
}))

vi.mock('@/services/request', () => ({
  clearAdminToken: vi.fn(),
}))

const mockChangePassword = vi.mocked(changePassword)
const mockClearAdminToken = vi.mocked(clearAdminToken)

function renderSecurityPage() {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={['/admin/security']}>
      <Routes>
        <Route path="/admin/security" element={<AdminSecurity />} />
        <Route path="/admin/login" element={<p>登录页</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

function fillPasswords(confirmPassword: string) {
  fireEvent.change(screen.getByLabelText('当前密码'), { target: { value: 'current-password' } })
  fireEvent.change(screen.getByLabelText('新密码'), { target: { value: 'new-secure-password' } })
  fireEvent.change(screen.getByLabelText('确认新密码'), { target: { value: confirmPassword } })
}

describe('AdminSecurity', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('阻止两次输入不一致的新密码', async () => {
    renderSecurityPage()
    fillPasswords('different-password')

    fireEvent.click(screen.getByRole('button', { name: '更新密码并退出登录' }))

    expect(await screen.findByText('两次输入的新密码不一致')).toBeInTheDocument()
    expect(mockChangePassword).not.toHaveBeenCalled()
  })

  it('成功后清除令牌并跳转至登录页', async () => {
    mockChangePassword.mockResolvedValue(null)
    const { queryClient } = renderSecurityPage()
    queryClient.setQueryData(['admin', 'articles'], { items: [] })
    fillPasswords('new-secure-password')

    fireEvent.click(screen.getByRole('button', { name: '更新密码并退出登录' }))

    await waitFor(() =>
      expect(mockChangePassword).toHaveBeenCalledWith({
        currentPassword: 'current-password',
        newPassword: 'new-secure-password',
      }),
    )
    expect(mockClearAdminToken).toHaveBeenCalledOnce()
    expect(queryClient.getQueryData(['admin', 'articles'])).toBeUndefined()
    expect(await screen.findByText('登录页')).toBeInTheDocument()
  })

  it('展示接口返回的错误信息', async () => {
    mockChangePassword.mockRejectedValue(new Error('当前密码错误'))
    renderSecurityPage()
    fillPasswords('new-secure-password')

    fireEvent.click(screen.getByRole('button', { name: '更新密码并退出登录' }))

    expect(await screen.findByText('当前密码错误')).toBeInTheDocument()
  })
})
