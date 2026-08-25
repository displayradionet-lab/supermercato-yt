/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react"
import type { Product } from "../types"
import { Link, useSearchParams } from "react-router-dom";
import { Home, Search } from "lucide-react";
import Loading from "../components/Loading";
import ProductCard from "../components/ProductCard";
import api from "../config/api";
import toast from "react-hot-toast";


const SearchResults = () => {

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const query = searchParams.get('q') || searchParams.get("search") || "";
  const category = searchParams.get('category') || '';

  useEffect(()=> {
    if (!query && !category) {
      setProducts([]);
      setLoading(false);
      return;
    } 
    setLoading(true);

    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (category) params.set('category', category);

    api.get(`/products?${params.toString()}`)
    .then((res) => {
      setProducts(res.data.products || []);
    })
    .catch((error: any) => {
      toast.error(error.response?.data?.message || error?.message);
    })
    .finally(() => setLoading(false));


  },[query, category])

 
  return (
    <div className=" min-h-screen bg-app-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-app-text-light mb-6">
          <Link to={'/'} className="hover:text-app-green transition-colors">
          <Home  className="size-4"/>
          </Link>
          <span>/</span>
          <span className="text-app-green font-medium">search results</span>
        </nav>

        {/* Header */}
         <div className="mb-8">
          <h1 className="text-2xl font-semibold text-green-600">Results for "{query}"</h1>
          <p className="text-sm text-app-text-light">
            {loading ? "Searching..." : `${products.length} prodotti trovati`}
          </p>
        </div>

        {/* results */}
        {loading ? (
          <Loading />
        ) : (products.length === 0 ? (
          <div className="text-center py-20">
            <Search className="size-16 text-app-border mx-auto mb-4"/>
            <h2 className="text-xl font-semibold text-app-green mb-2">
              No results found
            </h2>
            <p className="text-sm text-app-text-light text-app-text-green
             mb-6 max-w-md mx-auto">
              Non abbiamo trovato nessun prodotto da quelli richiesti
              "{query}".
             </p>
            <Link to={'/products'} className="inline-flex px-5 py-2.5 bg-app-green text-white 
            text-sm font-medium rounded-lg">
            Vai ai prodotti...
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product}/>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchResults