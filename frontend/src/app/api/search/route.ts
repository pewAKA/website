import { createFromSource } from 'fumadocs-core/search/server'
import { getDocsSource } from '@/lib/docs/source'

// 搜索索引只读取 Mock DynamicSource，不会落到现有后端 rewrite。
export const searchServer = createFromSource(getDocsSource)
export const { GET } = searchServer
