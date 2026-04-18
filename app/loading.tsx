export default function Loading() {
  return (
    <div className="container-page py-8 space-y-6">
      <div className="skeleton h-48 w-full" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-64 w-full" />
        ))}
      </div>
    </div>
  );
}
