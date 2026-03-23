export const runtime = "edge";
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function Index() {
  const supabase = await createClient()

  // Fetch products
  const { data: products } = await supabase
    .from('products')
    .select('id, title, description, target_user, created_at, expires_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary font-mono uppercase flex items-center gap-3">
          <span className="w-2 md:w-3 h-2 md:h-3 bg-primary rounded-sm hidden sm:inline-block"></span>
          ACTIVE_MISSIONS
        </h1>
        <Badge variant="outline" className="border-primary text-primary font-mono rounded-none text-xs md:text-sm px-3 py-1">
          {products?.length || 0} DEPLOYED
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => {
          const isExpired = new Date(product.expires_at) < new Date()
          const daysLeft = Math.max(0, Math.ceil((new Date(product.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))

          // Warning if less than 14 days
          const isWarning = daysLeft > 0 && daysLeft <= 14

          return (
            <Link key={product.id} href={`/products/${product.id}`} className="block group">
              <Card className="h-full border-border/60 bg-card/40 hover:bg-card/80 transition-all hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--primary),0.1)] rounded-none relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute left-0 top-0 w-[2px] h-full bg-border/40 group-hover:bg-primary/50 transition-colors"></div>
                
                <CardHeader className="pl-6 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <Badge 
                      variant="outline" 
                      className={`font-mono text-[10px] rounded-none border-t-0 border-l-0 ${
                        isExpired ? 'border-muted-foreground text-muted-foreground' : 
                        isWarning ? 'border-[#f97316] text-[#f97316]' : 'border-primary/50 text-primary/80'
                      }`}
                    >
                      {isExpired ? 'Terminated' : `T-MINUS ${daysLeft} DAYS`}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {product.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm text-muted-foreground mt-3 leading-relaxed">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-6 border-t border-border/30 pt-4 mt-auto">
                  <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                    <span className="text-primary/50">&gt; TARGET_USER:</span>
                    <span className="truncate">{product.target_user || 'ANY'}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}

        {(!products || products.length === 0) && (
          <div className="col-span-full py-24 text-center border border-dashed border-border/50 bg-card/20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <span className="w-2 h-2 bg-muted-foreground animate-ping rounded-full"></span>
            </div>
            <div className="text-muted-foreground font-mono text-sm tracking-widest">NO_ACTIVE_MISSIONS_DETECTED</div>
          </div>
        )}
      </div>
    </div>
  )
}
