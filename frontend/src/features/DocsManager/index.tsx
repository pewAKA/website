'use client'

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { App as AntApp, Button, Form, Input, InputNumber, Select, Switch } from 'antd'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import type { Article, ArticlePayload } from '@/services/articles'
import {
  useCreateArticleMutation,
  useDeleteArticleMutation,
  usePublishArticleMutation,
  useUnpublishArticleMutation,
  useUpdateArticleMutation,
  useUploadMediaMutation,
} from '@/queries/articleMutations'
import {
  adminArticleQueryOptions,
  adminArticlesQueryOptions,
  adminCategoriesQueryOptions,
  adminTagsQueryOptions,
} from '@/queries/articleQueries'
import { logout } from '@/services/auth'
import MdxWorkbenchEditor from './MdxWorkbenchEditor'
import {
  clearRecoveryDraft,
  isRecoveryNewer,
  readRecoveryDraft,
  type RecoveryDraft,
  writeRecoveryDraft,
} from './recovery'
import './index.scss'

type EditorValues = Omit<ArticlePayload, 'content'>

function errorText(error: unknown) {
  return error instanceof Error ? error.message : '操作未完成，请稍后重试。'
}

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(value))
    : '尚未发布'
}

export function DocsWorkbenchShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()

  async function endSession() {
    try {
      await logout()
    } finally {
      queryClient.clear()
      router.replace('/admin/login')
    }
  }

  return (
    <div className="workbench-shell">
      <header className="workbench-shell__bar">
        <div>
          <span className="workbench-shell__signal" />
          <strong>文档工作台</strong>
          <small>仅管理员可见</small>
        </div>
        <nav aria-label="文档工作台导航">
          <Link className={pathname === '/articles/manage' ? 'active' : ''} href="/articles/manage">
            文章库
          </Link>
          <Link
            className={pathname === '/articles/manage/taxonomy' ? 'active' : ''}
            href="/articles/manage/taxonomy"
          >
            分类与标签
          </Link>
          <Link href="/admin/security">安全设置</Link>
          <button type="button" onClick={() => void endSession()}>
            退出
          </button>
        </nav>
      </header>
      {children}
    </div>
  )
}

