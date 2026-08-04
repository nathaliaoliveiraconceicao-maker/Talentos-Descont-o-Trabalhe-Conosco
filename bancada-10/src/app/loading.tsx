export default function Loading() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto h-10 w-48 animate-pulse rounded bg-ink/10" />
      <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded bg-ink/5" />
        ))}
      </div>
    </div>
  )
}
