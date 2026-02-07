import { getTranslations } from 'next-intl/server'

export default async function FAQs() {
    const t = await getTranslations('landing.faqs')

    return (
        <section className="scroll-py-16 py-16 md:scroll-py-32 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-y-12 px-2 lg:[grid-template-columns:1fr_auto]">
                    <div className="text-center lg:text-left">
                        <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
                            {t('title')}
                        </h2>
                        <p>{t('subtitle')}</p>
                    </div>

                    <div className="divide-y divide-dashed sm:mx-auto sm:max-w-lg lg:mx-0">
                        <div className="pb-6">
                            <h3 className="font-medium">{t('refundPolicy.question')}</h3>
                            <p className="text-muted-foreground mt-4">{t('refundPolicy.answer')}</p>

                            <ol className="list-outside list-decimal space-y-2 pl-4">
                                <li className="text-muted-foreground mt-4">{t('refundPolicy.step1')}</li>
                                <li className="text-muted-foreground mt-4">{t('refundPolicy.step2')}</li>
                                <li className="text-muted-foreground mt-4">{t('refundPolicy.step3')}</li>
                            </ol>
                        </div>
                        <div className="py-6">
                            <h3 className="font-medium">{t('cancelSubscription.question')}</h3>
                            <p className="text-muted-foreground mt-4">{t('cancelSubscription.answer')}</p>
                        </div>
                        <div className="py-6">
                            <h3 className="font-medium">{t('upgradePlan.question')}</h3>
                            <p className="text-muted-foreground my-4">{t('upgradePlan.answer')}</p>
                            <ul className="list-outside list-disc space-y-2 pl-4">
                                <li className="text-muted-foreground">{t('upgradePlan.note1')}</li>
                                <li className="text-muted-foreground">{t('upgradePlan.note2')}</li>
                            </ul>
                        </div>
                        <div className="py-6">
                            <h3 className="font-medium">{t('phoneSupport.question')}</h3>
                            <p className="text-muted-foreground mt-4">{t('phoneSupport.answer')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
