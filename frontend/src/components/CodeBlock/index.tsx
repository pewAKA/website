import { useState } from 'react'
import './index.scss'

type CodeBlockProps = {
  className?: string
  code: string
}

function CodeBlock({ className, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const language = className?.replace('language-', '') || 'text'

  async function copyCode() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code)
      } else {
        const input = document.createElement('textarea')
        input.value = code
        input.style.position = 'fixed'
        input.style.opacity = '0'
        document.body.append(input)
        input.select()
        document.execCommand('copy')
        input.remove()
      }
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="code-block" aria-label={`${language} 代码块`}>
      <header>
        <span>{language}</span>
        <button type="button" onClick={() => void copyCode()}>
          {copied ? '已复制' : '复制代码'}
        </button>
      </header>
      <pre>
        <code>{code}</code>
      </pre>
    </section>
  )
}

export default CodeBlock
