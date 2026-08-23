import { defineTranslations } from 'fumadocs-core/i18n'
import { i18nProvider, uiTranslations } from 'fumadocs-ui/i18n'

const translations = defineTranslations().extend(uiTranslations()).add({
  displayName: '简体中文',
  'Search(search trigger)': '搜索文档',
  'Search(search dialog)': '搜索标题、章节和正文',
  'Open Search(search trigger)(aria-label)': '打开文档搜索',
  'Close Search(search dialog)(aria-label)': '关闭文档搜索',
  'No results found(search dialog)': '没有找到匹配内容',
  'On this page(table of contents)': '本页内容',
  'No Headings(table of contents)': '本页没有小节',
  'Previous Page(pagination)': '上一篇',
  'Next Page(pagination)': '下一篇',
  'Last updated on(page footer)': '最后更新于',
  'Copy Text(code block)(aria-label)': '复制代码',
  'Copied Text(code block)(aria-label)': '代码已复制',
  'Open Sidebar(sidebar)(aria-label)': '打开文档目录',
  'Close Sidebar(sidebar)(aria-label)': '关闭文档目录',
  'Show Sidebar(sidebar)': '显示文档目录',
  'Hide Sidebar(sidebar)': '隐藏文档目录',
  'Toggle Menu(mobile menu)(aria-label)': '切换文档菜单',
})

export const docsI18nProvider = i18nProvider(translations)
