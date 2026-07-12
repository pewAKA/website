import { useEffect } from 'react'

type Metadata = {
  title: string
  description: string
  canonicalPath: string
}

function setMetaDescription(content: string) {
  let element = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (!element) {
    element = document.createElement('meta')
    element.name = 'description'
    document.head.append(element)
  }
  element.content = content
}

function setCanonical(path: string) {
  let element = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.append(element)
  }
  element.href = new URL(path, window.location.origin).toString()
}

/** 维持 Vite 单页应用的基础页面元数据，无需额外引入运行时 SEO 框架。 */
export function useDocumentMetadata({ title, description, canonicalPath }: Metadata) {
  useEffect(() => {
    document.title = title
    setMetaDescription(description)
    setCanonical(canonicalPath)
  }, [canonicalPath, description, title])
}
