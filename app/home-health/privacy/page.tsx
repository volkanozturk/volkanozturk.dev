import type { Metadata } from 'next'
import Link from 'next/link'
import { EMAIL } from '@/lib/nav'
import { LegalList, LegalPage, LegalSection, Strong, legalLinkClass } from '@/components/legal-page'

const TITLE = 'Home Health privacy policy'
const DESCRIPTION =
  'What Home Health reads from Google Health, where it is stored, how long it is kept, and how disconnecting and deleting work.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/home-health/privacy' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/home-health/privacy', type: 'article' },
}

const external = { target: '_blank', rel: 'noopener noreferrer' } as const

export default function HomeHealthPrivacyPage() {
  return (
    <LegalPage title={TITLE} updated="25 October 2026">
      <p>
        <Link href="/home-health" className={legalLinkClass}>
          Home Health
        </Link>{' '}
        is the health section of Home, a private dashboard run by me, Volkan Öztürk, for my own
        use. I am its only user. This policy describes what it does with data from the Google
        Health API.
      </p>

      <LegalSection title="What it reads">
        <p>
          Access is granted on Google&rsquo;s consent screen and is <Strong>read-only</Strong>:
          Home Health never adds, changes or deletes anything in Google Health. With the
          permissions granted, it reads:
        </p>
        <LegalList>
          <li>
            <Strong>Activity and fitness:</Strong> steps, distance, floors, calories, active
            minutes and zones, activity levels, sedentary periods, swim lengths, exercise
            sessions and VO2 max.
          </li>
          <li>
            <Strong>Health metrics:</Strong> heart rate, heart rate variability, resting heart
            rate and heart rate zones, blood oxygen, breathing rate, skin and body temperature,
            weight, body fat, height and blood glucose.
          </li>
          <li>
            <Strong>Sleep:</Strong> sleep sessions and their stages.
          </li>
          <li>
            <Strong>Nutrition:</Strong> food and water logs and saved foods.
          </li>
          <li>
            <Strong>ECG and irregular rhythm notifications:</Strong> readings, their results and
            waveforms.
          </li>
          <li>
            <Strong>Exercise location:</Strong> the GPS route of exercises recorded with GPS.
          </li>
          <li>
            <Strong>Profile and settings:</Strong> age, account start date, stride lengths, units,
            time zone and language, and paired devices with the details Google provides about
            them (such as model, battery level and last sync time).
          </li>
          <li>
            <Strong>Context:</Strong> which device or app recorded each value, and the Google
            Health user ID of the connected account.
          </li>
        </LegalList>
        <p>
          It does not ask for your name, email address or contacts, or for reproductive health,
          logged symptoms or moods.
        </p>
      </LegalSection>

      <LegalSection title="How it is used">
        <p>
          The data is used only to show my own history, charts and an overview of which data is
          available, and to keep that import up to date. It is not sold, not used for
          advertising, not shared with anyone, and not used to train AI models. Home&rsquo;s
          Claude connector, which can read Home&rsquo;s energy and indoor-climate data, has no
          access to health data.
        </p>
        <p>
          Home Health&rsquo;s use and transfer of information received from Google APIs adheres
          to the{' '}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            className={legalLinkClass}
            {...external}
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements, and to the{' '}
          <a
            href="https://developers.google.com/health/policies/health-api-developer-user-data-policy"
            className={legalLinkClass}
            {...external}
          >
            Google Health API Developer and User Data Policy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Where it is stored">
        <LegalList>
          <li>
            <Strong>Cloudflare</Strong> runs Home (Cloudflare Workers) and stores the imported
            data in a Cloudflare D1 database located in Western Europe. D1 encrypts data at rest
            and in transit.
          </li>
          <li>
            <Strong>Cloudflare Access</Strong> protects the dashboard and every part of it that
            returns data: nothing is shown without a sign-in, and only my own account is
            admitted.
          </li>
          <li>
            <Strong>Google</Strong> is the source of the data (the Google Health API) and handles
            the sign-in and consent.
          </li>
        </LegalList>
        <p>
          No other service receives the data. The source code is kept on GitHub; it contains no
          health data. The access tokens Google issues are stored encrypted (AES-256-GCM) and are
          never shown in the dashboard. Health data is not written to logs: Home&rsquo;s logging
          is limited to counts, sizes and timings of each sync.
        </p>
      </LegalSection>

      <LegalSection title="How long it is kept">
        <p>
          Imported data is kept until I delete it; there is no automatic expiry, because keeping
          a long personal history is the purpose of Home Health. The database keeps a
          point-in-time recovery history for up to 7 days, so deleted data can still be restored
          from it for up to 7 days and is gone after that.
        </p>
      </LegalSection>

      <LegalSection title="Disconnecting and deleting">
        <p>
          <Strong>Disconnecting is not the same as deleting.</Strong>
        </p>
        <LegalList>
          <li>
            <Strong>Disconnect in Home:</Strong> Home revokes its access at Google, deletes its
            stored access tokens and stops reading data. Data imported before that{' '}
            <Strong>stays</Strong> in the database.
          </li>
          <li>
            <Strong>Revoke at Google</Strong> (Google Account &rarr; Security &rarr; Your
            connections to third-party apps &amp; services, or Apps and services in the Google
            Health app): Home can no longer read anything, and deletes its stored tokens at its
            next sync attempt. Imported data also <Strong>stays</Strong>.
          </li>
          <li>
            <Strong>Delete imported data:</Strong> removes the stored records, readings, daily
            totals, profile and device details, routes, data sources and sync state from the
            database. There is no button for this yet; as the operator I do it directly in the
            database, after disconnecting. It is then unrecoverable once the 7-day recovery
            history has passed.
          </li>
        </LegalList>
        <p>
          None of this changes the data Google keeps in your Google Health account; that is
          managed in the Google Health app and your Google Account.
        </p>
      </LegalSection>

      <LegalSection title="Changes and contact">
        <p>
          If Home Health starts handling data differently, this page is updated first and the
          date above changes. Questions or requests:{' '}
          <a href={`mailto:${EMAIL}`} className={legalLinkClass}>
            {EMAIL}
          </a>
          . See also the{' '}
          <Link href="/home-health/terms" className={legalLinkClass}>
            terms of use
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}
