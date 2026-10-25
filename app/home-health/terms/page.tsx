import type { Metadata } from 'next'
import Link from 'next/link'
import { EMAIL } from '@/lib/nav'
import { LegalList, LegalPage, LegalSection, Strong, legalLinkClass } from '@/components/legal-page'

const TITLE = 'Home Health terms of use'
const DESCRIPTION =
  'Simple terms for Home Health: personal use only, no guarantee that data is complete or available, and not a medical service.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/home-health/terms' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/home-health/terms', type: 'article' },
}

export default function HomeHealthTermsPage() {
  return (
    <LegalPage title={TITLE} updated="25 October 2026">
      <p>
        These terms cover{' '}
        <Link href="/home-health" className={legalLinkClass}>
          Home Health
        </Link>
        , the health section of Home, a private dashboard run by me, Volkan Öztürk.
      </p>

      <LegalSection title="Personal use only">
        <p>
          Home Health exists for my own, non-commercial use. It is not offered to anyone else,
          has no sign-up, and only my own account can sign in.
        </p>
      </LegalSection>

      <LegalSection title="Not a medical service">
        <p>
          Home Health is <Strong>not a medical device or service</Strong> and does not give
          medical advice. It does not diagnose, treat or monitor any condition, and nothing it
          shows should be used to make medical decisions. Talk to a healthcare professional
          about your health, and call emergency services in an emergency.
        </p>
      </LegalSection>

      <LegalSection title="Data availability">
        <p>Home Health can only show what the Google Health API provides, so:</p>
        <LegalList>
          <li>
            Data appears only after a device has synced with the Google Health app, and may be
            delayed, incomplete, corrected later or missing.
          </li>
          <li>
            Only data covered by the permissions granted can be read, and only data types the
            API offers. Some scores shown in the Fitbit or Google Health app are not part of
            the API and are not available.
          </li>
          <li>
            Values are shown as Google provides them and can differ from what the Google Health
            app displays.
          </li>
          <li>
            Home runs on free plans with usage limits, so importing can pause and catch up
            later. Changes to the API, or access ending, can stop imports at any time.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="No warranty">
        <p>
          Home Health is provided as is, without any warranty of accuracy, completeness or
          availability, and it may change or stop at any time.
        </p>
      </LegalSection>

      <LegalSection title="Google services">
        <p>
          Google, the Google Health app and the Google Health API have their own terms and
          policies, which apply to their use. How Home Health handles the data it receives is
          described in the{' '}
          <Link href="/home-health/privacy" className={legalLinkClass}>
            privacy policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Changes and contact">
        <p>
          These terms may be updated; the date above shows the latest version. Questions:{' '}
          <a href={`mailto:${EMAIL}`} className={legalLinkClass}>
            {EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}
