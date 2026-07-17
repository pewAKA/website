import { useEffect, useState, type ChangeEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Form, Input, InputNumber, Select, Switch, message } from 'antd'
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router'
import {
  type Article,
  type ArticleCategory,
  type ArticlePayload,
  type ArticleTag,
} from '@/services/articles'
import {
  useCreateArticleMutation,
  useCreateCategoryMutation,
  useCreateTagMutation,
  useDeleteArticleMutation,
  useDeleteCategoryMutation,
  useDeleteTagMutation,
  useLoginMutation,
  usePublishArticleMutation,
  useUnpublishArticleMutation,
  useUpdateArticleMutation,
  useUpdateCategoryMutation,
  useUpdateTagMutation,
  useUploadMediaMutation,
} from '@/queries/articleMutations'
import {
  adminArticleQueryOptions,
  adminArticlesQueryOptions,
  adminCategoriesQueryOptions,
  adminTagsQueryOptions,
} from '@/queries/articleQueries'
import { clearAdminToken, getAdminToken, setAdminToken } from '@/services/request'
import './index.scss'

type LoginValues = { username: string; password: string }
type EditorValues = ArticlePayload
type CategoryValues = { name: string; slug: string; sortOrder: number; enabled: boolean }
type TagValues = { name: string; slug: string }

function errorText(error: unknown) {
  return error instanceof Error ? error.message : '操作未完成，请稍后重试。'
}

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }).format(
        new Date(value),
      )
    : '未发布'
}

export function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginMutation = useLoginMutation()

  useEffect(() => {
    if (!(location.state as { passwordChanged?: boolean } | null)?.passwordChanged) {
      return
    }
    message.success('密码已更新，请使用新密码登录')
    navigate('/admin/login', { replace: true, state: null })
  }, [location.state, navigate])

  async function submit(values: LoginValues) {
    try {
      const result = await loginMutation.mutateAsync(values)
      setAdminToken(result.token)
      navigate('/admin/articles', { replace: true })
    } catch (error) {
      message.error(errorText(error))
    }
  }

  return (
    <main className="admin-login">
      <section>
        <Link to="/">Lynco Hub</Link>
        <p>Content desk</p>
        <h1>管理技术文章</h1>
        <span>登录后可维护草稿、发布内容与文章分类。</span>
        <Form<LoginValues>
          layout="vertical"
          onFinish={(values) => void submit(values)}
          requiredMark={false}
        >
          <Form.Item
            label="管理员账号"
            name="username"
            rules={[{ required: true, message: '请输入管理员账号' }]}
          >
            <Input autoComplete="username" placeholder="admin" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password autoComplete="current-password" placeholder="输入密码" />
          </Form.Item>
          <Button
            block
            htmlType="submit"
            loading={loginMutation.isPending}
            size="large"
            type="primary"
          >
            登录管理后台
          </Button>
        </Form>
      </section>
    </main>
  )
}

export function AdminLayout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  if (!getAdminToken()) {
    return <Navigate replace to="/admin/login" />
  }

  function logout() {
    // 主动清理当前标签页的令牌，避免共用设备继续保留管理权限。
    clearAdminToken()
    queryClient.clear()
    navigate('/admin/login', { replace: true })
  }

  return (
    <main className="admin-shell">
      <header className="admin-shell__header">
        <Link className="admin-shell__brand" to="/">
          Lynco Hub <small>Content desk</small>
        </Link>
        <nav aria-label="后台导航">
          <NavLink to="/admin/articles">文章</NavLink>
          <NavLink to="/admin/taxonomy">分类与标签</NavLink>
          <NavLink to="/admin/security">安全设置</NavLink>
        </nav>
        <button type="button" onClick={logout}>
          退出登录
        </button>
      </header>
      <Outlet />
    </main>
  )
}

