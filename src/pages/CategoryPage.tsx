import React from "react";
import { useParams, Link } from "react-router-dom";
import { Header, Footer, DecorativeBackground } from '@/components/layout';
import ProductCard from '@/features/products/components/ProductCard';
import { useCategoryPage } from "@/features/categories";
import { useProductModal, ProductDetailModal } from "@/features/products";
import { formatCurrency } from "@/lib/formatters";

/**
 * CategoryPage Component
 * Displays products filtered by category/subcategory
 *
 */
const CategoryPage: React.FC = () => {
  const { category, subcategory } = useParams<{ category: string; subcategory?: string }>();

  const { currentCategory, currentSubcategory, products, handleWishlistToggle, handleCartAdd, isProductInWishlist } =
    useCategoryPage({ categorySlug: category, subcategorySlug: subcategory });

  const {
    isModalOpen,
    selectedProduct,
    quantity,
    openProductModal,
    closeProductModal,
    setQuantity,
    handleAddToCartFromModal,
    handleToggleWishlistFromModal,
    isProductInWishlist: isModalProductInWishlist,
  } = useProductModal({
    onAddToCart: (product) => handleCartAdd(undefined as any, product.id),
    onToggleWishlist: (product) => handleWishlistToggle(undefined as any, product.id),
    isInWishlist: isProductInWishlist,
  });

  if (!currentCategory) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-brand-darkBlue mb-4">Categoría no encontrada</h1>
            <Link to="/" className="text-brand-orange hover:underline">
              Volver al inicio
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      {/* Hero-style background section */}
      <section className="pt-24 md:pt-32 pb-8 bg-gradient-to-b from-brand-yellow to-white relative overflow-hidden">
        <DecorativeBackground />

        {/* Breadcrumb */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-brand-darkBlue text-white py-3 px-6 rounded-lg inline-block mb-6">
            <div className="flex items-center gap-2 text-sm uppercase font-semibold">
              <Link to="/" className="hover:text-brand-orange transition-colors">
                INICIO
              </Link>
              <span>/</span>
              <Link to={`/category/${currentCategory.slug}`} className="hover:text-brand-orange transition-colors">
                {currentCategory.name.toUpperCase()}
              </Link>
              {currentSubcategory && (
                <>
                  <span>/</span>
                  <span>{currentSubcategory.name.toUpperCase()}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Category Header */}
        <div className="container mx-auto px-4 py-6 relative z-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-darkBlue mb-2">
            {currentSubcategory ? currentSubcategory.name : currentCategory.name}
          </h1>
          <p className="text-gray-600">
            {currentSubcategory ? currentSubcategory.description : currentCategory.description}
          </p>
        </div>
      </section>

      <main>
        {/* Products Grid */}
        <div className="container mx-auto px-4 py-8 bg-white">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={formatCurrency(product.price)}
                  image={product.image_url || ''}
                  brand={product.brand}
                  category={currentCategory.name}
                  subcategory={currentSubcategory?.name}
                  stock={product.stock}
                  isWishlisted={isProductInWishlist(product.id)}
                  onToggleWishlist={handleWishlistToggle}
                  onAddToCart={handleCartAdd}
                  onProductClick={() => openProductModal(product)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay productos disponibles en esta categoría</p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <ProductDetailModal
        product={selectedProduct}
        open={isModalOpen}
        onOpenChange={closeProductModal}
        onAddToCart={handleAddToCartFromModal}
        onToggleWishlist={handleToggleWishlistFromModal}
        isInWishlist={isModalProductInWishlist}
        categoryName={currentCategory?.name}
        quantity={quantity}
        onQuantityChange={setQuantity}
      />
    </>
  );
};

export default CategoryPage;
