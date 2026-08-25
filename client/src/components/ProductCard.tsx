import { useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { PlusIcon, StarIcon } from "lucide-react";
import { useCart } from "../context/CartContext";

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";
  const {addToCart} = useCart();
  const navigate = useNavigate();



  return (
    <div
      className="bg-yellow-100 rounded-2xl overflow-hidden shadow hover:shadow-md transition-all
       duration-300 group cursor-pointer flex flex-col justify-between"
      onClick={() => navigate(`/products/${product.id}`)}
    >
      {/* Box Immagine con altezza fissa */}
      <div className="relative w-full h-48 flex items-center justify-center overflow-hidden">
        <img
          src={product.image || "/images/placeholder.png"}
          alt={product.name}
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"       
          
        />

        {/* Badge Sconto */}
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-orange-500 text-white rounded-full">
              {product.discount}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Dettagli e Info Prodotto */}
      <div className="p-4 flex flex-col gap-1">
        <h3 className="font-semibold text-gray-800 text-base truncate">
          {product.name}
        </h3>

        {/* Valutazione in Stelle */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 my-1">
            <StarIcon className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-medium text-gray-700">
              {product.rating}
            </span>
            {product.reviewCount > 0 && (
              <span className="text-xs text-gray-400">
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Prezzo and Add */}
        <div className="flex items-center justify-between">
         <div className="flex items-center gap-1 truncate">
            <span className="text-base font-medium">
                {currency} {product.price.toFixed(1)}
            </span>
            <span className="text-xs text-app-text-light block">
                 {product.unit}
            </span>
            {product.originalPrice > product.price && (
                <span className="text-xs text-app-text-light 
                line-through ml-1.5">
                    {currency} {product.originalPrice.toFixed(1)}
                </span>
            )}
         </div>
         <button 
         onClick={(e) => {
            e.stopPropagation();
            addToCart(product)
         }}
         className="size-7 rounded-full bg-app-orange text-white flex-center shrink-0 
                    hover:bg-app-orange-dark transition-colors active:scale-95"
         >
            <PlusIcon />
         </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;