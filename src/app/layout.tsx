import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Geist } from 'next/font/google'
import './globals.css'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const fontSans = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const fontMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Run-up Base',
  description: 'MVP validation platform for individual developers (3 months limited).',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="ja" className={cn("dark", "font-sans", geist.variable)} suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col font-sans`} suppressHydrationWarning>
        <header className="border-b border-border/40 bg-card/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-primary tracking-wider flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary animate-pulse"></span>
              RUN-UP BASE
            </Link>
            <nav className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/products/new">
                    <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/20 hover:text-primary transition-all font-mono">
                      [TAKEOFF]
                    </Button>
                  </Link>
                  <form action="/auth/signout" method="post">
                    <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground hover:text-white">
                      Sign out
                    </Button>
                  </form>
                </>
              ) : (
                <Link href="/login">
                  <Button variant="default" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono">
                    [LOGIN]
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
