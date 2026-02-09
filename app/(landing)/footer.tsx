import { ViralScopeLogo } from '@/components/logo'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function FooterSection() {
    const t = await getTranslations('landing.footer')
    const tCommon = await getTranslations('common')

    return (
        <footer className="py-16 md:py-24 border-t">
            <div className="mx-auto max-w-5xl px-6">
                <Link
                    href="/"
                    aria-label={t('goHome')}
                    className="flex mx-auto gap-2 items-center size-fit">
                    <ViralScopeLogo />
                    <span className="text-xl font-bold">{tCommon('appName')}</span>
                </Link>

                <p className="text-muted-foreground text-center mt-6 text-sm max-w-md mx-auto">
                    {t('tagline')}
                </p>

                <span className="text-muted-foreground block text-center text-sm mt-8">
                    © {new Date().getFullYear()} {tCommon('appName')}. {t('copyright')}
                </span>
            </div>
        </footer>
    )
}
