'use client'

import { useEffect, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { App as AntApp, Button, Form, Input, InputNumber, Modal, Switch } from 'antd'
import type { ArticleCategory, ArticleTag } from '@/services/articles'
import {
  useCreateCategoryMutation,
  useCreateTagMutation,
  useDeleteCategoryMutation,
  useDeleteTagMutation,
  useUpdateCategoryMutation,
  useUpdateTagMutation,
} from '@/queries/articleMutations'
import { adminCategoriesQueryOptions, adminTagsQueryOptions } from '@/queries/articleQueries'

type CategoryValues = { name: string; slug: string; sortOrder: number; enabled: boolean }
type TagValues = { name: string; slug: string }
type TaxonomyTab = 'categories' | 'tags'

const taxonomyTabs: TaxonomyTab[] = ['categories', 'tags']

function errorText(error: unknown) {
  return error instanceof Error ? error.message : '操作未完成，请稍后重试。'
}

export function DocsTaxonomy() {
  const { message } = AntApp.useApp()
  const [activeTab, setActiveTab] = useState<TaxonomyTab>('categories')
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [tagModalOpen, setTagModalOpen] = useState(false)
  const [categoryEditing, setCategoryEditing] = useState<ArticleCategory | null>(null)
  const [tagEditing, setTagEditing] = useState<ArticleTag | null>(null)
  const [deleteCategory, setDeleteCategory] = useState<number | null>(null)
  const [deleteTag, setDeleteTag] = useState<number | null>(null)
  const [categoryForm] = Form.useForm<CategoryValues>()
  const [tagForm] = Form.useForm<TagValues>()
  const categoriesQuery = useQuery(adminCategoriesQueryOptions())
  const tagsQuery = useQuery(adminTagsQueryOptions())
  const createCategory = useCreateCategoryMutation()
  const updateCategory = useUpdateCategoryMutation()
  const removeCategory = useDeleteCategoryMutation()
  const createTag = useCreateTagMutation()
  const updateTag = useUpdateTagMutation()
  const removeTag = useDeleteTagMutation()

  useEffect(() => {
    const error = categoriesQuery.error || tagsQuery.error
    if (error) message.error(errorText(error))
  }, [categoriesQuery.error, message, tagsQuery.error])

  async function saveCategory(values: CategoryValues) {
    try {
      if (categoryEditing)
        await updateCategory.mutateAsync({ id: categoryEditing.id, payload: values })
      else await createCategory.mutateAsync(values)
      message.success(categoryEditing ? '分类已更新' : '分类已创建')
      setCategoryModalOpen(false)
      setCategoryEditing(null)
      categoryForm.resetFields()
      categoryForm.setFieldsValue({ enabled: true, sortOrder: 0 })
    } catch (error) {
      message.error(errorText(error))
    }
  }

  async function saveTag(values: TagValues) {
    try {
      if (tagEditing) await updateTag.mutateAsync({ id: tagEditing.id, payload: values })
      else await createTag.mutateAsync(values)
      message.success(tagEditing ? '标签已更新' : '标签已创建')
      setTagModalOpen(false)
      setTagEditing(null)
      tagForm.resetFields()
    } catch (error) {
      message.error(errorText(error))
    }
  }

  function handleTabKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, currentTab: TaxonomyTab) {
    const currentIndex = taxonomyTabs.indexOf(currentTab)
    let nextIndex = currentIndex

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % taxonomyTabs.length
    else if (event.key === 'ArrowLeft')
      nextIndex = (currentIndex - 1 + taxonomyTabs.length) % taxonomyTabs.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = taxonomyTabs.length - 1
    else return

    event.preventDefault()
    const nextTab = taxonomyTabs[nextIndex]
    setActiveTab(nextTab)
    // Tab 采用自动激活模式，方向键切换时同步移动键盘焦点。
    document.getElementById(`taxonomy-tab-${nextTab}`)?.focus()
  }

  function openCategoryModal(item?: ArticleCategory) {
    setCategoryEditing(item || null)
    categoryForm.setFieldsValue(
      item
        ? {
            enabled: item.enabled,
            name: item.name,
            slug: item.slug,
            sortOrder: item.sortOrder || 0,
          }
        : { enabled: true, name: '', slug: '', sortOrder: 0 },
    )
    setCategoryModalOpen(true)
  }

  function closeCategoryModal() {
    setCategoryModalOpen(false)
    setCategoryEditing(null)
    categoryForm.resetFields()
  }

  function openTagModal(item?: ArticleTag) {
    setTagEditing(item || null)
    tagForm.setFieldsValue(item ? { name: item.name, slug: item.slug } : { name: '', slug: '' })
    setTagModalOpen(true)
  }

  function closeTagModal() {
    setTagModalOpen(false)
    setTagEditing(null)
    tagForm.resetFields()
  }

  const categories = categoriesQuery.data || []
  const tags = tagsQuery.data || []

  return (
    <main className="workbench-page workbench-taxonomy">
      <div className="workbench-taxonomy__bar">
        <div aria-label="分类与标签管理" className="workbench-taxonomy__tabs" role="tablist">
          <button
            aria-controls="taxonomy-panel-categories"
            aria-selected={activeTab === 'categories'}
            className={activeTab === 'categories' ? 'active' : ''}
            id="taxonomy-tab-categories"
            onClick={() => setActiveTab('categories')}
            onKeyDown={(event) => handleTabKeyDown(event, 'categories')}
            role="tab"
            tabIndex={activeTab === 'categories' ? 0 : -1}
            type="button"
          >
            分类管理 <span aria-hidden="true">{String(categories.length).padStart(2, '0')}</span>
          </button>
          <button
            aria-controls="taxonomy-panel-tags"
            aria-selected={activeTab === 'tags'}
            className={activeTab === 'tags' ? 'active' : ''}
            id="taxonomy-tab-tags"
            onClick={() => setActiveTab('tags')}
            onKeyDown={(event) => handleTabKeyDown(event, 'tags')}
            role="tab"
            tabIndex={activeTab === 'tags' ? 0 : -1}
            type="button"
          >
            标签管理 <span aria-hidden="true">{String(tags.length).padStart(2, '0')}</span>
          </button>
        </div>
        <Button
          className="workbench-taxonomy__create"
          type="primary"
          onClick={() => (activeTab === 'categories' ? openCategoryModal() : openTagModal())}
        >
          {activeTab === 'categories' ? '新建分类' : '新建标签'}
        </Button>
      </div>

      <div className="workbench-taxonomy__workspace">
        <section
          aria-labelledby="taxonomy-tab-categories"
          hidden={activeTab !== 'categories'}
          id="taxonomy-panel-categories"
          role="tabpanel"
          tabIndex={0}
        >
          <div className="workbench-taxonomy__items">
            {categories.map((item) => (
              <article key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    /{item.slug} · {item.articleCount || 0} 篇 · {item.enabled ? '公开' : '停用'}
                  </span>
                </div>
                <div>
                  {deleteCategory === item.id ? (
                    <>
                      <button type="button" onClick={() => setDeleteCategory(null)}>
                        取消
                      </button>
                      <button
                        className="danger"
                        type="button"
                        onClick={async () => {
                          try {
                            await removeCategory.mutateAsync(item.id)
                            setDeleteCategory(null)
                            message.success('分类已删除')
                          } catch (error) {
                            message.error(errorText(error))
                          }
                        }}
                      >
                        确认删除
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => openCategoryModal(item)}>
                        编辑
                      </button>
                      <button type="button" onClick={() => setDeleteCategory(item.id)}>
                        删除
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="taxonomy-tab-tags"
          hidden={activeTab !== 'tags'}
          id="taxonomy-panel-tags"
          role="tabpanel"
          tabIndex={0}
        >
          <div className="workbench-taxonomy__items">
            {tags.map((item) => (
              <article key={item.id}>
                <div>
                  <strong>#{item.name}</strong>
                  <span>
                    /{item.slug} · {item.articleCount || 0} 篇
                  </span>
                </div>
                <div>
                  {deleteTag === item.id ? (
                    <>
                      <button type="button" onClick={() => setDeleteTag(null)}>
                        取消
                      </button>
                      <button
                        className="danger"
                        type="button"
                        onClick={async () => {
                          try {
                            await removeTag.mutateAsync(item.id)
                            setDeleteTag(null)
                            message.success('标签已删除')
                          } catch (error) {
                            message.error(errorText(error))
                          }
                        }}
                      >
                        确认删除
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => openTagModal(item)}>
                        编辑
                      </button>
                      <button type="button" onClick={() => setDeleteTag(item.id)}>
                        删除
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* 创建与编辑共用弹窗表单，避免列表页重新出现大面积内联表单。 */}
      <Modal
        cancelButtonProps={{ disabled: createCategory.isPending || updateCategory.isPending }}
        cancelText="取消"
        className="workbench-taxonomy__modal"
        forceRender
        okButtonProps={{ loading: createCategory.isPending || updateCategory.isPending }}
        okText={categoryEditing ? '保存分类' : '创建分类'}
        open={categoryModalOpen}
        title={categoryEditing ? '编辑分类' : '新建分类'}
        width={680}
        onCancel={closeCategoryModal}
        onOk={() => categoryForm.submit()}
      >
        <Form<CategoryValues>
          form={categoryForm}
          layout="vertical"
          name="category-taxonomy"
          onFinish={(values) => void saveCategory(values)}
        >
          <div className="workbench-taxonomy__modal-fields">
            <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
              <Input placeholder="前端架构" />
            </Form.Item>
            <Form.Item
              label="Slug"
              name="slug"
              rules={[
                { required: true, message: '请输入 slug' },
                {
                  pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                  message: '仅支持小写字母、数字与连字符',
                },
              ]}
            >
              <Input placeholder="frontend" />
            </Form.Item>
            <Form.Item label="排序" name="sortOrder">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item label="公开显示" name="enabled" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        cancelButtonProps={{ disabled: createTag.isPending || updateTag.isPending }}
        cancelText="取消"
        className="workbench-taxonomy__modal"
        forceRender
        okButtonProps={{ loading: createTag.isPending || updateTag.isPending }}
        okText={tagEditing ? '保存标签' : '创建标签'}
        open={tagModalOpen}
        title={tagEditing ? '编辑标签' : '新建标签'}
        width={600}
        onCancel={closeTagModal}
        onOk={() => tagForm.submit()}
      >
        <Form<TagValues>
          form={tagForm}
          layout="vertical"
          name="tag-taxonomy"
          onFinish={(values) => void saveTag(values)}
        >
          <div className="workbench-taxonomy__modal-fields">
            <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
              <Input placeholder="Next.js" />
            </Form.Item>
            <Form.Item
              label="Slug"
              name="slug"
              rules={[
                { required: true, message: '请输入 slug' },
                {
                  pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                  message: '仅支持小写字母、数字与连字符',
                },
              ]}
            >
              <Input placeholder="next-js" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </main>
  )
}
