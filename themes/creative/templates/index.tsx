/**
 * Creative Agency - Index Template (Homepage)
 * Cloned from: https://pearl.stylemixthemes.com/creative/
 * Dark creative agency with services, portfolio grid, stats, testimonials, pricing
 */

import React from 'react';
import { ArrowRight, ExternalLink, Share2, Facebook, Instagram, Quote, Check, Plus } from 'lucide-react';
import { getPostPermalink } from '../index';

const colors = {
  primary: '#ff6b35',
  secondary: '#1a1a2e',
  accent: '#f7c948',
  dark: '#0f0f1a',
  text: '#ffffff',
  textMuted: '#a0a0b0',
  background: '#0f0f1a',
  surface: '#1a1a2e',
  border: '#2a2a3e',
};

interface IndexTemplateProps {
  posts: any[];
  pages: any[];
  products: any[];
  siteSettings: any;
  theme: any;
}

const IndexTemplate: React.FC<IndexTemplateProps> = ({ posts, pages, products, siteSettings }) => {
  const services = [
    { title: 'Planning & Research', desc: "It's never been so easy to get your website up and running in 15 minutes! Just follow onscreen instructions!" },
    { title: 'Application Development', desc: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.' },
    { title: 'Social Media Marketing', desc: 'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius.' },
    { title: 'Web and App Design', desc: "It's never been so easy to get your website up and running in 15 minutes! Just follow onscreen instructions!" },
  ];

  const portfolio = [
    { id: 1, title: 'Project Alpha', category: 'Branding', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=600&fit=crop' },
    { id: 2, title: 'Project Beta', category: 'Web Design', image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=600&fit=crop' },
    { id: 3, title: 'Project Gamma', category: 'Development', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&fit=crop' },
    { id: 4, title: 'Project Delta', category: 'Marketing', image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=600&fit=crop' },
    { id: 5, title: 'Project Epsilon', category: 'App Design', image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=600&fit=crop' },
    { id: 6, title: 'Project Zeta', category: 'Branding', image: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=600&h=600&fit=crop' },
  ];

  const stats = [
    { number: '28', label: 'DURING PROJECTS' },
    { number: '53K', label: 'FINISHED PROJECTS' },
    { number: '102', label: 'HAPPY CLIENTS' },
    { number: '15M', label: 'WORK HOURS' },
  ];

  const testimonials = [
    { name: 'Sarah Mitchell', role: 'CEO, TechStart', content: 'Working with this creative agency has been an absolute pleasure. They delivered beyond our expectations and transformed our brand identity completely.', avatar: 'https://i.pravatar.cc/100?img=47' },
    { name: 'James Wilson', role: 'Founder, DesignLab', content: 'The team is incredibly talented and professional. Our website now looks stunning and performs better than ever. Highly recommend their services!', avatar: 'https://i.pravatar.cc/100?img=52' },
  ];

  const pricingPlans = [
    { name: 'STARTER', price: '36', features: ['POWER ELITE AUTHOR', '24/7 ELITE SUPPORT', 'THE BEST RATED THEME', '+32K HAPPY CUSTOMERS'] },
    { name: 'BASIC', price: '72', features: ['POWER ELITE AUTHOR', '24/7 ELITE SUPPORT', 'THE BEST RATED THEME', '+32K HAPPY CUSTOMERS'], popular: true },
    { name: 'PREMIUM', price: '99', features: ['POWER ELITE AUTHOR', '24/7 ELITE SUPPORT', 'THE BEST RATED THEME', '+32K HAPPY CUSTOMERS'] },
  ];

  return (
    <div style={{ background: colors.background, color: colors.text, fontFamily: 'Inter, sans-serif' }}>
      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '0 2rem',
        background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.surface} 100%)`,
      }}>
        {/* Animated background circles */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '400px',
          height: '400px',
          background: `radial-gradient(circle, ${colors.primary}15 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: `radial-gradient(circle, ${colors.accent}10 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(60px)',
        }} />

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '900px' }}>
          <h1 style={{
            fontSize: '5rem',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '2rem',
            letterSpacing: '-0.02em',
          }}>
            Creative Solutions,<br />
            <span style={{ color: colors.primary }}>Creative Results.</span>
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: colors.textMuted,
            lineHeight: 1.7,
            marginBottom: '3rem',
            maxWidth: '600px',
            margin: '0 auto 3rem',
          }}>
            We are a quickly evolving Digital Agency from the New York focused on the web development and digital advertising.
          </p>
          <a
            href="#portfolio"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1.25rem 2.5rem',
              background: colors.primary,
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              transition: 'all 0.3s ease',
            }}
          >
            Our Works <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* Services Section */}
      <section style={{ padding: '6rem 2rem', background: colors.surface }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: colors.primary,
            textAlign: 'center',
            marginBottom: '3rem',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
          }}>
            SERVICES
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
            {services.map((service, idx) => (
              <a
                key={idx}
                href="/services"
                style={{
                  display: 'block',
                  padding: '2.5rem',
                  background: colors.dark,
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  borderLeft: `3px solid transparent`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderLeftColor = colors.primary;
                  e.currentTarget.style.transform = 'translateX(10px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderLeftColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: colors.text,
                  marginBottom: '1rem',
                }}>
                  {service.title}
                </h3>
                <p style={{ color: colors.textMuted, lineHeight: 1.7 }}>
                  {service.desc}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section style={{ padding: '6rem 2rem', background: colors.dark }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: colors.primary,
                marginBottom: '1.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
              }}>
                ABOUT US
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: colors.textMuted,
                lineHeight: 1.9,
                marginBottom: '1.5rem',
              }}>
                We are a quickly evolving Digital Agency from the New York focused on the web development and digital advertising. We offer entire solutions and full long-term technical support in these areas.
              </p>
              <p style={{
                fontSize: '1.1rem',
                color: colors.textMuted,
                lineHeight: 1.9,
              }}>
                We enjoy cooperating with ambitious startups and developing the kind of products users love. Stay tuned!
              </p>
            </div>
            <div style={{
              aspectRatio: '4/3',
              background: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=450&fit=crop')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(45deg, ${colors.primary}30, transparent)`,
              }} />
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" style={{ padding: '6rem 2rem', background: colors.surface }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: colors.primary,
            textAlign: 'center',
            marginBottom: '3rem',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
          }}>
            LATEST WORKS
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {portfolio.map((item) => (
              <div
                key={item.id}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Plus size={30} color="#fff" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <a
              href="/portfolio"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 2rem',
                border: `2px solid ${colors.primary}`,
                color: colors.primary,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.primary;
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = colors.primary;
              }}
            >
              LOAD MORE
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '5rem 2rem',
        background: `linear-gradient(rgba(255,107,53,0.9), rgba(255,107,53,0.9)), url('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&h=400&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
            {stats.map((stat, idx) => (
              <div key={idx}>
                <div style={{
                  fontSize: '4rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  lineHeight: 1,
                  marginBottom: '0.5rem',
                }}>
                  {stat.number}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '6rem 2rem', background: colors.dark }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: colors.primary,
            textAlign: 'center',
            marginBottom: '3rem',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
          }}>
            TESTIMONIALS
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '2.5rem',
                  background: colors.surface,
                  position: 'relative',
                }}
              >
                <Quote size={40} style={{ color: colors.primary, opacity: 0.3, marginBottom: '1.5rem' }} />
                <p style={{
                  color: colors.textMuted,
                  lineHeight: 1.9,
                  marginBottom: '2rem',
                  fontSize: '1.05rem',
                  fontStyle: 'italic',
                }}>
                  "{item.content}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={item.avatar}
                    alt={item.name}
                    style={{ width: '60px', height: '60px', borderRadius: '50%' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: colors.text }}>{item.name}</div>
                    <div style={{ color: colors.primary, fontSize: '0.9rem' }}>{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '6rem 2rem', background: colors.surface }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: colors.primary,
            textAlign: 'center',
            marginBottom: '3rem',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
          }}>
            PRICING PLAN
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                style={{
                  padding: '3rem 2rem',
                  background: plan.popular ? colors.primary : colors.dark,
                  textAlign: 'center',
                  position: 'relative',
                  transform: plan.popular ? 'scale(1.05)' : 'none',
                }}
              >
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: plan.popular ? '#ffffff' : colors.textMuted,
                  marginBottom: '2rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>
                  {plan.name}
                </h3>
                <div style={{
                  fontSize: '4rem',
                  fontWeight: 800,
                  color: plan.popular ? '#ffffff' : colors.text,
                  marginBottom: '2rem',
                }}>
                  ${plan.price}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0' }}>
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      style={{
                        padding: '0.75rem 0',
                        borderTop: `1px solid ${plan.popular ? 'rgba(255,255,255,0.2)' : colors.border}`,
                        color: plan.popular ? 'rgba(255,255,255,0.9)' : colors.textMuted,
                        fontSize: '0.9rem',
                      }}
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href="/contact"
                  style={{
                    display: 'inline-block',
                    padding: '1rem 2rem',
                    background: plan.popular ? '#ffffff' : colors.primary,
                    color: plan.popular ? colors.primary : '#ffffff',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  GET STARTED
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '6rem 2rem',
        background: colors.dark,
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <p style={{
            color: colors.textMuted,
            marginBottom: '1.5rem',
            fontSize: '1rem',
          }}>
            Pearl Psychologist
          </p>
          <p style={{
            color: colors.text,
            fontSize: '1.1rem',
            lineHeight: 1.8,
            marginBottom: '2rem',
          }}>
            We always strive for growth and development as StylemixThemes. We don't want to have a large team, we want to have a team that works in unity. Our slogan is "Every day is the last day".
          </p>
          <a
            href="/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2rem',
              background: colors.primary,
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            GET STARTED <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* Latest Posts */}
      {posts.length > 0 && (
        <section style={{ padding: '6rem 2rem', background: colors.surface }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: colors.primary,
              textAlign: 'center',
              marginBottom: '3rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
            }}>
              LATEST NEWS
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
              {posts.slice(0, 3).map((post, idx) => (
                <article key={post.id} style={{ background: colors.dark }}>
                  <div style={{ aspectRatio: '16/10', overflow: 'hidden' }}>
                    <img
                      src={post.featuredImage || `https://picsum.photos/600/400?random=${idx + 80}`}
                      alt={post.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ color: colors.primary, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.text, marginBottom: '1rem', lineHeight: 1.4 }}>
                      {post.title}
                    </h3>
                    <a
                      href={getPostPermalink(post)}
                      style={{
                        color: colors.primary,
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      Read More <ArrowRight size={14} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default IndexTemplate;
