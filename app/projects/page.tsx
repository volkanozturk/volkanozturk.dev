import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { ProjectCardList } from '@/components/project-card'
import { projects } from '@/content/projects'

const TITLE = 'Projects'
const DESCRIPTION = 'A few independent products and experiments I’ve built.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/projects' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/projects', type: 'website' },
}

export default function ProjectsPage() {
  return (
    <div className="space-y-12">
      <PageHeader title={TITLE} description={DESCRIPTION} />

      {/* Same quiet empty line the Writing index uses when it has nothing to list. */}
      {projects.length > 0 ? (
        <ProjectCardList projects={projects} />
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Nothing here yet.
        </p>
      )}
    </div>
  )
}
