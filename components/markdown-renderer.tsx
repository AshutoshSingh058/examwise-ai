"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed prose-headings:text-current prose-p:text-current prose-a:text-current prose-strong:text-current prose-code:text-current prose-li:text-current marker:text-current prose-pre:bg-primary/10 prose-pre:text-current prose-pre:border prose-pre:border-border/50 prose-table:text-current prose-th:text-current prose-td:text-current">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
