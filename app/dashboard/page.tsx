import { getTranslations } from 'next-intl/server'

export default async function DashboardPage() {
  const t = await getTranslations('dashboard.welcome')

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-3">
          {t('subtitle')}
        </p>
      </div>
    </div>
  )
}
