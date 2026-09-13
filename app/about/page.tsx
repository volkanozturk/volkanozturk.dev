import type { Metadata } from 'next'
import Link from 'next/link'
import { EMAIL, socialLinks } from '@/lib/nav'
import { CopyEmailButton } from '@/components/copy-email'

const TITLE = 'About'
const DESCRIPTION =
  'Software engineer in the Netherlands, working with Java and backend systems — and the story behind this site.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/about', type: 'profile' },
}

const byLabel = Object.fromEntries(socialLinks.map((link) => [link.label, link.href]))

/** Inline link styling, matching the one used inside article prose. */
const linkClass =
  'text-brand underline decoration-brand/40 underline-offset-4 transition-colors duration-150 hover:decoration-brand'

export default function AboutPage() {
  return (
    <div className="animate-enter">
      <h1 className="text-[32px] font-bold leading-[1.12] tracking-[-0.035em] text-foreground sm:text-[40px]">
        Hi, I&rsquo;m Volkan.
      </h1>

      <div className="mt-6 max-w-[65ch] space-y-5 text-base leading-relaxed text-muted-foreground">
        <p>
          I&rsquo;m a software engineer based in the Netherlands, with more than ten years
          of experience working with Java and backend systems. I enjoy understanding how
          things work, solving practical problems, and building software that stays
          reliable beyond the happy path.
        </p>

        <p>
          In August 2022, my wife and I moved from Istanbul to the Netherlands with our
          poodle, Java. Our son, Atlas, was born in July 2024. Istanbul is still a big
          part of our lives, while the Netherlands is where we&rsquo;re building our
          family&rsquo;s future.
        </p>

        <p>
          This website is a place for lessons from software development, experiences from
          everyday life, and things I find worth sharing. I like simple, thoughtful design
          and clear explanations.
        </p>

        <p>
          For my career and education, visit{' '}
          <Link href="/journey" className={linkClass}>
            Journey
          </Link>
          . You can also find me on{' '}
          <a
            href={byLabel.GitHub}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            GitHub
          </a>
          ,{' '}
          <a
            href={byLabel.LinkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            LinkedIn
          </a>
          , and{' '}
          <a
            href={byLabel['X (Twitter)']}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            X
          </a>
          .
        </p>

        <p>
          Have a question or something you&rsquo;d like to share? Say hello at{' '}
          <a href={`mailto:${EMAIL}`} className={linkClass}>
            {EMAIL}
          </a>
          . <CopyEmailButton />
        </p>
      </div>
    </div>
  )
}
