import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeroHeader } from "./header"
import { getTranslations } from 'next-intl/server'

export default async function HeroSection() {
    const t = await getTranslations('landing.hero')

    return (
        <>
            <HeroHeader />
            <main>
                <section className="min-h-[80vh] flex items-center">
                    <div className="py-20 md:py-32 w-full">
                        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
                            <h1 className="mx-auto text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                                {t('title')}
                            </h1>
                            <p className="text-muted-foreground mx-auto my-8 max-w-2xl text-balance text-lg md:text-xl">
                                {t('subtitle')}
                            </p>

                            <div className="flex items-center justify-center gap-4">
                                <Button asChild size="lg">
                                    <Link href="/dashboard">
                                        <span className="text-nowrap">{t('getStarted')}</span>
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="outline">
                                    <Link href="#features">
                                        <span className="text-nowrap">{t('learnMore')}</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
