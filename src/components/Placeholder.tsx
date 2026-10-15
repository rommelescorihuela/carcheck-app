export default function Placeholder({ titulo }: { titulo: string }) {
  return (
    <main className="grid min-h-svh place-items-center p-6">
      <h1 className="text-2xl font-semibold">{titulo}</h1>
    </main>
  )
}
