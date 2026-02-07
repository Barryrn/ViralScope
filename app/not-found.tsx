import SplashCursor from '@/components/react-bits/splash-cursor'
import Link from 'next/link'
import { IconArrowRight } from '@tabler/icons-react'
import { getTranslations } from 'next-intl/server'

export default async function NotFoundPage() {
    const t = await getTranslations('errors')
    const tCommon = await getTranslations('common')

    return (
        <section className="h-screen w-screen flex flex-col items-center justify-center bg-black">
            <h1 className="text-6xl font-black tracking-tight text-white text-center">{t('pageNotFound')}</h1>
            <Link href="/">
                <div className="mt-16 bg-white text-black text-xl font-medium flex items-center justify-center px-6 py-3 rounded-full">
                    <span>{tCommon('home')}</span>
                    <IconArrowRight className="ml-2" />
                </div>
            </Link>
            <SplashCursor />
        </section>
    )
}