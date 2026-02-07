'use client'
import { PricingTable } from "@clerk/nextjs";
import { dark } from '@clerk/themes'
import { useTheme } from "next-themes"

export default function CustomClerkPricing() {
    const { theme } = useTheme()

    // PricingTable requires Clerk billing to be enabled
    // Enable at: https://dashboard.clerk.com/last-active?path=billing/settings
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_CLERK_BILLING_ENABLED) {
        return (
            <div className="text-center p-8 border rounded-lg">
                <p className="text-muted-foreground">
                    Pricing table requires Clerk billing to be enabled.
                </p>
            </div>
        )
    }

    return (
        <>
            <PricingTable
                appearance={{
                    baseTheme: theme === "dark" ? dark : undefined,
                    elements: {
                        pricingTableCardTitle: { // title
                            fontSize: 20,
                            fontWeight: 400,
                        },
                        pricingTableCardDescription: { // description
                            fontSize: 14
                        },
                        pricingTableCardFee: { // price
                            fontSize: 36,
                            fontWeight: 800,  
                        },
                        pricingTable: {
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        },
                    },
                }}
                
            />
        </>
    )
}