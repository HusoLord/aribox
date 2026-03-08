'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="text-center space-y-4 p-8">
        <div className="text-6xl">🐝</div>
        <h1 className="text-2xl font-bold">Çevrimdışısınız</h1>
        <p className="text-muted-foreground">
          İnternet bağlantınız yok. Daha önce yüklenen içerikler görüntülenebilir.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-6 py-2 text-sm font-medium"
        >
          Yeniden Dene
        </button>
      </div>
    </div>
  )
}
