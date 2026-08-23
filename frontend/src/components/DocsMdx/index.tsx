import defaultMdxComponents from 'fumadocs-ui/mdx'
import { Tab, Tabs, TabsContent, TabsList, TabsTrigger } from 'fumadocs-ui/components/tabs'
import type { MDXComponents } from 'mdx/types'

export function getDocsMdxComponents() {
  return {
    ...defaultMdxComponents,
    Tab,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    a: ({ href, children, ...props }) => {
      const external = href?.startsWith('http://') || href?.startsWith('https://')
      return (
        <a
          href={href}
          rel={external ? 'noreferrer noopener' : undefined}
          target={external ? '_blank' : undefined}
          {...props}
        >
          {children}
        </a>
      )
    },
  } as MDXComponents
}
