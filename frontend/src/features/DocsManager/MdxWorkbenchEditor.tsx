'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { MDXEditorMethods } from '@mdxeditor/editor'

const EditorImplementation = dynamic(() => import('./MdxWorkbenchEditorImpl'), {
  ssr: false,
  loading: () => <div className="workbench-editor__loading">正在加载 MDX 编辑器…</div>,
})

export type MdxWorkbenchEditorProps = {
  markdown: string
  onChange: (markdown: string) => void
  onParseError: (message: string | null) => void
}

export default function MdxWorkbenchEditor(props: MdxWorkbenchEditorProps) {
  const editorRef = useRef<MDXEditorMethods>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.getMarkdown() !== props.markdown) {
      editorRef.current.setMarkdown(props.markdown)
    }
  }, [props.markdown])

  // 编辑器只在首次挂载读取 initialMarkdown，后续外部恢复通过 ref 同步。
  return <EditorImplementation ref={editorRef} initialMarkdown={props.markdown} {...props} />
}
