/**
 * Build-time syntax highlighting for fenced code blocks.
 *
 * Deliberately small: a single-pass lexer that marks only what helps a reader
 * scan Java — annotations, keywords and comments. Strings are recognised so a
 * keyword inside one is left alone, but they are not coloured. The result is
 * plain data the Markdown renderer maps to spans, so no HTML string is ever
 * injected and no highlighter ships to the browser.
 *
 * Languages without a lexer here render unhighlighted, exactly as before.
 */

export type CodeTokenKind = 'annotation' | 'keyword' | 'comment' | 'plain'

export interface CodeToken {
  kind: CodeTokenKind
  text: string
}

const JAVA_KEYWORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
  'extends', 'false', 'final', 'finally', 'float', 'for', 'if', 'implements',
  'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'null',
  'package', 'private', 'protected', 'public', 'record', 'return', 'short',
  'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
  'transient', 'true', 'try', 'var', 'void', 'volatile', 'while', 'yield',
])

// Alternation order matters: comments and strings first, so their contents
// are never read as annotations or keywords.
const JAVA_LEXER =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])+')|(@[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)|([A-Za-z_$][\w$]*)/g

function lexJava(code: string): CodeToken[] {
  const tokens: CodeToken[] = []
  const push = (kind: CodeTokenKind, text: string) => {
    const last = tokens[tokens.length - 1]
    if (last && last.kind === kind) last.text += text
    else tokens.push({ kind, text })
  }

  let index = 0
  for (const match of code.matchAll(JAVA_LEXER)) {
    if (match.index > index) push('plain', code.slice(index, match.index))
    const [text, comment, , annotation, word] = match
    if (comment) push('comment', text)
    else if (annotation) push('annotation', text)
    else if (word && JAVA_KEYWORDS.has(word)) push('keyword', text)
    else push('plain', text)
    index = match.index + text.length
  }
  if (index < code.length) push('plain', code.slice(index))
  return tokens
}

/** Tokens for a fenced block, or `null` when the language has no lexer. */
export function highlight(code: string, lang: string | undefined): CodeToken[] | null {
  switch (lang?.trim().toLowerCase()) {
    case 'java':
      return lexJava(code)
    default:
      return null
  }
}
