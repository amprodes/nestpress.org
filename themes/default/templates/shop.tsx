import React from 'react';
import { Header, Footer } from '../index';
import { useNestPressHooks } from '../../../hooks/nestpress-hooks';

interface ShopTemplateProps {
  page?: any;
  products?: any[];
  primaryMenu?: any;
  footerMenu?: any;
  footerWidgets?: any[];
  header?: any;
  sidebarWidgets?: any[];
}

/**
 * Shop Template (WooCommerce-like)
 * WordPress/WooCommerce equivalent: woocommerce/archive-product.php
 * 
 * Supports WordPress-like hooks:
 * - woocommerce_before_shop_loop
 * - woocommerce_after_shop_loop
 * - woocommerce_before_main_content
 * - woocommerce_after_main_content
 */
const ShopTemplate: React.FC<ShopTemplateProps> = ({ 
  page,
  products = [],
  primaryMenu,
  footerMenu,
  footerWidgets,
  header,
  sidebarWidgets = [],
}) => {
  const { doAction, applyFilters } = useNestPressHooks();
  const [cart, setCart] = React.useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = React.useState<any[]>(products);
  const [productsPerRow, setProductsPerRow] = React.useState<number>(3);

  React.useEffect(() => {
    const savedCart = localStorage.getItem('nestpress_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Apply filters once when products change
  React.useEffect(() => {
    const applyProductFilters = async () => {
      const filtered = await applyFilters('woocommerce_products_list', products);
      const perRow = await applyFilters('woocommerce_products_per_row', 3);
      setFilteredProducts(filtered);
      setProductsPerRow(perRow);
    };
    applyProductFilters();
  }, [products, applyFilters]);

  const addToCart = (product: any) => {
    // Hook: woocommerce_before_add_to_cart
    doAction('woocommerce_before_add_to_cart', product);
    
    const currentCart = JSON.parse(localStorage.getItem('nestpress_cart') || '[]');
    const existing = currentCart.find((item: any) => item.id === product.id);
    
    if (existing) {
      existing.quantity += 1;
    } else {
      currentCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images?.[0]
      });
    }
    
    localStorage.setItem('nestpress_cart', JSON.stringify(currentCart));
    setCart(currentCart);
    
    // Hook: woocommerce_after_add_to_cart
    doAction('woocommerce_after_add_to_cart', product, currentCart);
    
    // Show notification
    const notification = document.createElement('div');
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px 24px; border-radius: 8px; font-weight: 600; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
    notification.textContent = `✓ ${product.name} added to cart!`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s';
      notification.style.opacity = '0';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 2000);
  };

  return (
    <div className="shop-template woocommerce">
      <Header primaryMenu={primaryMenu} header={header} />
      
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: sidebarWidgets.length > 0 ? '1fr 300px' : '1fr', gap: '2rem' }}>
        <main>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#1e293b', textAlign: 'center' }}>
            Shop
          </h1>
          
          <p style={{ fontSize: '1.1rem', color: '#475569', textAlign: 'center', marginBottom: '50px' }}>
            Browse our collection of amazing products
          </p>

          {filteredProducts && filteredProducts.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(auto-fill, minmax(${productsPerRow === 4 ? '220px' : productsPerRow === 2 ? '400px' : '280px'}, 1fr))`, 
              gap: '30px', 
              marginBottom: '40px' 
            }}>
              {filteredProducts.map((product: any) => {
                return (
                  <div 
                    key={product.id}
                    className="product-card"
                    style={{ 
                      background: '#fff', 
                      borderRadius: '12px', 
                      overflow: 'hidden', 
                      border: '1px solid #e2e8f0', 
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ 
                      width: '100%', 
                      height: '280px', 
                      background: product.images?.[0] ? `url(${product.images[0]}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '4rem'
                    }}>
                      {!product.images?.[0] && '📦'}
                    </div>

                    <div style={{ padding: '20px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '10px', color: '#1e293b' }}>
                        {product.name}
                      </h3>
                      
                      {product.description && (
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '15px', lineHeight: 1.6 }}>
                          {product.description.substring(0, 100)}...
                        </p>
                      )}

                      <div style={{ marginBottom: '15px' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#667eea' }}>
                          ${product.price?.toFixed(2) || '0.00'}
                        </span>
                      </div>

                      <button 
                        onClick={() => addToCart(product)}
                        style={{ 
                          width: '100%', 
                          padding: '12px', 
                          background: '#667eea', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '6px', 
                          fontSize: '1rem', 
                          fontWeight: 600, 
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#5568d3'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '20px' }}>
                🛍️ <strong>No products yet!</strong><br/><br/>
                Add your first product from the admin dashboard to start selling.
              </p>
              <a 
                href="#admin/products" 
                style={{ 
                  display: 'inline-block', 
                  marginTop: '20px', 
                  padding: '12px 30px', 
                  background: '#667eea', 
                  color: 'white', 
                  borderRadius: '5px', 
                  textDecoration: 'none', 
                  fontWeight: 'bold' 
                }}
              >
                Add Product
              </a>
            </div>
          )}
        </main>

        {/* Sidebar with widgets (if any) */}
        {sidebarWidgets.length > 0 && (
          <aside style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#1e293b' }}>Filters</h3>
            {sidebarWidgets.map((widget: any, index: number) => (
              <div key={index} style={{ marginBottom: '1.5rem' }}>
                {widget.content}
              </div>
            ))}
          </aside>
        )}
      </div>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
};

export default ShopTemplate;