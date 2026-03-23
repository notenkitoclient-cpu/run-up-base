export const runtime = "edge";
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { revalidatePath } from 'next/cache'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  // Fetch product
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) {
    notFound()
  }

  // Fetch feedbacks
  const { data: feedbacks } = await supabase
    .from('feedbacks')
    .select('*')
    .eq('product_id', id)
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()

  const isOwner = user?.id === product.owner_id
  const hasFeedback = feedbacks?.some(f => f.user_id === user?.id)
  const canFeedback = user && !isOwner && !hasFeedback

  const isExpired = new Date(product.expires_at) < new Date()
  const daysLeft = Math.max(0, Math.ceil((new Date(product.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))

  // Server action
  async function submitFeedback(formData: FormData) {
    'use server'
    const supabaseClient = await createClient()
    const { data: { user } } = await supabaseClient.auth.getUser()
    
    if (!user) return

    const score_share = parseInt(formData.get('score_share') as string)
    const will_pay = formData.get('will_pay') === 'yes'
    const max_price_yenStr = formData.get('max_price_yen') as string
    const max_price_yen = max_price_yenStr ? parseInt(max_price_yenStr) : null
    const useless_feature = formData.get('useless_feature') as string
    const comment = formData.get('comment') as string

    await supabaseClient.from('feedbacks').insert({
      product_id: id,
      user_id: user.id,
      score_share,
      will_pay_boolean: will_pay,
      max_price_yen,
      useless_feature,
      comment
    })

    revalidatePath(`/products/${id}`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 bg-primary rounded-sm hidden sm:inline-block"></span>
            <Badge variant="outline" className="border-primary/50 text-primary uppercase font-mono rounded-none tracking-widest text-[10px]">
              MISSION_DETAILS
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{product.title}</h1>
          {product.url && (
            <a href={product.url} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 transition-colors mt-2 inline-block font-mono text-sm underline underline-offset-4 decoration-primary/50">
              &gt; ACCESS_EXTERNAL_LINK 
            </a>
          )}
        </div>
        <div className="flex flex-col items-end">
          <Badge 
            className={`font-mono text-xs md:text-sm px-4 py-1.5 rounded-none border border-transparent ${
              isExpired ? 'bg-muted text-muted-foreground' : 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_10px_rgba(var(--primary),0.2)]'
            }`}
          >
            {isExpired ? 'TERMINATED' : `T-MINUS ${daysLeft} DAYS`}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-mono text-primary/80 border-b border-border/40 pb-2">_DESCRIPTION</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">
              {product.description}
            </p>
          </section>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <section className="space-y-2 bg-card/40 p-5 border border-border/40 hover:border-border/80 transition-colors">
              <h2 className="text-sm font-mono text-primary/60 tracking-widest">_TARGET_USER</h2>
              <p className="font-mono text-sm text-foreground/90">{product.target_user || 'UNSPECIFIED'}</p>
            </section>
            <section className="space-y-2 bg-destructive/10 p-5 border border-destructive/20 hover:border-destructive/40 transition-colors">
              <h2 className="text-sm font-mono text-destructive/80 tracking-widest">_ABORT_CONDITION</h2>
              <p className="font-mono text-sm text-destructive font-bold">{product.abort_condition || 'UNSPECIFIED'}</p>
            </section>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-mono text-primary/80 border-b border-border/40 pb-2 flex justify-between items-center">
            <span>_VALIDATION_DATA</span>
            <span className="text-xs text-muted-foreground">{feedbacks?.length || 0} LOGS</span>
          </h2>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {feedbacks?.length === 0 ? (
              <div className="text-sm font-mono text-muted-foreground/60 border border-dashed border-border/50 p-6 text-center bg-card/10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border border-muted-foreground/20 flex items-center justify-center mb-2">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full"></span>
                </div>
                NO_DATA_YET
              </div>
            ) : (
              feedbacks?.map((fb, index) => (
                <Card key={fb.id} className="border-border/40 bg-card/40 rounded-none relative overflow-hidden group hover:border-primary/30 transition-colors">
                  <div className={`absolute left-0 top-0 w-1 h-full ${fb.will_pay_boolean ? 'bg-primary/50' : 'bg-destructive/50'}`}></div>
                  <CardHeader className="p-4 pb-2 border-b border-border/20">
                    <div className="flex justify-between items-center">
                      <div className="font-mono text-xs text-primary/70 tracking-wider">VALIDATOR_{String(feedbacks.length - index).padStart(3, '0')}</div>
                      <Badge variant="outline" className={`rounded-none text-[10px] tracking-wider ${fb.will_pay_boolean ? 'border-primary/50 text-primary' : 'border-destructive/50 text-destructive'}`}>
                        {fb.will_pay_boolean ? 'WILL_PAY' : 'NO_PAY'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-3 space-y-3 font-sans">
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-background/50 p-2 rounded-sm border border-border/30">
                      <div><span className="text-muted-foreground mr-1">SHARE:</span><span className="text-primary">{fb.score_share}</span>/5</div>
                      {fb.will_pay_boolean && fb.max_price_yen && (
                        <div><span className="text-muted-foreground mr-1">MAX:</span><span className="text-primary">¥{fb.max_price_yen}</span></div>
                      )}
                    </div>
                    {fb.useless_feature && (
                      <div className="text-xs pt-2 border-t border-border/10">
                        <span className="text-destructive/80 font-mono block mb-1">_USELESS_FEATURE:</span>
                        <span className="text-muted-foreground line-clamp-2">{fb.useless_feature}</span>
                      </div>
                    )}
                    {fb.comment && (
                      <div className="text-xs pt-1">
                        <span className="text-primary/70 font-mono block mb-1">_COMMENT:</span>
                        <span className="text-foreground/90 line-clamp-3">{fb.comment}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {canFeedback && !isExpired && (
        <Card className="border-primary/30 mt-12 bg-card/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),1)]"></div>
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="tracking-widest font-mono text-lg text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary block animate-pulse"></span>
              SUBMIT_VALIDATION_DATA
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              入江メソッドに基づき、忖度のないシビアなフィードバックをお願いします。（回答は「VALIDATOR_XXX」として匿名化されます）
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form action={submitFeedback} className="space-y-6">
              <div className="space-y-4 p-5 border border-border/50 bg-background/50 hover:border-primary/30 transition-colors">
                <Label htmlFor="score_share" className="text-base text-foreground">
                  <span className="font-mono text-primary/80 mr-2">Q1.</span> 
                  このサービスを、今すぐ誰か（特定の友人やSNS）に紹介したいですか？ <span className="text-muted-foreground text-sm font-mono ml-2">(1: 全く思わない - 5: 強く思う)</span>
                </Label>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map(num => (
                    <label key={num} className="flex flex-col items-center gap-2 cursor-pointer group">
                      <input type="radio" name="score_share" value={num} required className="peer sr-only" />
                      <div className="w-12 h-12 flex items-center justify-center border border-border/60 bg-card peer-checked:border-primary peer-checked:bg-primary/20 peer-checked:text-primary transition-all rounded-none font-mono text-lg shadow-sm hover:border-primary/50">
                        {num}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4 p-5 border border-border/50 bg-background/50 hover:border-primary/30 transition-colors">
                <Label className="text-base block text-foreground">
                  <span className="font-mono text-primary/80 mr-2">Q2.</span> 
                  実際に自分のお金を払ってでも<span className="underline decoration-primary/50 underline-offset-4">使い続けたい</span>ですか？
                </Label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer group p-3 border border-border/40 bg-card hover:border-primary/50 transition-colors min-w-[120px]">
                    <input type="radio" name="will_pay" value="yes" required className="accent-primary w-5 h-5 focus:ring-primary" />
                    <span className="font-mono text-primary font-bold">YES</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group p-3 border border-border/40 bg-card hover:border-destructive/50 transition-colors min-w-[120px]">
                    <input type="radio" name="will_pay" value="no" className="accent-destructive w-5 h-5 focus:ring-destructive" />
                    <span className="font-mono text-destructive font-bold">NO</span>
                  </label>
                </div>
                
                <div className="mt-8 space-y-3 pt-6 border-t border-border/30">
                  <Label htmlFor="max_price_yen" className="text-sm text-foreground">
                     <span className="font-mono text-primary/80 mr-2">Q2-1.</span> 
                     (Yesの場合) 月額いくらまでなら納得して払いますか？
                  </Label>
                  <div className="relative max-w-[200px]">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">¥</span>
                    <Input id="max_price_yen" name="max_price_yen" type="number" min="0" step="100" placeholder="1000" className="pl-8 font-mono border-border/60 bg-card focus-visible:ring-primary/50 h-12 rounded-none" />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <Label htmlFor="useless_feature" className="text-destructive/80 font-mono text-sm block mb-1 border-b border-destructive/20 pb-2">
                    _USELESS_FEATURES
                  </Label>
                  <p className="text-xs text-muted-foreground h-8">削っても問題ない、無駄な機能はありますか？</p>
                  <Textarea id="useless_feature" name="useless_feature" placeholder="（例）アカウント画像の設定機能はいらない" className="border-border/60 bg-background/50 h-32 rounded-none focus-visible:ring-destructive/50" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="comment" className="text-primary/80 font-mono text-sm block mb-1 border-b border-primary/20 pb-2">
                    _ADDITIONAL_COMMENTS
                  </Label>
                  <p className="text-xs text-muted-foreground h-8">その他、改善点や率直な感想</p>
                  <Textarea id="comment" name="comment" placeholder="忌憚のない意見をお願いします" className="border-border/60 bg-background/50 h-32 rounded-none focus-visible:ring-primary/50" />
                </div>
              </div>

              <div className="pt-6 border-t border-border/30 flex justify-end">
                <Button type="submit" className="bg-primary text-primary-foreground font-mono tracking-widest uppercase rounded-none hover:bg-primary/90 px-8 h-12 border border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.2)] hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all">
                  TRANSMIT_DATA
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!user && !isExpired && (
        <div className="mt-12 p-8 border border-dashed border-border/60 bg-card/20 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div className="text-muted-foreground font-mono mb-6 tracking-widest text-sm">VALIDATION_REQUIRES_AUTHORIZATION</div>
          <a href="/login" className="inline-flex h-10 items-center justify-center bg-primary text-primary-foreground px-8 text-sm font-mono hover:bg-primary/90 transition-colors border border-primary/50">
            AUTHORIZE [LOGIN]
          </a>
        </div>
      )}

      {hasFeedback && (
        <div className="mt-12 p-6 border border-primary/30 bg-primary/5 text-center flex flex-col items-center">
          <div className="text-primary font-mono select-none flex items-center justify-center gap-3 tracking-widest">
            <span className="w-2 h-2 rounded-full bg-primary block"></span>
            DATA_TRANSMISSION_COMPLETE
            <span className="w-2 h-2 rounded-full bg-primary block"></span>
          </div>
          <p className="text-sm text-foreground/80 mt-4 leading-relaxed max-w-lg mx-auto">ご協力ありがとうございました。一人のユーザーによる複数回のフィードバックは制限されており、提出済みのデータは既に送信されています。</p>
        </div>
      )}
    </div>
  )
}
