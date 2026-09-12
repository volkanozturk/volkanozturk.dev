import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

export default function NotFound() {
  const locale = useLocale()
  const t = useTranslations('404')

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="bg-gradient-to-b from-foreground/25 to-foreground/5 bg-clip-text text-7xl font-bold text-transparent">
        404
      </p>
      <p className="text-muted-foreground">{t('message')}</p>
      <Link
        href={`/${locale}`}
        className="text-sm text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
      >
        {t('back')}
      </Link>
    </div>
  )
}
