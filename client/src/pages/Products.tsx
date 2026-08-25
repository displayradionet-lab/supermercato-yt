/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Product } from '../types';
import { ChevronDown, Home, SlidersHorizontal, XIcon } from 'lucide-react';
import Loading from '../components/Loading';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import api from '../config/api';
import toast from 'react-hot-toast';
import { categoriesData } from '../assets/assets';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const organic = searchParams.get('organic') || '';
  const sort = searchParams.get('sort') || '';
  const page = Number(searchParams.get('page')) || 1;
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('products');
      console.log("📦 Dati ricevuti dal backend:", data);
      let allProducts: any[] = [];

      if (Array.isArray(data)) {
        allProducts = data;
      } else if (data && Array.isArray(data.products)) {
        allProducts = data.products;
      }

      let filtered = [...allProducts];

      if (category) {
        filtered = filtered.filter(
          (p) => p.category?.toLowerCase() === category.toLocaleLowerCase(),
        );
      }
      if (organic) {
        filtered = filtered.filter(
          (p) =>
            String(p.isOrganic) === organic || String(p.organic) === organic,
        );
      }
      if (minPrice) {
        filtered = filtered.filter((p) => p.price >= Number(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter((p) => p.price <= Number(maxPrice));
      }

      // Ordinamento sul frontend
      if (sort === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === 'rating') {
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      // paginazione
      const limit = 12;
      const total = Math.ceil(filtered.length / limit) || 1;
      const startIndex = (page - 1) * limit;
      const paginatedProducts = filtered.slice(startIndex, startIndex + limit);

      // Aggiornamento dello status
      setProducts(paginatedProducts);
      setTotalPages(total);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Something went wrong',
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => setSearchParams({});

  const activeCategory = categoriesData.find((c) => c.slug === category);
  const hasFilters = Boolean(category || organic || minPrice || maxPrice);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [category, organic, sort, page, minPrice, maxPrice]);

  return (
    <div className="min-h-screen bg-app-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* BreadCrumbs */}
        <nav className="flex items-center gap-2 text-sm text-app-text-light mb-6">
          <Link to={'/'} className="hover:text-app-cream transition-colors">
            <Home className="size-4" />
          </Link>
          <span>/</span>
          <span className="text-app-green font-medium">
            {activeCategory
              ? activeCategory.name
              : 'All Products - Tutti i prodotti'}
          </span>
        </nav>

        <div className="flex gap-8 xl:gap-10">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-2xl p-3 sticky top-24">
              <FilterPanel
                categories={categoriesData}
                category={category}
                organic={organic}
                minPrice={minPrice}
                maxPrice={maxPrice}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                hasFilters={hasFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1>
                  {activeCategory ? activeCategory.name : 'Tutti i prodotti'}
                </h1>
                <p>{products.length} prodotti trovati</p>
              </div>

              <div className="flex flc lg:items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm
                   bg-white rounded-xl border border-app-border
                    hover:bg-app-cream transition-colors"
                >
                  <SlidersHorizontal className="size-4" />
                  <span>Filtri</span>
                </button>

                {/* Sort dropdown */}
                <div className="relative">
                  <select
                    value={sort}
                   onChange={(e) => {
                      const newParams = new URLSearchParams(searchParams);
                      if (e.target.value) {
                        newParams.set('sort', e.target.value);
                      } else {
                        newParams.delete('sort');
                      }
                      setSearchParams(newParams);
                    }}
                    className="appearance-none pl-3 pr-8 py-2 text-sm bg-white rounded-xl
                    border border-app-border
                    focus:border-app-green outline-none cursor-pointer"
                  >
                    <option value="">Nuovi</option>
                    <option value="price_asc">Prezzi: in su'</option>
                    <option value="price_desc">Prezzi: in giu'</option>
                    <option value="rating">Top recensiti</option>
                    <option value="name">A - Z</option>
                  </select>
                  <ChevronDown
                    className="absolute right-2.5 top-1/2 -translate-y-1/2
                   w-3.5 h-3.5 text-app-text-light pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Product grid */}
            {loading ? (
              <Loading />
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg font-semibold text-app-green">
                  Nessun prodotto trovato
                </p>
                <p className="text-sm text-app-text-light mb-4">
                  Prova a cambiare i toui filtri o termini di ricerca
                </p>
                <button>Rimuovi filtri</button>
              </div>
            ) : (
              <div
                className="grid grid-cols-2 sm:grid-cols-3
               lg:grid-cols-4 gap-4 xl:gap-8"
              >
                {products.map(
                  (product) =>
                    product.stock > 0 && (
                      <ProductCard key={product.id} product={product} />
                    ),
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-16">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      updateFilter('page', String(i + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`size-9 rounded-lg text-sm font-medium transition-colors 
                    ${
                      page === i + 1
                        ? 'bg-app-green text-white'
                        : 'bg-white text-app-text-light hover:bg-app-cream'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          >
            <div className="relative w-full bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto z-10 p-4">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-app-border">
                <h3 className="text-lg font-semibold text-app-green">Filtri</h3>
                <button>
                  <XIcon className="size-5" />
                </button>
              </div>
              <FilterPanel
                categories={categoriesData}
                category={category}
                organic={organic}
                minPrice={minPrice}
                maxPrice={maxPrice}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                hasFilters={hasFilters}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
