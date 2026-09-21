import { Fragment } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { projectHost, type Project } from '@/content/projects'
import { resolveProjectIcon } from '@/components/project-icons'

/**
 * A project in the same card language as the post cards: one square tile, the
 * title and a short line, and quiet metadata underneath.
 *
 * These link off-site, so the card is not wrapped in an anchor the way a post
 * card is. Instead the single "Visit project" link is stretched over the card
 * with `after:inset-0`, which keeps the whole surface clickable while leaving
 * exactly one tab stop and one accessible name per card.
 */
export function ProjectCard({ project }: { project: Project }) {
  const { title, description, url, icon } = project
  const Icon = resolveProjectIcon(icon)

  return (
    <article className="group relative rounded-[10px] border border-border bg-card transition-colors duration-150 hover:border-foreground/25">
      <div className="flex items-start gap-4 p-4 sm:gap-5">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border sm:h-20 sm:w-20">
          {/* eslint-disable-next-line react-hooks/static-components -- `Icon` is looked up from the module-level `projectIcons` map, not created per render. */}
          {Icon ? <Icon /> : <div className="h-full w-full bg-muted" aria-hidden />}
        </div>

        {/*
          A column on phones, so the link wraps under the text at full width
          instead of being squeezed beside it; a row from 640px up, which is the
          desktop shape with the link on the right.
        */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-foreground transition-colors duration-150 group-hover:text-brand sm:text-[18px]">
              {title}
            </h3>

            <p className="mt-1 text-[14.5px] leading-[1.5] text-muted-foreground">
              {description}
            </p>

            <p className="mt-2 text-[12.5px] text-muted-foreground">{projectHost(url)}</p>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${title} (opens in a new tab)`}
            className="view-all inline-flex shrink-0 items-center gap-1 self-start text-[13px] font-medium text-brand after:absolute after:inset-0 after:content-['']"
          >
            Visit project
            <ArrowUpRight aria-hidden className="view-all-arrow h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  )
}

/** Same vertical rhythm as the post cards, wherever projects are listed. */
export function ProjectCardList({ projects }: { projects: Project[] }) {
  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <Fragment key={project.slug}>
          <ProjectCard project={project} />
        </Fragment>
      ))}
    </div>
  )
}