export function AdminArticles() {
  const [status, setStatus] = useState('')
  const navigate = useNavigate()
  const articlesQuery = useQuery(
    adminArticlesQueryOptions({ status: status || undefined, page: 1, pageSize: 50 }),
  )
  const publishMutation = usePublishArticleMutation()
  const unpublishMutation = useUnpublishArticleMutation()
  const deleteMutation = useDeleteArticleMutation()
  const result = articlesQuery.data
  const loading = articlesQuery.isPending
  const error = articlesQuery.error ? errorText(articlesQuery.error) : ''

  async function changePublication(article: Article) {
    try {
      if (article.status === 'PUBLISHED') {
        await unpublishMutation.mutateAsync(article.id)
        message.success('文章已撤回为草稿')
      } else {
        await publishMutation.mutateAsync(article.id)
        message.success('文章已发布')
      }
    } catch (actionError) {
      message.error(errorText(actionError))
    }
  }

  async function remove(article: Article) {
    if (!window.confirm(`确定删除“${article.title}”吗？此操作不可恢复。`)) {
      return
    }
    try {
      await deleteMutation.mutateAsync(article.id)
      message.success('文章已删除')
    } catch (actionError) {
      message.error(errorText(actionError))
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-page__heading">
        <div>
          <p>Article inventory</p>
          <h1>文章库</h1>
          <span>草稿不会出现在公开文章页或 sitemap 中。</span>
        </div>
        <Button type="primary" onClick={() => navigate('/admin/articles/new')}>
          新建文章
        </Button>
      </header>
      <div className="admin-page__toolbar">
        <label>
          状态
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">全部</option>
            <option value="DRAFT">草稿</option>
            <option value="PUBLISHED">已发布</option>
          </select>
        </label>
        <span>{result?.total || 0} 篇</span>
      </div>
      {loading && <p className="admin-page__state">正在读取文章…</p>}
      {!loading && articlesQuery.error && (
        <p className="admin-page__state admin-page__state--error">{error}</p>
      )}
      {!loading && !articlesQuery.error && result?.items.length === 0 && (
        <p className="admin-page__state">还没有文章，先创建一篇草稿吧。</p>
      )}
      {!loading && !articlesQuery.error && result && result.items.length > 0 && (
        <div className="admin-article-list">
          {result.items.map((article) => (
            <article key={article.id}>
              <div>
                <span className={`admin-status admin-status--${article.status.toLowerCase()}`}>
                  {article.status === 'PUBLISHED' ? '已发布' : '草稿'}
                </span>
                <small>
                  {article.category.name} · {formatDate(article.publishedAt || article.updatedAt)}
                </small>
                <h2>{article.title}</h2>
                <p>{article.summary}</p>
              </div>
              <div className="admin-article-list__actions">
                <Button onClick={() => navigate(`/admin/articles/${article.id}`)}>编辑</Button>
                <Button
                  loading={
                    article.status === 'PUBLISHED'
                      ? unpublishMutation.isPending && unpublishMutation.variables === article.id
                      : publishMutation.isPending && publishMutation.variables === article.id
                  }
                  onClick={() => void changePublication(article)}
                >
                  {article.status === 'PUBLISHED' ? '撤回' : '发布'}
                </Button>
                <Button
                  danger
                  loading={deleteMutation.isPending && deleteMutation.variables === article.id}
                  onClick={() => void remove(article)}
                >
                  删除
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export function AdminArticleEditor() {
  const { id } = useParams()
  const [form] = Form.useForm<EditorValues>()
  const navigate = useNavigate()
  const categoriesQuery = useQuery(adminCategoriesQueryOptions())
  const tagsQuery = useQuery(adminTagsQueryOptions())
  const articleQuery = useQuery(adminArticleQueryOptions(id || ''))
  const createMutation = useCreateArticleMutation()
  const updateMutation = useUpdateArticleMutation()
  const uploadMutation = useUploadMediaMutation()
  const categories = categoriesQuery.data || []
  const tags = tagsQuery.data || []
  const loading =
    categoriesQuery.isPending || tagsQuery.isPending || (Boolean(id) && articleQuery.isPending)
  const saving = createMutation.isPending || updateMutation.isPending
  const loadError = categoriesQuery.error || tagsQuery.error || articleQuery.error

  useEffect(() => {
    const article = articleQuery.data
    if (!article) {
      return
    }
    form.setFieldsValue({
      title: article.title,
      slug: article.slug,
      summary: article.summary,
      content: article.content,
      coverImageUrl: article.coverImageUrl || '',
      categoryId: article.category.id,
      tagIds: article.tags.map((item) => item.id),
    })
  }, [articleQuery.data, form])

  useEffect(() => {
    if (loadError) {
      message.error(errorText(loadError))
    }
  }, [loadError])

  async function save(values: EditorValues) {
    try {
      const payload: ArticlePayload = {
        ...values,
        categoryId: Number(values.categoryId),
        tagIds: (values.tagIds || []).map(Number),
        coverImageUrl: values.coverImageUrl?.trim() || '',
      }
      const saved = id
        ? await updateMutation.mutateAsync({ id, payload })
        : await createMutation.mutateAsync(payload)
      message.success(id ? '文章已保存' : '草稿已创建')
      navigate(`/admin/articles/${saved.id}`, { replace: true })
    } catch (saveError) {
      message.error(errorText(saveError))
    }
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }
    try {
      const result = await uploadMutation.mutateAsync(file)
      form.setFieldValue('coverImageUrl', result.url)
      message.success('图片已上传，并已填入封面地址')
    } catch (uploadError) {
      message.error(errorText(uploadError))
    }
  }

  if (loading) {
    return <section className="admin-page admin-page__state">正在加载编辑器…</section>
  }

  return (
    <section className="admin-page admin-editor">
      <header className="admin-page__heading">
        <div>
          <Link to="/admin/articles">← 返回文章库</Link>
          <p>{id ? 'Edit article' : 'New draft'}</p>
          <h1>{id ? '编辑文章' : '新建草稿'}</h1>
        </div>
        <Button loading={saving} onClick={() => form.submit()} type="primary">
          保存草稿
        </Button>
      </header>
      {categories.length === 0 && (
        <p className="admin-editor__notice">
          请先在 <Link to="/admin/taxonomy">分类与标签</Link> 中创建至少一个启用的分类。
        </p>
      )}
      <Form<EditorValues>
        className="admin-editor__form"
        form={form}
        initialValues={{ tagIds: [] }}
        layout="vertical"
        onFinish={(values) => void save(values)}
        requiredMark={false}
      >
        <div className="admin-editor__split">
          <Form.Item
            label="文章标题"
            name="title"
            rules={[{ required: true, message: '请输入文章标题' }, { max: 160 }]}
          >
            <Input placeholder="例如：用边界拆分复杂的 React 页面" />
          </Form.Item>
          <Form.Item
            label="URL 标识"
            name="slug"
            rules={[
              { required: true, message: '请输入 slug' },
              { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: '仅支持小写字母、数字与连字符' },
            ]}
          >
            <Input placeholder="react-page-boundaries" />
          </Form.Item>
        </div>
        <Form.Item
          label="摘要"
          name="summary"
          rules={[{ required: true, message: '请输入文章摘要' }, { max: 360 }]}
        >
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 5 }}
            placeholder="用一两句话告诉读者，这篇文章解决什么问题。"
          />
        </Form.Item>
        <div className="admin-editor__split">
          <Form.Item
            label="分类"
            name="categoryId"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select
              options={categories
                .filter((item) => item.enabled)
                .map((item) => ({ label: item.name, value: item.id }))}
              placeholder="选择一个分类"
            />
          </Form.Item>
          <Form.Item label="标签" name="tagIds">
            <Select
              mode="multiple"
              options={tags.map((item) => ({ label: item.name, value: item.id }))}
              placeholder="可选择多个标签"
            />
          </Form.Item>
        </div>
        <Form.Item label="封面图片地址" name="coverImageUrl">
          <Input placeholder="/media/… 或外部图片 URL" />
        </Form.Item>
        <label className="admin-editor__upload">
          <input
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => void upload(event)}
            type="file"
          />
          <span>
            {uploadMutation.isPending ? '正在上传…' : '上传封面（JPEG、PNG、WebP，最大 5 MB）'}
          </span>
        </label>
        <Form.Item
          label="Markdown 正文"
          name="content"
          rules={[{ required: true, message: '请输入 Markdown 正文' }]}
        >
          <Input.TextArea
            autoSize={{ minRows: 22 }}
            placeholder={'## 先说明问题\n\n用 Markdown 编写正文。原始 HTML 不会被公开页渲染。'}
          />
        </Form.Item>
      </Form>
    </section>
  )
}

export function AdminTaxonomy() {
  const [categoryEditing, setCategoryEditing] = useState<ArticleCategory | null>(null)
  const [tagEditing, setTagEditing] = useState<ArticleTag | null>(null)
  const [categoryForm] = Form.useForm<CategoryValues>()
  const [tagForm] = Form.useForm<TagValues>()
  const categoriesQuery = useQuery(adminCategoriesQueryOptions())
  const tagsQuery = useQuery(adminTagsQueryOptions())
  const createCategoryMutation = useCreateCategoryMutation()
  const updateCategoryMutation = useUpdateCategoryMutation()
  const deleteCategoryMutation = useDeleteCategoryMutation()
  const createTagMutation = useCreateTagMutation()
  const updateTagMutation = useUpdateTagMutation()
  const deleteTagMutation = useDeleteTagMutation()
  const categories = categoriesQuery.data || []
  const tags = tagsQuery.data || []
  const loadError = categoriesQuery.error || tagsQuery.error

  useEffect(() => {
    if (loadError) {
      message.error(errorText(loadError))
    }
  }, [loadError])

  async function saveCategory(values: CategoryValues) {
    try {
      if (categoryEditing) {
        await updateCategoryMutation.mutateAsync({ id: categoryEditing.id, payload: values })
        message.success('分类已更新')
      } else {
        await createCategoryMutation.mutateAsync(values)
        message.success('分类已创建')
      }
      setCategoryEditing(null)
      categoryForm.resetFields()
      categoryForm.setFieldsValue({ enabled: true, sortOrder: 0 })
    } catch (saveError) {
      message.error(errorText(saveError))
    }
  }

  async function saveTag(values: TagValues) {
    try {
      if (tagEditing) {
        await updateTagMutation.mutateAsync({ id: tagEditing.id, payload: values })
        message.success('标签已更新')
      } else {
        await createTagMutation.mutateAsync(values)
        message.success('标签已创建')
      }
      setTagEditing(null)
      tagForm.resetFields()
    } catch (saveError) {
      message.error(errorText(saveError))
    }
  }

  async function removeCategory(item: ArticleCategory) {
    if (!window.confirm(`确定删除分类“${item.name}”吗？`)) {
      return
    }
    try {
      await deleteCategoryMutation.mutateAsync(item.id)
      message.success('分类已删除')
    } catch (deleteError) {
      message.error(errorText(deleteError))
    }
  }

  async function removeTag(item: ArticleTag) {
    if (!window.confirm(`确定删除标签“${item.name}”吗？`)) {
      return
    }
    try {
      await deleteTagMutation.mutateAsync(item.id)
      message.success('标签已删除')
    } catch (deleteError) {
      message.error(errorText(deleteError))
    }
  }

  return (
    <section className="admin-page admin-taxonomy">
      <header className="admin-page__heading">
        <div>
          <p>Taxonomy desk</p>
          <h1>分类与标签</h1>
          <span>分类决定主要浏览入口；标签用于跨主题筛选。</span>
        </div>
      </header>
      <div className="admin-taxonomy__grid">
        <section>
          <h2>{categoryEditing ? `编辑分类：${categoryEditing.name}` : '分类'}</h2>
          <Form<CategoryValues>
            form={categoryForm}
            initialValues={{ enabled: true, sortOrder: 0 }}
            layout="vertical"
            onFinish={(values) => void saveCategory(values)}
          >
            <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
              <Input />
            </Form.Item>
            <Form.Item
              label="Slug"
              name="slug"
              rules={[
                { required: true, message: '请输入 slug' },
                { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: '仅支持小写字母、数字与连字符' },
              ]}
            >
              <Input />
            </Form.Item>
            <div className="admin-taxonomy__split">
              <Form.Item label="排序" name="sortOrder">
                <InputNumber min={0} />
              </Form.Item>
              <Form.Item label="在公开页显示" name="enabled" valuePropName="checked">
                <Switch />
              </Form.Item>
            </div>
            <Button
              htmlType="submit"
              loading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              type="primary"
            >
              {categoryEditing ? '保存分类' : '新建分类'}
            </Button>
            {categoryEditing && (
              <Button
                onClick={() => {
                  setCategoryEditing(null)
                  categoryForm.resetFields()
                }}
              >
                取消
              </Button>
            )}
          </Form>
          <div className="admin-taxonomy__items">
            {categories.map((item) => (
              <article key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    /{item.slug} · {item.articleCount || 0} 篇
                  </span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryEditing(item)
                      categoryForm.setFieldsValue({
                        name: item.name,
                        slug: item.slug,
                        sortOrder: item.sortOrder ?? 0,
                        enabled: item.enabled,
                      })
                    }}
                  >
                    编辑
                  </button>
                  <button
                    disabled={
                      deleteCategoryMutation.isPending &&
                      deleteCategoryMutation.variables === item.id
                    }
                    type="button"
                    onClick={() => void removeCategory(item)}
                  >
                    删除
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section>
          <h2>{tagEditing ? `编辑标签：${tagEditing.name}` : '标签'}</h2>
          <Form<TagValues>
            form={tagForm}
            layout="vertical"
            onFinish={(values) => void saveTag(values)}
          >
            <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
              <Input />
            </Form.Item>
            <Form.Item
              label="Slug"
              name="slug"
              rules={[
                { required: true, message: '请输入 slug' },
                { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: '仅支持小写字母、数字与连字符' },
              ]}
            >
              <Input />
            </Form.Item>
            <Button
              htmlType="submit"
              loading={createTagMutation.isPending || updateTagMutation.isPending}
              type="primary"
            >
              {tagEditing ? '保存标签' : '新建标签'}
            </Button>
            {tagEditing && (
              <Button
                onClick={() => {
                  setTagEditing(null)
                  tagForm.resetFields()
                }}
              >
                取消
              </Button>
            )}
          </Form>
          <div className="admin-taxonomy__items">
            {tags.map((item) => (
              <article key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    /{item.slug} · {item.articleCount || 0} 篇
                  </span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setTagEditing(item)
                      tagForm.setFieldsValue(item)
                    }}
                  >
                    编辑
                  </button>
                  <button
                    disabled={
                      deleteTagMutation.isPending && deleteTagMutation.variables === item.id
                    }
                    type="button"
                    onClick={() => void removeTag(item)}
                  >
                    删除
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
