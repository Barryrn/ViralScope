"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useTranslations } from "next-intl"
import { LanguageToggle } from "@/components/language-toggle"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteHeader() {
  const pathname = usePathname()
  const t = useTranslations('dashboard.header')

  const getPageTitle = (path: string): string => {
    switch (path) {
      case "/dashboard/youtube":
        return t('youtube')
      case "/dashboard/saved":
        return t('saved')
      default:
        return t('page')
    }
  }

  const pageTitle = getPageTitle(pathname)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">{pageTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
