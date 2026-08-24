'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { App as AntApp, Button, Form, Input, InputNumber, Switch } from 'antd'
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

function errorText(error: unknown) {
  return error instanceof Error ? error.message : '操作未完成，请稍后重试。'
}

export function DocsTaxonomy() {
  const { message } = AntApp.useApp()
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
      if (categoryEditing) await updateCategory.mutateAsync({ id: categoryEditing.id, payload: values })
      else await createCategory.mutateAsync(values)
      message.success(categoryEditing ? '分类已更新' : '分类已创建')
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
      setTagEditing(null)
      tagForm.resetFields()
    } catch (error) {
      message.error(errorText(error))
    }
  }

  return (
    <main className="workbench-page workbench-taxonomy">
      <header className="workbench-heading">
        <div><p>Information architecture</p><h1>分类与标签</h1><span>分类决定文档树的主路径，标签用于建立跨主题关联。</span></div>
      </header>
      <div className="workbench-taxonomy__grid">
        <section>
          <div className="workbench-taxonomy__intro"><span>01</span><div><h2>分类专区</h2><p>一个文章只能属于一个启用中的分类。</p></div></div>
          <Form<CategoryValues> form={categoryForm} initialValues={{ enabled: true, sortOrder: 0 }} layout="vertical" onFinish={(values) => void saveCategory(values)}>
            <div className="workbench-taxonomy__fields">
              <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}><Input placeholder="前端架构" /></Form.Item>
              <Form.Item label="Slug" name="slug" rules={[{ required: true, message: '请输入 slug' }, { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: '仅支持小写字母、数字与连字符' }]}><Input placeholder="frontend" /></Form.Item>
              <Form.Item label="排序" name="sortOrder"><InputNumber min={0} /></Form.Item>
              <Form.Item label="公开显示" name="enabled" valuePropName="checked"><Switch /></Form.Item>
            </div>
            <div className="workbench-taxonomy__form-actions">
              <Button htmlType="submit" loading={createCategory.isPending || updateCategory.isPending} type="primary">{categoryEditing ? '保存分类' : '新建分类'}</Button>
              {categoryEditing && <Button onClick={() => { setCategoryEditing(null); categoryForm.resetFields() }}>取消</Button>}
            </div>
          </Form>
          <div className="workbench-taxonomy__items">
            {(categoriesQuery.data || []).map((item) => (
              <article key={item.id}>
                <div><strong>{item.name}</strong><span>/{item.slug} · {item.articleCount || 0} 篇 · {item.enabled ? '公开' : '停用'}</span></div>
                <div>
                  {deleteCategory === item.id ? <><button type="button" onClick={() => setDeleteCategory(null)}>取消</button><button className="danger" type="button" onClick={async () => { try { await removeCategory.mutateAsync(item.id); setDeleteCategory(null); message.success('分类已删除') } catch (error) { message.error(errorText(error)) } }}>确认删除</button></> : <><button type="button" onClick={() => { setCategoryEditing(item); categoryForm.setFieldsValue({ name: item.name, slug: item.slug, sortOrder: item.sortOrder || 0, enabled: item.enabled }) }}>编辑</button><button type="button" onClick={() => setDeleteCategory(item.id)}>删除</button></>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="workbench-taxonomy__intro"><span>02</span><div><h2>主题标签</h2><p>标签可以跨分类组织相关实现记录。</p></div></div>
          <Form<TagValues> form={tagForm} layout="vertical" onFinish={(values) => void saveTag(values)}>
            <div className="workbench-taxonomy__fields workbench-taxonomy__fields--tag">
              <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}><Input placeholder="Next.js" /></Form.Item>
              <Form.Item label="Slug" name="slug" rules={[{ required: true, message: '请输入 slug' }, { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: '仅支持小写字母、数字与连字符' }]}><Input placeholder="next-js" /></Form.Item>
            </div>
            <div className="workbench-taxonomy__form-actions">
              <Button htmlType="submit" loading={createTag.isPending || updateTag.isPending} type="primary">{tagEditing ? '保存标签' : '新建标签'}</Button>
              {tagEditing && <Button onClick={() => { setTagEditing(null); tagForm.resetFields() }}>取消</Button>}
            </div>
          </Form>
          <div className="workbench-taxonomy__items">
            {(tagsQuery.data || []).map((item) => (
              <article key={item.id}>
                <div><strong>#{item.name}</strong><span>/{item.slug} · {item.articleCount || 0} 篇</span></div>
                <div>
                  {deleteTag === item.id ? <><button type="button" onClick={() => setDeleteTag(null)}>取消</button><button className="danger" type="button" onClick={async () => { try { await removeTag.mutateAsync(item.id); setDeleteTag(null); message.success('标签已删除') } catch (error) { message.error(errorText(error)) } }}>确认删除</button></> : <><button type="button" onClick={() => { setTagEditing(item); tagForm.setFieldsValue({ name: item.name, slug: item.slug }) }}>编辑</button><button type="button" onClick={() => setDeleteTag(item.id)}>删除</button></>}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
