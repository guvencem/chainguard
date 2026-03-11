import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Supported locales
const locales = ['tr', 'en']
const defaultLocale = 'en'

// Get the preferred locale from the request
function getLocale(request: NextRequest) {
    const cookieLocale = request.cookies.get('cg_lang')?.value
    if (cookieLocale && locales.includes(cookieLocale)) {
        return cookieLocale
    }

    const acceptLanguage = request.headers.get('accept-language')
    if (acceptLanguage) {
        // Basic parser for Accept-Language header
        const preferredLocales = acceptLanguage
            .split(',')
            .map((lang) => lang.split(';')[0].trim().split('-')[0])

        for (const locale of preferredLocales) {
            if (locales.includes(locale)) return locale
        }
    }

    return defaultLocale
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Public files and API routes should not be localized
    if (
        pathname.startsWith('/_next') ||
        pathname.includes('/api/') ||
        pathname === '/favicon.ico' ||
        pathname === '/robots.txt' ||
        pathname === '/sitemap.xml' ||
        // If the path already has a locale, don't redirect
        locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)
    ) {
        return NextResponse.next()
    }

    // Redirect to localized path
    const locale = getLocale(request)
    request.nextUrl.pathname = `/${locale}${pathname}`

    const response = NextResponse.redirect(request.nextUrl)

    // Also set the cookie to remember the choice
    response.cookies.set('cg_lang', locale, { path: '/', maxAge: 31536000 })

    return response
}

export const config = {
    // Matcher ignoring `/_next/` and `/api/`
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
}
