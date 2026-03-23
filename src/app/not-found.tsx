export const runtime = 'edge';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] font-mono">
      <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
      <p className="text-muted-foreground">PAGE_NOT_FOUND</p>
      <a href="/" className="mt-8 text-primary underline">RETURN_TO_BASE</a>
    </div>
  );
}
