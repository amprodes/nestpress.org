/**
 * StartIt Product - Index Template (Homepage)
 * Cloned from: https://startit.qodeinteractive.com/product-landing-page/
 * Product landing with hero, features, product showcase, pricing, parallax sections
 */

import React from 'react';
import { ArrowRight, Check, Play, Clock, Wifi, Battery, Smartphone, Settings, ChevronRight, Mail, MapPin, Phone } from 'lucide-react';
import { getPostPermalink } from '../index';

const colors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  yellow: '#eab308',
  dark: '#0f172a',
  text: '#1e293b',
  textLight: '#64748b',
  background: '#ffffff',
  surface: '#f8fafc',
  border: '#e2e8f0',
};

interface IndexTemplateProps {
  posts: any[];
  pages: any[];
  products: any[];
  siteSettings: any;
  theme: any;
}

const IndexTemplate: React.FC<IndexTemplateProps> = ({ posts, pages, products, siteSettings }) => {
  const productFeatures = [
    { icon: '🎯', title: 'Pixel-Perfect Design', desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut' },
    { icon: '🔌', title: 'Free Plugins Included', desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut' },
    { icon: '📚', title: 'Extensive Documentation', desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut' },
    { icon: '🛒', title: 'WooCommerce', desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut' },
  ];

  const pricingPlans = [
    { name: 'Basic Pack', price: '99', features: ['Lorem ipsum dolor sit amet', 'Consectetuer adipiscing elit', 'Sed diam nonummy nibh', 'Euismod tincidunt ut laoreet dolore', 'Magna aliquam'] },
    { name: 'Original Pack', price: '150', features: ['Lorem ipsum dolor sit amet', 'Consectetuer adipiscing elit', 'Sed diam nonummy nibh', 'Euismod tincidunt ut laoreet dolore', 'Magna aliquam'], popular: true },
    { name: 'Premium Pack', price: '199', features: ['Lorem ipsum dolor sit amet', 'Consectetuer adipiscing elit', 'Sed diam nonummy nibh', 'Euismod tincidunt ut laoreet dolore', 'Magna aliquam'] },
    { name: 'Ultimate Pack', price: '250', features: ['Lorem ipsum dolor sit amet', 'Consectetuer adipiscing elit', 'Sed diam nonummy nibh', 'Euismod tincidunt ut laoreet dolore', 'Magna aliquam'] },
  ];

  const footerPosts = [
    'Schools to Hold Programming Courses In 2016',
    'The Future Of Online And Mobile Banking',
    'New Limited Edition Line Of Quality Headphones',
    'Changing The Way We Look At Telecommunication',
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: colors.background }}>
      {/* Top Bar */}
      <div style={{ background: colors.dark, padding: '0.75rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="mailto:startit@example.com" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', textDecoration: 'none' }}>
              startit@qodeinteractive.com
            </a>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>+1234567890</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${colors.dark} 0%, #1e1b4b 100%)`,
        position: 'relative',
        overflow: 'hidden',
        padding: '0 2rem',
      }}>
        {/* Background circles */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          background: `radial-gradient(circle, ${colors.primary}20 0%, transparent 60%)`,
          borderRadius: '50%',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <p style={{
                color: colors.yellow,
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
              }}>
                The New Product Is Available.
              </p>
              <h1 style={{
                fontSize: '4rem',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.1,
                marginBottom: '1.5rem',
              }}>
                Make Your Awesome Business Idea A Reality With <span style={{ color: colors.yellow }}>StartIt</span>
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.8,
                marginBottom: '2rem',
              }}>
                The Fresh New Theme From Select. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
              </p>
              <a
                href="#features"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem 2rem',
                  background: colors.yellow,
                  color: colors.dark,
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                LEARN MORE
              </a>
            </div>
            <div style={{ textAlign: 'center' }}>
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop"
                alt="Smart Watch Product"
                style={{
                  maxWidth: '400px',
                  width: '100%',
                  filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.4))',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product Features Section 1 */}
      <section id="features" style={{ padding: '6rem 2rem', background: colors.background }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: colors.dark,
              marginBottom: '1rem',
            }}>
              The Watch Of The Future
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: colors.textLight,
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.8,
            }}>
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3rem', alignItems: 'center' }}>
            {/* Left features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {productFeatures.slice(0, 2).map((feature, idx) => (
                <div key={idx} style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.dark, marginBottom: '0.5rem' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: colors.textLight, lineHeight: 1.7, fontSize: '0.95rem' }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Center product image */}
            <div style={{ textAlign: 'center' }}>
              <img
                src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=500&fit=crop"
                alt="Smart Watch"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>

            {/* Right features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {productFeatures.slice(2, 4).map((feature, idx) => (
                <div key={idx} style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.dark, marginBottom: '0.5rem' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: colors.textLight, lineHeight: 1.7, fontSize: '0.95rem' }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <a
              href="/features"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: colors.primary,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              VIEW FEATURES <ChevronRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Connected Section */}
      <section style={{
        padding: '6rem 2rem',
        background: colors.surface,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <img
                src="https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=500&fit=crop"
                alt="Connected devices"
                style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '8px' }}
              />
            </div>
            <div>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: colors.dark,
                marginBottom: '1rem',
              }}>
                Be Connected. Anywhere. Anyway. Anytime.
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: colors.textLight,
                lineHeight: 1.8,
                marginBottom: '2rem',
              }}>
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
              </p>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wifi size={24} style={{ color: colors.primary }} />
                  <span style={{ fontWeight: 600, color: colors.dark }}>WiFi Ready</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Battery size={24} style={{ color: colors.primary }} />
                  <span style={{ fontWeight: 600, color: colors.dark }}>Long Battery</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Smartphone size={24} style={{ color: colors.primary }} />
                  <span style={{ fontWeight: 600, color: colors.dark }}>Mobile Sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '6rem 2rem', background: colors.background }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: colors.dark,
              marginBottom: '1rem',
            }}>
              Choose The Best Deal For The Best Experience.
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: colors.textLight,
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                style={{
                  padding: '2.5rem 1.5rem',
                  background: plan.popular ? colors.dark : colors.surface,
                  textAlign: 'center',
                  position: 'relative',
                  borderRadius: '8px',
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: colors.yellow,
                    color: colors.dark,
                    padding: '0.5rem 1rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}>
                    BEST CHOICE
                  </div>
                )}
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: plan.popular ? colors.yellow : colors.textLight,
                  marginBottom: '1.5rem',
                }}>
                  {plan.name}
                </h3>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 800,
                  color: plan.popular ? '#ffffff' : colors.dark,
                  marginBottom: '0.25rem',
                }}>
                  $ {plan.price}
                </div>
                <div style={{
                  color: plan.popular ? 'rgba(255,255,255,0.6)' : colors.textLight,
                  fontSize: '0.9rem',
                  marginBottom: '2rem',
                }}>
                  Monthly
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', textAlign: 'left' }}>
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 0',
                        borderTop: `1px solid ${plan.popular ? 'rgba(255,255,255,0.1)' : colors.border}`,
                        color: plan.popular ? 'rgba(255,255,255,0.8)' : colors.textLight,
                        fontSize: '0.9rem',
                      }}
                    >
                      <Check size={16} style={{ color: plan.popular ? colors.yellow : colors.primary, flexShrink: 0 }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href="/pricing"
                  style={{
                    display: 'inline-block',
                    padding: '0.875rem 1.5rem',
                    background: plan.popular ? colors.yellow : 'transparent',
                    border: plan.popular ? 'none' : `2px solid ${colors.dark}`,
                    color: plan.popular ? colors.dark : colors.dark,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  READ MORE
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Share Section */}
      <section style={{
        padding: '5rem 2rem',
        background: `linear-gradient(rgba(99,102,241,0.95), rgba(139,92,246,0.95)), url('https://images.unsplash.com/photo-1510017803434-a899398421b3?w=1600&h=400&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          color: '#ffffff',
          marginBottom: '1.5rem',
        }}>
          Share & Connect With The New Watch
        </h2>
        <p style={{
          fontSize: '1.1rem',
          color: 'rgba(255,255,255,0.8)',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.
        </p>
      </section>

      {/* More Features Section */}
      <section style={{ padding: '6rem 2rem', background: colors.background }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: colors.dark,
                marginBottom: '1rem',
              }}>
                Choose The Best Deal For The Best Experience.
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: colors.textLight,
                lineHeight: 1.8,
                marginBottom: '2rem',
              }}>
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {productFeatures.slice(0, 3).map((feature, idx) => (
                  <div key={idx}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: colors.dark, marginBottom: '0.5rem' }}>
                      {feature.title}
                    </h3>
                    <p style={{ color: colors.textLight, lineHeight: 1.7, fontSize: '0.95rem' }}>
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=600&fit=crop"
                alt="Product showcase"
                style={{ width: '100%', borderRadius: '8px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '6rem 2rem',
        background: colors.dark,
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '1rem',
          }}>
            What Are You Waiting For?
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
            marginBottom: '2.5rem',
            maxWidth: '600px',
            margin: '0 auto 2.5rem',
          }}>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <a
              href="/features"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                background: 'transparent',
                border: '2px solid rgba(255,255,255,0.3)',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              LEARN MORE
            </a>
            <a
              href="/buy"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                background: colors.yellow,
                color: colors.dark,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              BUY THE THEME
            </a>
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      {posts.length > 0 && (
        <section style={{ padding: '6rem 2rem', background: colors.surface }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: colors.dark,
              textAlign: 'center',
              marginBottom: '4rem',
            }}>
              Latest Posts
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {posts.slice(0, 4).map((post, idx) => (
                <article key={post.id}>
                  <div style={{ aspectRatio: '4/3', overflow: 'hidden', marginBottom: '1rem', borderRadius: '4px' }}>
                    <img
                      src={post.featuredImage || `https://picsum.photos/400/300?random=${idx + 90}`}
                      alt={post.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: colors.dark,
                    lineHeight: 1.4,
                  }}>
                    <a href={getPostPermalink(post)} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {post.title}
                    </a>
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section style={{
        padding: '4rem 2rem',
        background: colors.background,
        borderTop: `1px solid ${colors.border}`,
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.dark, marginBottom: '1rem' }}>
            Newsletter
          </h3>
          <p style={{ color: colors.textLight, marginBottom: '1.5rem' }}>
            Lorem ipsum dolor sit amet
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="email"
              placeholder="Your email address"
              style={{
                flex: 1,
                padding: '1rem 1.25rem',
                border: `1px solid ${colors.border}`,
                fontSize: '1rem',
              }}
            />
            <button
              style={{
                padding: '1rem 1.5rem',
                background: colors.dark,
                border: 'none',
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IndexTemplate;
