import type { Metadata } from 'next'
import Link from 'next/link'
import { EMAIL } from '@/lib/nav'
import { LegalList, LegalPage, LegalSection, Strong, legalLinkClass } from '@/components/legal-page'

const TITLE = 'Home Health'
const DESCRIPTION =
  'A private, single-user dashboard that imports my own Google Health (Fitbit) data for personal charts and history.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/home-health' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/home-health', type: 'website' },
}

export default function HomeHealthPage() {
  return (
    <LegalPage title={TITLE}>
      <p>
        Home Health is the health section of <Strong>Home</Strong>, my private personal
        dashboard. It imports my own Fitbit data through the Google Health API, so I can keep
        the full history in one place and look at it in my own charts, next to the rest of my
        home data.
      </p>

      <LegalSection title="How it works">
        <LegalList>
          <li>
            I connect my Google Account once, on Google&rsquo;s own consent screen, and choose
            which permissions to grant. Home Health only asks for read-only access: it never
            adds, changes or deletes anything in Google Health.
          </li>
          <li>
            In the background it reads what my Fitbit records &mdash; activity, heart rate,
            sleep, body measurements, nutrition logs, ECG readings and related data &mdash; and
            stores it in a private database.
          </li>
          <li>
            The dashboard shows that history as charts and a list of which kinds of data are
            available, for my own use.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Who can use it">
        <p>
          Only me. Home Health is not a public service and has no sign-up: the dashboard and
          everything it stores sit behind a sign-in that admits only my own account. If you
          arrived here from a Google consent screen, it was not meant for you.
        </p>
      </LegalSection>

      <LegalSection title="Not medical advice">
        <p>
          Home Health is a personal record, not a medical device or service. It does not
          diagnose, treat or monitor any condition.
        </p>
      </LegalSection>

      <LegalSection title="Privacy and terms">
        <p>
          How the data is accessed, stored, kept and deleted is described in the{' '}
          <Link href="/home-health/privacy" className={legalLinkClass}>
            privacy policy
          </Link>
          . Using Home Health is covered by the{' '}
          <Link href="/home-health/terms" className={legalLinkClass}>
            terms of use
          </Link>
          .
        </p>
        <p>
          Questions? Write to{' '}
          <a href={`mailto:${EMAIL}`} className={legalLinkClass}>
            {EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <p className="text-sm">
        Google, Google Health and Fitbit are trademarks of Google LLC. Home Health is an
        independent personal project and is not affiliated with or endorsed by Google.
      </p>
    </LegalPage>
  )
}
