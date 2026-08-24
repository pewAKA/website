'use client'

import { forwardRef, useMemo } from 'react'
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ChangeCodeMirrorLanguage,
  CodeToggle,
  ConditionalContents,
  CreateLink,
  DiffSourceToggleWrapper,
  GenericJsxEditor,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  Separator,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  jsxPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  type JsxComponentDescriptor,
  type MDXEditorMethods,
} from '@mdxeditor/editor'
import { uploadMedia } from '@/services/articles'
import type { MdxWorkbenchEditorProps } from './MdxWorkbenchEditor'

type Props = MdxWorkbenchEditorProps & { initialMarkdown: string }

const componentDescriptors: JsxComponentDescriptor[] = [
  {
    name: 'Callout',
    kind: 'flow',
    props: [
      { name: 'type', type: 'string' },
      { name: 'title', type: 'string' },
    ],
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
  {
    name: 'Tabs',
    kind: 'flow',
    props: [{ name: 'items', type: 'expression' }],
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
  {
    name: 'Tab',
    kind: 'flow',
    props: [{ name: 'value', type: 'string', required: true }],
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
  // 通配描述符保证未来新增的 MDX 组件不会在可视化往返时被静默删除。
  { name: '*', kind: 'flow', props: [], hasChildren: true, Editor: GenericJsxEditor },
  { name: '*', kind: 'text', props: [], hasChildren: true, Editor: GenericJsxEditor },
]

const unknownComponentPattern = /<([A-Z][A-Za-z0-9.]*)\b/g
const knownComponents = new Set(['Callout', 'Tabs', 'Tab'])

function needsSourceMode(markdown: string) {
  // 代码示例中的 <Component> 不是可执行 MDX，不能因此把整篇文章降级到源码模式。
  const proseOnly = markdown
    .replace(/(```|~~~)[\s\S]*?\1/g, '')
    .replace(/`[^`\n]*`/g, '')
  return [...proseOnly.matchAll(unknownComponentPattern)].some(
    (match) => !knownComponents.has(match[1]),
  )
}

const MdxWorkbenchEditorImpl = forwardRef<MDXEditorMethods, Props>(function MdxWorkbenchEditorImpl(
  { initialMarkdown, onChange, onParseError },
  ref,
) {
  const plugins = useMemo(
    () => [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      tablePlugin(),
      thematicBreakPlugin(),
      imagePlugin({ imageUploadHandler: async (file) => (await uploadMedia(file)).url }),
      codeBlockPlugin({ defaultCodeBlockLanguage: 'tsx' }),
      codeMirrorPlugin({
        codeBlockLanguages: {
          '': 'Plain text',
          ts: 'TypeScript',
          tsx: 'TSX',
          js: 'JavaScript',
          jsx: 'JSX',
          css: 'CSS',
          scss: 'SCSS',
          html: 'HTML',
          json: 'JSON',
          bash: 'Shell',
          sql: 'SQL',
        },
      }),
      jsxPlugin({ jsxComponentDescriptors: componentDescriptors, allowFragment: true }),
      markdownShortcutPlugin(),
      diffSourcePlugin({
        viewMode: needsSourceMode(initialMarkdown) ? 'source' : 'rich-text',
        diffMarkdown: initialMarkdown,
      }),
      toolbarPlugin({
        toolbarContents: () => (
          <DiffSourceToggleWrapper>
            <UndoRedo />
            <Separator />
            <BlockTypeSelect />
            <BoldItalicUnderlineToggles />
            <CodeToggle />
            <ListsToggle options={['bullet', 'number']} />
            <CreateLink />
            <Separator />
            <InsertTable />
            <InsertImage />
            <InsertCodeBlock />
            <InsertThematicBreak />
            <ConditionalContents
              options={[
                {
                  when: (editor) => editor?.editorType === 'codeblock',
                  contents: () => <ChangeCodeMirrorLanguage />,
                },
              ]}
            />
          </DiffSourceToggleWrapper>
        ),
      }),
    ],
    [initialMarkdown],
  )

  return (
    <MDXEditor
      ref={ref}
      className="workbench-editor"
      contentEditableClassName="workbench-editor__canvas"
      markdown={initialMarkdown}
      onChange={(value, normalized) => {
        if (!normalized) onChange(value)
        onParseError(null)
      }}
      onError={({ error }) => onParseError(error)}
      placeholder="从问题、判断和实现细节开始写…"
      plugins={plugins}
    />
  )
})

export default MdxWorkbenchEditorImpl
