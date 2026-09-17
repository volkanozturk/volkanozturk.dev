import { Fragment, type CSSProperties, type ReactNode } from 'react'
import Image from 'next/image'
import { marked, type Token, type Tokens } from 'marked'
import { resolveFigure } from '@/components/post-figures'
import { getImageSize } from '@/lib/image-size'
import { cn } from '@/lib/utils'

/**
 * Renders Markdown as React elements from marked's token stream.
 *
 * Tokens are mapped explicitly rather than injected as HTML: nothing reaches the
 * page unless it is handled below, so raw HTML in a post is ignored rather than
 * rendered. That keeps `dangerouslySetInnerHTML` out of the codebase entirely.
 */

/**
 * A paragraph holding nothing but images becomes a figure. Several images share
 * a row; one renders at article width. The first image's Markdown title is used
 * as the shared caption; an image without a title gets no caption, because alt
 * text describes the image for assistive technology rather than captioning it.
 *
 * A post can narrow a figure by adding `?w=` to the image path, e.g.
 * `![alt](/images/pass.jpg?w=280 "Caption")`, which centres it at that pixel
 * width and stays responsive below it. Sizing is therefore opt-in per figure
 * rather than a site-wide rule.
 *
 * Either way a figure is `article-wide`: it is measured against the full
 * content column rather than the narrower text measure around it. Its spacing
 * and caption type live with the rest of the article rhythm in globals.css.
 *
 * Each image declares the intrinsic size read from its own file, so the box is
 * reserved at the right ratio before it loads. The same size is handed to CSS
 * as `--img-w` / `--img-ratio`, which is how globals.css caps an image at its
 * natural width and a tall image at a screen-friendly height without either
 * value depending on the file having arrived.
 */
function figureSrc(img: Tokens.Image): { src: string; maxWidth?: number } {
  const [src, query] = img.href.split('?')
  if (!query) return { src }
  const w = Number(new URLSearchParams(query).get('w'))
  return { src, maxWidth: Number.isFinite(w) && w > 0 ? w : undefined }
}

function ImageFigure({ images }: { images: Tokens.Image[] }) {
  const caption = images[0]?.title
  const { maxWidth } = figureSrc(images[0])

  return (
    <figure
      className={cn('not-prose article-wide', maxWidth && 'mx-auto')}
      style={maxWidth ? { maxWidth } : undefined}
    >
      <div className={images.length > 1 ? 'grid grid-cols-2 gap-3' : undefined}>
        {images.map((img) => {
          const { src } = figureSrc(img)
          const { width, height } = getImageSize(src)
          return (
            <Image
              key={src}
              src={src}
              alt={img.text}
              width={width}
              height={height}
              className="h-auto w-full rounded-lg"
              style={{ '--img-w': `${width}px`, '--img-ratio': width / height } as CSSProperties}
            />
          )
        })}
      </div>
      {caption && (
        <figcaption>{caption}</figcaption>
      )}
    </figure>
  )
}

function inline(tokens: Token[] | undefined, keyPrefix: string): ReactNode {
  if (!tokens) return null

  return tokens.map((token, i) => {
    const key = `${keyPrefix}-${i}`

    switch (token.type) {
      case 'text': {
        const t = token as Tokens.Text
        return t.tokens ? (
          <Fragment key={key}>{inline(t.tokens, key)}</Fragment>
        ) : (
          <Fragment key={key}>{t.text}</Fragment>
        )
      }
      case 'escape':
        return <Fragment key={key}>{(token as Tokens.Escape).text}</Fragment>
      case 'strong':
        return (
          <strong key={key} className="font-semibold">
            {inline((token as Tokens.Strong).tokens, key)}
          </strong>
        )
      case 'em':
        return <em key={key}>{inline((token as Tokens.Em).tokens, key)}</em>
      case 'del':
        return <del key={key}>{inline((token as Tokens.Del).tokens, key)}</del>
      case 'codespan':
        return <code key={key}>{(token as Tokens.Codespan).text}</code>
      case 'br':
        return <br key={key} />
      case 'link': {
        const t = token as Tokens.Link
        const external = /^https?:\/\//.test(t.href)
        return (
          <a
            key={key}
            href={t.href}
            title={t.title ?? undefined}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="text-brand underline decoration-brand/40 underline-offset-4 transition-colors hover:decoration-brand"
          >
            {inline(t.tokens, key)}
          </a>
        )
      }
      default:
        // Unhandled inline tokens (including raw html) contribute nothing.
        return null
    }
  })
}

function block(tokens: Token[], keyPrefix = 'b'): ReactNode {
  return tokens.map((token, i) => {
    const key = `${keyPrefix}-${i}`

    switch (token.type) {
      case 'heading': {
        const t = token as Tokens.Heading
        const children = inline(t.tokens, key)
        if (t.depth <= 1) {
          return (
            <h1 key={key} className="font-bold">
              {children}
            </h1>
          )
        }
        if (t.depth === 2) {
          return (
            <h2 key={key} className="font-semibold">
              {children}
            </h2>
          )
        }
        return (
          <h3 key={key} className="font-semibold">
            {children}
          </h3>
        )
      }

      case 'paragraph': {
        const t = token as Tokens.Paragraph

        // A paragraph holding only `[figure:<key>]` becomes that diagram.
        const Figure = resolveFigure(t.text)
        if (Figure) return <Figure key={key} />

        // A paragraph holding only images becomes a figure.
        const children = t.tokens ?? []
        const images = children.filter((c) => c.type === 'image') as Tokens.Image[]
        const onlyImages =
          images.length > 0 &&
          children.every(
            (c) => c.type === 'image' || (c.type === 'text' && !c.raw.trim())
          )
        if (onlyImages) return <ImageFigure key={key} images={images} />

        return (
          <p key={key}>{inline(t.tokens, key)}</p>
        )
      }

      case 'list': {
        const t = token as Tokens.List
        const items = t.items.map((item, j) => (
          <li key={`${key}-${j}`} className="text-foreground">
            {block(item.tokens, `${key}-${j}`)}
          </li>
        ))
        return t.ordered ? (
          <ol key={key} className="list-decimal">
            {items}
          </ol>
        ) : (
          <ul key={key} className="list-disc">
            {items}
          </ul>
        )
      }

      // List items wrap their content in `text` tokens; render them unwrapped
      // so a bullet does not gain a stray paragraph margin.
      case 'text': {
        const t = token as Tokens.Text
        return <Fragment key={key}>{inline(t.tokens ?? [], key)}</Fragment>
      }

      case 'code':
        return (
          <pre
            key={key}
            className="article-wide overflow-x-auto rounded-lg border border-border bg-muted/60 p-4 text-sm leading-relaxed"
          >
            <code className="font-mono">{(token as Tokens.Code).text}</code>
          </pre>
        )

      case 'blockquote':
        return (
          <blockquote
            key={key}
            className="border-l-2 border-border pl-4 italic text-muted-foreground"
          >
            {block((token as Tokens.Blockquote).tokens, key)}
          </blockquote>
        )

      case 'hr':
        return <hr key={key} className="border-border" />

      case 'space':
        return null

      default:
        // Unhandled block tokens (including raw html) contribute nothing.
        return null
    }
  })
}

export function Markdown({ children }: { children: string }) {
  const tokens = marked.lexer(children)
  return <>{block(tokens)}</>
}
