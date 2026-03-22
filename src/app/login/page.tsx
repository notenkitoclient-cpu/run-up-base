import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github } from 'lucide-react'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    return redirect('/')
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm border-border bg-card shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-primary">Run-up Base</CardTitle>
          <CardDescription className="mt-2 text-sm text-muted-foreground">
            コックピットへようこそ。<br/>認証を完了して滑走路へ進んでください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/auth/github" method="post" className="mt-4">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2 border-primary/50 hover:bg-primary/10 hover:text-primary transition-all" type="submit">
              <Github className="w-5 h-5" />
              GitHubでログイン
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
