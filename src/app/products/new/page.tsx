export const runtime = "edge";
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  async function createProduct(formData: FormData) {
    'use server'
    const supabaseClient = await createClient()
    const { data: { user: currentUser } } = await supabaseClient.auth.getUser()

    if (!currentUser) return redirect('/login')

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const url = formData.get('url') as string
    const targetUser = formData.get('targetUser') as string
    const abortCondition = formData.get('abortCondition') as string

    const { data, error } = await supabaseClient
      .from('products')
      .insert({
        owner_id: currentUser.id,
        title,
        description,
        url,
        target_user: targetUser,
        abort_condition: abortCondition,
        // expires_at is automatically set by DB default value (90 days)
      })
      .select()

    if (error) {
      console.error(error)
      redirect('/products/new?error=Could not create product')
    }

    if (data && data.length > 0) {
      redirect(`/products/${data[0].id}`)
    } else {
      redirect('/')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-primary font-mono uppercase mb-8 flex items-center gap-3">
        <span className="w-3 h-3 bg-primary animate-pulse"></span>
        LAUNCH_NEW_MISSION
      </h1>

      <Card className="border-border/50 bg-card/60 shadow-2xl relative overflow-hidden">
        {/* Accent border top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>

        <CardHeader className="pt-8">
          <CardTitle className="text-xl font-bold tracking-wider">プロダクトを投稿する</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            3ヶ月間のMVP検証を開始します。投稿後、90日間のカウントダウンが始まります。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createProduct} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-primary/80 font-mono text-xs tracking-widest">01 _TITLE</Label>
              <Input id="title" name="title" required placeholder="プロダクト名" className="font-sans border-border/50 bg-background/50 focus-visible:ring-primary/50" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-primary/80 font-mono text-xs tracking-widest">02 _DESCRIPTION</Label>
              <Textarea id="description" name="description" required placeholder="解決する課題とソリューション" className="font-sans min-h-[100px] border-border/50 bg-background/50 focus-visible:ring-primary/50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url" className="text-primary/80 font-mono text-xs tracking-widest">03 _URL (OPTIONAL)</Label>
              <Input id="url" name="url" type="url" placeholder="https://..." className="font-sans border-border/50 bg-background/50 focus-visible:ring-primary/50" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="targetUser" className="text-primary/80 font-mono text-xs tracking-widest">04 _TARGET_USER</Label>
                <Input id="targetUser" name="targetUser" placeholder="例: 週末起業家" className="font-sans border-border/50 bg-background/50 focus-visible:ring-primary/50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="abortCondition" className="text-destructive/80 font-mono text-xs tracking-widest">05 _ABORT_CONDITION</Label>
                <Input id="abortCondition" name="abortCondition" placeholder="撤退ライン（売上0など）" className="font-sans border-destructive/30 bg-background/50 focus-visible:ring-destructive/50" />
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <Button type="submit" variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono tracking-widest px-8 uppercase border border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                INITIATE_LAUNCH
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
