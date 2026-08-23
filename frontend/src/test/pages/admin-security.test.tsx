import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AdminSecurity } from '@/features/Admin/Security'
import { changePassword } from '@/services/auth'
import { renderWithQueryClient } from '@/test/renderWithQueryClient'

vi.mock('@/services/auth', () => ({
  changePassword: vi.fn(),
}))

const mockChangePassword = vi.mocked(changePassword)
const replace = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

function renderSecurityPage() {
  return renderWithQueryClient(
    <AdminSecurity />,
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

  it('成功后清除查询缓存并跳转至登录页', async () => {
    mockChangePassword.mockResolvedValue(undefined)
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
    expect(queryClient.getQueryData(['admin', 'articles'])).toBeUndefined()
    expect(replace).toHaveBeenCalledWith('/admin/login?passwordChanged=1')
  })

  it('展示接口返回的错误信息', async () => {
    mockChangePassword.mockRejectedValue(new Error('当前密码错误'))
    renderSecurityPage()
    fillPasswords('new-secure-password')

    fireEvent.click(screen.getByRole('button', { name: '更新密码并退出登录' }))

    expect(await screen.findByText('当前密码错误')).toBeInTheDocument()
  })
})
