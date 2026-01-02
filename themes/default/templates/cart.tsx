import React, { useState, useEffect } from 'react';
import { Header, Footer } from '../index';
import { useNestPressHooks } from '../../../hooks/nestpress-hooks';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartTemplateProps {
  page?: any;
  primaryMenu?: any;
  footerMenu?: any;
  footerWidgets?: any[];
  header?: any;
}

/**
 * Cart Template (WooCommerce-like)
 * WordPress/WooCommerce equivalent: woocommerce/cart.php
 * 
 * Supports WordPress-like hooks:
 * - woocommerce_before_cart
 * - woocommerce_after_cart
 * - woocommerce_cart_totals_before_order_total
 * - woocommerce_proceed_to_checkout
 */
const CartTemplate: React.FC<CartTemplateProps> = ({ 
  page,
  primaryMenu,
  footerMenu,
  footerWidgets,
  header,
}) => {
  const { doAction, applyFilters } = useNestPressHooks();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('nestpress_cart');
    if (savedCart) {
      const items = JSON.parse(savedCart);
      // Apply filter to cart items (plugins can modify)
      setCartItems(applyFilters('woocommerce_cart_items', items));
    }
  }, []);

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    // Hook: woocommerce_before_cart_item_quantity_change
    doAction('woocommerce_before_cart_item_quantity_change', id, quantity);
    
    const updated = cartItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(updated);
    localStorage.setItem('nestpress_cart', JSON.stringify(updated));
    
    // Hook: woocommerce_after_cart_item_quantity_change
    doAction('woocommerce_after_cart_item_quantity_change', id, quantity);
  };

  const removeItem = (id: string) => {
    // Hook: woocommerce_before_cart_item_remove
    doAction('woocommerce_before_cart_item_remove', id);
    
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('nestpress_cart', JSON.stringify(updated));
    
    // Hook: woocommerce_after_cart_item_remove
    doAction('woocommerce_after_cart_item_remove', id);
  };

  const clearCart = () => {
    // Hook: woocommerce_before_cart_empty
    doAction('woocommerce_before_cart_empty');
    
    setCartItems([]);
    localStorage.removeItem('nestpress_cart');
    
    // Hook: woocommerce_after_cart_empty
    doAction('woocommerce_after_cart_empty');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Apply filters to cart calculations (plugins can add fees, discounts, etc.)
  const taxRate = applyFilters('woocommerce_tax_rate', 0.1);
  const tax = applyFilters('woocommerce_cart_tax', subtotal * taxRate, subtotal);
  const shippingCost = applyFilters('woocommerce_shipping_cost', 0, cartItems);
  const total = applyFilters('woocommerce_cart_total', subtotal + tax + shippingCost, { subtotal, tax, shippingCost });

  return (
    <div className="cart-template woocommerce">
      <Header primaryMenu={primaryMenu} header={header} />
      
      {/* Hook: woocommerce_before_cart */}
      <div className="hook-container">
        {doAction('woocommerce_before_cart')}
      </div>

      <div style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#1e293b' }}>
          {applyFilters('woocommerce_cart_page_title', 'Shopping Cart')}
        </h1>

        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8f9fa', borderRadius: '12px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
            <h2 style={{ fontSize: '1.5rem', color: '#64748b', marginBottom: '1rem' }}>Your cart is empty</h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Add some products to get started!</p>
            
            {/* Hook: woocommerce_cart_is_empty */}
            <div className="hook-container">
              {doAction('woocommerce_cart_is_empty')}
            </div>
            
            <a 
              href="/shop" 
              style={{ display: 'inline-block', padding: '12px 30px', background: '#667eea', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}
            >
              {applyFilters('woocommerce_return_to_shop_text', 'Continue Shopping')}
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
            <div>
              {/* Hook: woocommerce_before_cart_table */}
              <div className="hook-container">
                {doAction('woocommerce_before_cart_table')}
              </div>

              {cartItems.map((item, index) => {
                // Apply filter to each cart item
                const filteredItem = applyFilters('woocommerce_cart_item', item);
                
                return (
                  <div key={filteredItem.id}>
                    {/* Hook: woocommerce_before_cart_item */}
                    <div className="hook-container">
                      {doAction('woocommerce_before_cart_item', filteredItem, index)}
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '1rem' }}>
                      <div style={{ width: 100, height: 100, background: filteredItem.image ? `url(${filteredItem.image}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem' }}>
                        {!filteredItem.image && '📦'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                          {applyFilters('woocommerce_cart_item_name', filteredItem.name, filteredItem)}
                        </h3>
                        <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#667eea' }}>
                          {applyFilters('woocommerce_cart_item_price', `$${filteredItem.price.toFixed(2)}`, filteredItem)}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.25rem' }}>
                          <button 
                            onClick={() => updateQuantity(filteredItem.id, filteredItem.quantity - 1)}
                            style={{ width: 32, height: 32, border: 'none', background: '#f8f9fa', borderRadius: '4px', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            −
                          </button>
                          <span style={{ minWidth: 40, textAlign: 'center', fontWeight: 600 }}>{filteredItem.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(filteredItem.id, filteredItem.quantity + 1)}
                            style={{ width: 32, height: 32, border: 'none', background: '#f8f9fa', borderRadius: '4px', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(filteredItem.id)}
                          style={{ padding: '0.5rem 1rem', border: 'none', background: '#fee2e2', color: '#dc2626', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Hook: woocommerce_after_cart_item */}
                    <div className="hook-container">
                      {doAction('woocommerce_after_cart_item', filteredItem, index)}
                    </div>
                  </div>
                );
              })}

              {/* Hook: woocommerce_after_cart_table */}
              <div className="hook-container">
                {doAction('woocommerce_after_cart_table')}
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <a 
                  href="/shop" 
                  style={{ flex: 1, padding: '12px', textAlign: 'center', border: '1px solid #667eea', color: '#667eea', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}
                >
                  Continue Shopping
                </a>
                <button 
                  onClick={clearCart}
                  style={{ flex: 1, padding: '12px', border: '1px solid #dc2626', background: '#fff', color: '#dc2626', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Clear Cart
                </button>
              </div>
            </div>

            <div>
              {/* Hook: woocommerce_before_cart_totals */}
              <div className="hook-container">
                {doAction('woocommerce_before_cart_totals')}
              </div>

              <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '2rem', position: 'sticky', top: '20px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1e293b' }}>Order Summary</h2>
                
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#64748b' }}>
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {/* Hook: woocommerce_cart_totals_before_shipping */}
                  <div className="hook-container">
                    {doAction('woocommerce_cart_totals_before_shipping')}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#64748b' }}>
                    <span>Shipping</span>
                    <span style={{ fontWeight: 600, color: shippingCost === 0 ? '#10b981' : '#1e293b' }}>
                      {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>${tax.toFixed(2)}</span>
                  </div>

                  {/* Hook: woocommerce_cart_totals_before_order_total */}
                  <div className="hook-container">
                    {doAction('woocommerce_cart_totals_before_order_total')}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>Total</span>
                  <span style={{ fontWeight: 700, color: '#667eea' }}>${total.toFixed(2)}</span>
                </div>

                {/* Hook: woocommerce_proceed_to_checkout */}
                <div className="hook-container">
                  {doAction('woocommerce_proceed_to_checkout')}
                </div>

                <a 
                  href="/checkout" 
                  style={{ display: 'block', width: '100%', padding: '14px', background: '#667eea', color: '#fff', textAlign: 'center', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '1rem' }}
                >
                  {applyFilters('woocommerce_proceed_to_checkout_text', 'Proceed to Checkout')}
                </a>

                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#eff6ff', borderRadius: '8px', fontSize: '0.875rem', color: '#1e40af' }}>
                  🔒 Secure Checkout - Your payment information is encrypted
                </div>
              </div>

              {/* Hook: woocommerce_after_cart_totals */}
              <div className="hook-container">
                {doAction('woocommerce_after_cart_totals')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hook: woocommerce_after_cart */}
      <div className="hook-container">
        {doAction('woocommerce_after_cart')}
      </div>

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
};

export default CartTemplate;
