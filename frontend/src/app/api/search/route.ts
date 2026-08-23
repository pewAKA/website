import { createFromSource } from 'fumadocs-core/search/server'
import { getDocsSource } from '@/lib/docs/source'

// 搜索索引直接读取数据库中的已发布文档，不会落到旧后端 rewrite。
export const dynamic = 'force-dynamic'
export const searchServer = createFromSource(getDocsSource)
export const { GET } = searchServer
