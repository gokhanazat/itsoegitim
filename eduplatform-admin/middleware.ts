import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => req.cookies.get(n)?.value,
        set: (n, v, o) => { res.cookies.set({ name: n, value: v, ...o }) },
        remove: (n, o) => { res.cookies.set({ name: n, value: "", ...o }) },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const path = req.nextUrl.pathname

  // Public paths allowed without session
  const isPublicPath = path === "/" || path === "/login" || path === "/register" || path === "/admin/login"

  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (session) {
    // If logged in and trying to access auth pages, redirect to landing page
    if (isPublicPath && path !== "/") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // Guard admin paths
    if (path.startsWith("/dashboard") || path.startsWith("/manage-courses") || path.startsWith("/whitelist") || path.startsWith("/manage-certificates")) {
       const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
       if (profile?.role !== 'admin') return NextResponse.redirect(new URL("/home", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
