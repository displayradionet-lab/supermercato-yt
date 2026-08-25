/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react"
import type { Product } from "../types"
import { Zap } from "lucide-react"
import Loading from "../components/Loading"
import ProductCard from "../components/ProductCard"
import api from "../config/api"
import toast from "react-hot-toast"

const FlashDeals = () => {
  const [products, setProducts] = useState<Product[]>([])
  // 💡 FIX 1: Imposta loading a true di default
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .get('/products/deals')
      .then((res) => {
        // 💡 FIX 2: Gestisce sia risposte come array diretto (res.data) sia come oggetto (res.data.products)
        const fetchedProducts = Array.isArray(res.data)
          ? res.data
          : res.data?.products || []
        setProducts(fetchedProducts)
      })
      .catch((error: any) => {
        // 💡 FIX 3: Optional chaining per evitare crash nel toast di errore
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Errore nel caricamento delle offerte"
        toast.error(message)
        setProducts([])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-app-cream">
      {/* Banner */}
      <div className="bg-linear-to-r from-app-orange to-app-orange-dark text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex-center gap-2 mb-3">
            <Zap className="size-6 fill-white" />
            <h1 className="text-3xl font-semibold">Flash Deals</h1>
            <Zap className="size-6 fill-white" />
          </div>
          <p className="text-white/80 max-w-md mx-auto">
            Tempi brevi per le offerte del giorno sui tuoi prodotti preferiti. <br />
            Approfittane prima della scadenza!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <Loading />
        ) : !products || products.length === 0 ? (
          <div className="text-center py-16">
            <Zap className="size-16 text-app-border mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-app-green mb-2">
              Nessuna Offerta per il momento! 😔
            </h2>
            <p className="text-sm text-app-text-light">
              Torna presto per fantastiche Offerte 😊
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FlashDeals