export function DocsArticleLibrary() {
  const { message } = AntApp.useApp()
  const [status, setStatus] = useState('')
  const [deleteCandidate, setDeleteCandidate] = useState<number | null>(null)
  const articlesQuery = useQuery(
    adminArticlesQueryOptions({ status: status || undefined, page: 1, pageSize: 50 }),
  )
  const publishMutation = usePublishArticleMutation()
  const unpublishMutation = useUnpublishArticleMutation()
  const deleteMutation = useDeleteArticleMutation()

  async function changePublication(article: Article) {
    try {
      if (article.status === 'PUBLISHED') {
        await unpublishMutation.mutateAsync(article.id)
        message.success('文章已撤回为草稿')
      } else {
        await publishMutation.mutateAsync(article.id)
        message.success('文章已发布')
      }
    } catch (error) {
      message.error(errorText(error))
    }
  }

  async function remove(article: Article) {
    try {
      await deleteMutation.mutateAsync(article.id)
      setDeleteCandidate(null)
      message.success('文章已删除')
    } catch (error) {
      message.error(errorText(error))
    }
  }

  const result = articlesQuery.data
  return (
    <main className="workbench-page workbench-library">
      <header className="workbench-heading">
        <div>
          <p>Document inventory / {result?.total ?? 0}</p>
          <h1>文章库</h1>
          <span>草稿只存在于工作台；发布后才进入文档树、搜索与 sitemap。</span>
        </div>
        <Link className="workbench-primary-link" href="/articles/manage/new">
          新建草稿 <span>↗</span>
        </Link>
      </header>

      <div className="workbench-filter" role="group" aria-label="文章状态筛选">
        {[
          ['', '全部'],
          ['DRAFT', '草稿'],
          ['PUBLISHED', '已发布'],
        ].map(([value, label]) => (
          <button
            className={status === value ? 'active' : ''}
            key={value}
            type="button"
            onClick={() => setStatus(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {articlesQuery.isPending && <LibrarySkeleton />}
      {articlesQuery.isError && (
        <div className="workbench-state workbench-state--error">
          <strong>文章库读取失败</strong>
          <p>{errorText(articlesQuery.error)}</p>
          <Button onClick={() => void articlesQuery.refetch()}>重新加载</Button>
        </div>
      )}
      {!articlesQuery.isPending && !articlesQuery.isError && result?.items.length === 0 && (
        <div className="workbench-state">
          <strong>这里还没有文章</strong>
          <p>先写一篇草稿，保存后即可进行精准预览。</p>
        </div>
      )}
      {result && result.items.length > 0 && (
        <div className="workbench-document-list">
          {result.items.map((article, index) => (
            <article key={article.id}>
              <span className="workbench-document-list__index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="workbench-document-list__content">
                <div className="workbench-document-list__meta">
                  <span data-status={article.status}>
                    {article.status === 'PUBLISHED' ? '已发布' : '草稿'}
                  </span>
                  <span>{article.category.name}</span>
                  <span>{formatDate(article.updatedAt)}</span>
                  {article.documentMeta.featured && <span>精选</span>}
                </div>
                <h2>
                  <Link href={`/articles/manage/${article.id}`}>{article.title}</Link>
                </h2>
                <p>{article.summary}</p>
                <div className="workbench-document-list__tags">
                  {article.tags.map((tag) => (
                    <span key={tag.id}>#{tag.name}</span>
                  ))}
                </div>
              </div>
              <div className="workbench-document-list__actions">
                {deleteCandidate === article.id ? (
                  <div className="workbench-delete-confirm" role="alert">
                    <strong>确认永久删除？</strong>
                    <button type="button" onClick={() => setDeleteCandidate(null)}>
                      取消
                    </button>
                    <button type="button" onClick={() => void remove(article)}>
                      确认删除
                    </button>
                  </div>
                ) : (
                  <>
                    <Link href={`/articles/manage/${article.id}`}>编辑</Link>
                    <Link href={`/articles/manage/preview/${article.id}`} target="_blank">
                      预览
                    </Link>
                    <button type="button" onClick={() => void changePublication(article)}>
                      {article.status === 'PUBLISHED' ? '撤回' : '发布'}
                    </button>
                    <button type="button" onClick={() => setDeleteCandidate(article.id)}>
                      删除
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

function LibrarySkeleton() {
  return (
    <div className="workbench-skeleton" aria-label="正在加载文章">
      {[1, 2, 3].map((item) => (
        <span key={item} />
      ))}
    </div>
  )
}

export function DocsArticleEditor() {
  const { message, modal } = AntApp.useApp()
  const params = useParams<{ id?: string }>()
  const id = params.id
  const router = useRouter()
  const [form] = Form.useForm<EditorValues>()
  const [content, setContent] = useState('## 从一个具体问题开始\n\n记录背景、判断和最终实现。')
  const [dirty, setDirty] = useState(false)
  const [formRevision, setFormRevision] = useState(0)
  const [parseError, setParseError] = useState<string | null>(null)
  const [recovery, setRecovery] = useState<RecoveryDraft | null>(null)
  const [hydratedDocument, setHydratedDocument] = useState<string | null>(null)
  const categoriesQuery = useQuery(adminCategoriesQueryOptions())
  const tagsQuery = useQuery(adminTagsQueryOptions())
  const articleQuery = useQuery(adminArticleQueryOptions(id || ''))
  const createMutation = useCreateArticleMutation()
  const updateMutation = useUpdateArticleMutation()
  const publishMutation = usePublishArticleMutation()
  const unpublishMutation = useUnpublishArticleMutation()
  const uploadMutation = useUploadMediaMutation()
  const article = articleQuery.data
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data])
  const tags = useMemo(() => tagsQuery.data ?? [], [tagsQuery.data])
  const saving = createMutation.isPending || updateMutation.isPending

  // 查询结果是外部状态，加载完成后需要一次性水合表单与编辑器。
  useEffect(() => {
    if (id && !article) return
    const initial: EditorValues = article
      ? {
          title: article.title,
          slug: article.slug,
          summary: article.summary,
          coverImageUrl: article.coverImageUrl || '',
          categoryId: article.category.id,
          tagIds: article.tags.map((tag) => tag.id),
          documentMeta: {
            featured: article.documentMeta.featured,
            readingMinutes: article.documentMeta.readingMinutes,
          },
        }
      : {
          title: '',
          slug: '',
          summary: '',
          coverImageUrl: '',
          categoryId: categories.find((item) => item.enabled)?.id ?? 0,
          tagIds: [],
          documentMeta: { featured: false, readingMinutes: null },
        }
    form.setFieldsValue(initial)
    // oxlint-disable-next-line react-hooks/set-state-in-effect -- 水合异步查询结果。
    if (article) setContent(article.content)
    setDirty(false)
    const draft = readRecoveryDraft(id)
    if (draft && isRecoveryNewer(draft, article?.updatedAt)) setRecovery(draft)
    setHydratedDocument(id || 'new')
  }, [article, categories, form, id])

  useEffect(() => {
    if (!dirty) return
    const timer = window.setTimeout(() => {
      writeRecoveryDraft(id, { ...form.getFieldsValue(true), content })
    }, 800)
    return () => window.clearTimeout(timer)
  }, [content, dirty, form, formRevision, id])

  useEffect(() => {
    if (!dirty) return
    const beforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [dirty])

  useEffect(() => {
    if (!dirty) return
    const protectInternalNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey) return
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const destination = new URL(anchor.href, window.location.href)
      if (
        destination.origin !== window.location.origin ||
        destination.href === window.location.href
      )
        return

      event.preventDefault()
      modal.confirm({
        title: '还有未保存的修改',
        content: '离开后仍可从本地恢复副本，但数据库不会保存这些修改。',
        okText: '仍然离开',
        cancelText: '继续编辑',
        onOk: () => router.push(`${destination.pathname}${destination.search}${destination.hash}`),
      })
    }
    document.addEventListener('click', protectInternalNavigation, true)
    return () => document.removeEventListener('click', protectInternalNavigation, true)
  }, [dirty, modal, router])

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        form.submit()
      }
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [form])

  function restoreDraft() {
    if (!recovery) return
    const { content: recoveredContent, ...values } = recovery.payload
    form.setFieldsValue(values as EditorValues)
    if (typeof recoveredContent === 'string') setContent(recoveredContent)
    setDirty(true)
    setRecovery(null)
  }

  function discardDraft() {
    clearRecoveryDraft(id)
    setRecovery(null)
  }

  async function save(values: EditorValues) {
    if (parseError) {
      message.error('请先修复 MDX 解析错误，或切换源码模式检查内容。')
      return
    }
    try {
      const payload: ArticlePayload = {
        ...values,
        content,
        categoryId: Number(values.categoryId),
        tagIds: (values.tagIds || []).map(Number),
        coverImageUrl: values.coverImageUrl?.trim() || '',
        documentMeta: {
          featured: Boolean(values.documentMeta?.featured),
          readingMinutes: values.documentMeta?.readingMinutes
            ? Number(values.documentMeta.readingMinutes)
            : null,
        },
      }
      const saved = id
        ? await updateMutation.mutateAsync({ id, payload })
        : await createMutation.mutateAsync(payload)
      clearRecoveryDraft(id)
      if (!id) clearRecoveryDraft(undefined)
      setDirty(false)
      message.success(id ? '文章已保存' : '草稿已创建')
      router.replace(`/articles/manage/${saved.id}`)
    } catch (error) {
      message.error(errorText(error))
    }
  }

  async function changePublication() {
    if (!article || dirty) return
    try {
      if (article.status === 'PUBLISHED') {
        await unpublishMutation.mutateAsync(article.id)
        message.success('文章已撤回')
      } else {
        await publishMutation.mutateAsync(article.id)
        message.success('文章已发布，公开文档树已刷新')
      }
    } catch (error) {
      message.error(errorText(error))
    }
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const result = await uploadMutation.mutateAsync(file)
      form.setFieldValue('coverImageUrl', result.url)
      setDirty(true)
      setFormRevision((value) => value + 1)
      message.success('封面已上传')
    } catch (error) {
      message.error(errorText(error))
    }
  }

  const loading =
    categoriesQuery.isPending ||
    tagsQuery.isPending ||
    (Boolean(id) && articleQuery.isPending) ||
    hydratedDocument !== (id || 'new')
  const loadError = categoriesQuery.error || tagsQuery.error || articleQuery.error
  const effectiveReading = article?.documentMeta.estimatedReadingMinutes ?? '—'

  if (loading) {
    return (
      <Form form={form} component={false}>
        <main className="workbench-page workbench-editor-state">
          <LibrarySkeleton />
        </main>
      </Form>
    )
  }
  if (loadError) {
    return (
      <main className="workbench-page workbench-state workbench-state--error">
        <strong>编辑器加载失败</strong>
        <p>{errorText(loadError)}</p>
      </main>
    )
  }

  return (
    <main className="workbench-page workbench-edit-page">
      <header className="workbench-edit-actions">
        <div>
          <Link href="/articles/manage">← 文章库</Link>
          <span data-status={article?.status || 'DRAFT'}>
            {article?.status === 'PUBLISHED' ? '已发布' : '草稿'}
          </span>
          {dirty && <span className="is-dirty">有未保存修改</span>}
        </div>
        <div>
          {id && (
            <Link href={`/articles/manage/preview/${id}`} target="_blank">
              精准预览
            </Link>
          )}
          {article && (
            <Button disabled={dirty} onClick={() => void changePublication()}>
              {article.status === 'PUBLISHED' ? '撤回' : '发布'}
            </Button>
          )}
          <Button loading={saving} type="primary" onClick={() => form.submit()}>
            保存 <kbd>⌘S</kbd>
          </Button>
        </div>
      </header>

      {recovery && (
        <div className="workbench-recovery" role="status">
          <div>
            <strong>发现较新的本地副本</strong>
            <span>{formatDate(recovery.savedAt)} 自动保存于此浏览器</span>
          </div>
          <button type="button" onClick={discardDraft}>
            丢弃
          </button>
          <button type="button" onClick={restoreDraft}>
            恢复副本
          </button>
        </div>
      )}
      {categories.length === 0 && (
        <div className="workbench-recovery workbench-recovery--warning">
          <strong>还没有可用分类</strong>
          <Link href="/articles/manage/taxonomy">先创建分类 →</Link>
        </div>
      )}

      <Form<EditorValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFieldsChange={() => {
          setDirty(true)
          setFormRevision((value) => value + 1)
        }}
        onFinish={(values) => void save(values)}
      >
        <div className="workbench-edit-grid">
          <section className="workbench-canvas">
            <Form.Item
              name="title"
              rules={[{ required: true, message: '请输入标题' }, { max: 160 }]}
            >
              {/* 标题可随内容增高，避免宽屏两栏布局中长标题被单行输入框截断。 */}
              <Input.TextArea
                autoSize={{ minRows: 1, maxRows: 3 }}
                className="workbench-title-input"
                placeholder="文章标题"
                variant="borderless"
              />
            </Form.Item>
            <Form.Item
              name="summary"
              rules={[{ required: true, message: '请输入摘要' }, { max: 360 }]}
            >
              <Input.TextArea
                autoSize={{ minRows: 2, maxRows: 5 }}
                className="workbench-summary-input"
                placeholder="一句话说明这篇文档解决什么问题。"
                variant="borderless"
              />
            </Form.Item>
            {parseError && (
              <div className="workbench-parse-error">
                <strong>MDX 解析失败</strong>
                <code>{parseError}</code>
              </div>
            )}
            <MdxWorkbenchEditor
              markdown={content}
              onChange={(value) => {
                setContent(value)
                setDirty(true)
              }}
              onParseError={setParseError}
            />
          </section>

          <aside className="workbench-metadata" aria-label="文章元数据">
            <p>Document settings</p>
            <Form.Item
              label="URL 标识"
              name="slug"
              rules={[
                { required: true, message: '请输入 slug' },
                { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: '仅支持小写字母、数字与连字符' },
              ]}
            >
              <Input prefix="/" placeholder="server-boundaries" />
            </Form.Item>
            <Form.Item
              label="分类"
              name="categoryId"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select
                options={categories
                  .filter((item) => item.enabled || item.id === article?.category.id)
                  .map((item) => ({ label: item.name, value: item.id }))}
                placeholder="选择分类"
              />
            </Form.Item>
            <Form.Item label="标签" name="tagIds">
              <Select
                mode="multiple"
                options={tags.map((item) => ({ label: item.name, value: item.id }))}
                placeholder="选择标签"
              />
            </Form.Item>
            <Form.Item label="封面地址" name="coverImageUrl">
              <Input placeholder="/media/…" />
            </Form.Item>
            <label className="workbench-upload">
              <input
                accept="image/jpeg,image/png,image/webp"
                type="file"
                onChange={(event) => void upload(event)}
              />
              <span>{uploadMutation.isPending ? '上传中…' : '上传封面图片'}</span>
            </label>
            <div className="workbench-metadata__rule" />
            <Form.Item label="首页精选" name={['documentMeta', 'featured']} valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item
              label={`阅读时长（自动约 ${effectiveReading} 分钟）`}
              name={['documentMeta', 'readingMinutes']}
            >
              <InputNumber min={1} max={120} placeholder="自动估算" />
            </Form.Item>
            <small>留空时按中英文正文自动估算；填写后作为公开展示覆盖值。</small>
          </aside>
        </div>
      </Form>
      <div className="workbench-mobile-save">
        <Button block loading={saving} type="primary" onClick={() => form.submit()}>
          保存当前修改
        </Button>
      </div>
    </main>
  )
}

export { DocsTaxonomy } from './Taxonomy'
