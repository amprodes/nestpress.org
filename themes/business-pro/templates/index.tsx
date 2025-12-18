/**
 * Business Pro - Index Template (Homepage)
 * Cloned from: https://pearl.stylemixthemes.com/businesstwo/
 * Dark hero, numbered features, video section, services grid, testimonials, stats
 */

import React from 'react';
import { Play, ArrowRight, CheckCircle, Users, Briefcase, Clock, Award, ChevronRight, Quote } from 'lucide-react';
import { getPostPermalink } from '../index';

const colors = {
  primary: '#0066cc',
  secondary: '#ff6600',
  dark: '#1a1a2e',
  darker: '#0f0f1a',
  text: '#333333',
  textLight: '#666666',
  background: '#ffffff',
  surface: '#f8f9fa',
  border: '#e5e5e5',
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
    {
      title: 'PLANNING & RESEARCH',
      description: "It's never been so easy to get your website up and running in 15 minutes! Just follow onscreen instructions! Please no worries, our super-friendly 24/7 support team is always ready to help you.",
      icon: '📊',
    },
    {
      title: 'FINANCIAL PLAN',
      description: 'Pearl includes over 250 custom page templates designed to suit your business needs. Import templates with one click, then modify pages without ever writing a single line of code.',
      icon: '💰',
    },
    {
      title: 'BUSINESS MANAGEMENT',
      description: 'Sell your goods easier with Online Store Functionality. Pearl provides endless opportunities to create a selling website featured by WooCommerce with great performance.',
      icon: '📈',
    },
    {
      title: 'INNOVATION/TRAINING',
      description: 'Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation X.',
      icon: '💡',
    },
  ];

  const features = [
    { icon: '⚡', title: 'OPERATIONAL EXCELLENCE', description: 'Bring to the table win-win survival strategies to ensure proactive domination.' },
    { icon: '🎯', title: 'INNOVATIVE SOLUTIONS', description: 'Podcasting operational change management inside of workflows.' },
    { icon: '🎪', title: 'TARGETING AND POSITIONING', description: 'Capitalize on low hanging fruit to identify a ballpark value added activity to beta test.' },
    { icon: '🛡️', title: 'BEST SUPPORT', description: 'Override the digital divide with additional clickthroughs from DevOps.' },
  ];

  const stats = [
    { number: '28', label: 'DURING PROJECTS', suffix: '+' },
    { number: '53', label: 'FINISHED PROJECTS', suffix: 'K' },
    { number: '102', label: 'HAPPY CLIENTS', suffix: '' },
    { number: '1.5', label: 'WORK HOURS', suffix: 'M' },
  ];

  const testimonials = [
    { name: 'John Smith', role: 'CEO, TechCorp', content: 'Leverage agile frameworks to provide a robust synopsis for high level overviews. Iterative approaches to corporate strategy foster collaborative thinking.', avatar: 'https://i.pravatar.cc/100?img=11' },
    { name: 'Sarah Johnson', role: 'Marketing Director', content: 'Organically grow the holistic world view of disruptive innovation via workplace diversity and empowerment. Taking seamless key performance indicators offline.', avatar: 'https://i.pravatar.cc/100?img=5' },
    { name: 'Michael Brown', role: 'Startup Founder', content: 'Podcasting operational change management inside of workflows to establish a framework. Keeping your eye on the ball while performing a deep dive.', avatar: 'https://i.pravatar.cc/100?img=12' },
  ];

  const numberedFeatures = [
    { num: '1', title: 'PRACTICAL BOOKING FUNCTIONALITY', desc: 'Iterative approaches to corporate strategy foster collaborative thinking to further the overall value proposition.' },
    { num: '2', title: 'IN REAL-TIME BOOKING', desc: 'Organically grow the holistic world view of disruptive innovation via workplace diversity and empowerment.' },
    { num: '3', title: 'SOCIAL MEDIA INTEGRATION', desc: 'Nanotechnology immersion along the information highway will close the loop on focusing solely on the bottom line.' },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Hero Section - Dark background with bold text */}
      <section style={{
        background: `linear-gradient(135deg, ${colors.darker} 0%, ${colors.dark} 100%)`,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ maxWidth: '700px' }}>
            <h1 style={{
              fontSize: '4.5rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
              marginBottom: '2rem',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
            }}>
              LIFE IS NOT FAIR;<br />
              <span style={{ color: colors.secondary }}>GET USED TO IT.</span>
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.8,
              marginBottom: '2.5rem',
              maxWidth: '500px',
            }}>
              Leverage agile frameworks to provide a robust synopsis for high level overviews. Iterative approaches to corporate strategy foster collaborative thinking.
            </p>
            <a
              href="/about"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 2rem',
                background: colors.secondary,
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                transition: 'all 0.3s ease',
              }}
            >
              Read More <ArrowRight size={18} />
            </a>
          </div>
        </div>

        {/* Decorative element */}
        <div style={{
          position: 'absolute',
          right: '-10%',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '600px',
          height: '600px',
          background: `linear-gradient(45deg, ${colors.primary}30, ${colors.secondary}20)`,
          borderRadius: '50%',
          filter: 'blur(100px)',
        }} />
      </section>

      {/* Numbered Features Section */}
      <section style={{ padding: '6rem 2rem', background: colors.background }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}>
            {numberedFeatures.map((feature, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '5rem',
                  fontWeight: 800,
                  color: colors.secondary,
                  lineHeight: 1,
                  marginBottom: '1rem',
                }}>
                  {feature.num}.
                </div>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: colors.dark,
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: colors.textLight, lineHeight: 1.7 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section with Image */}
      <section style={{ padding: '6rem 2rem', background: colors.surface }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=500&fit=crop"
                alt="Business team"
                style={{ width: '100%', height: '500px', objectFit: 'cover' }}
              />
              {/* Decorative orange corner */}
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                right: '-20px',
                width: '150px',
                height: '150px',
                background: colors.secondary,
              }} />
            </div>
            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: colors.dark,
                marginBottom: '1.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}>
                BRING TO THE TABLE WIN-WIN SURVIVAL STRATEGIES TO ENSURE PROACTIVE.
              </h2>
              <p style={{ color: colors.textLight, lineHeight: 1.8, marginBottom: '1.5rem' }}>
                Leverage agile frameworks to provide a robust synopsis for high level overviews. Iterative approaches to corporate strategy foster collaborative thinking to further the overall value proposition.
              </p>
              <p style={{ color: colors.textLight, lineHeight: 1.8, marginBottom: '2rem' }}>
                Organically grow the holistic world view of disruptive innovation via workplace diversity and empowerment.
              </p>
              <a
                href="/about"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: colors.primary,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                }}
              >
                Read More <ChevronRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section style={{
        background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=600&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '8rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '2rem',
            textTransform: 'uppercase',
          }}>
            HOW WE START BUSINESS WITH NO MONEY IN DAD'S GARAGE
          </h2>
          <button
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: colors.secondary,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s ease',
            }}
          >
            <Play size={40} fill="#fff" stroke="#fff" />
          </button>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '1.5rem' }}>
            Watch video
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section style={{ padding: '6rem 2rem', background: colors.background }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: colors.dark,
            marginBottom: '4rem',
            textAlign: 'center',
            textTransform: 'uppercase',
          }}>
            WHAT WE DO
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
            {services.map((service, idx) => (
              <a
                key={idx}
                href="/services"
                style={{
                  display: 'block',
                  padding: '2.5rem',
                  background: colors.surface,
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  borderBottom: `3px solid transparent`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderBottomColor = colors.secondary;
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderBottomColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: colors.dark,
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{service.icon}</span>
                  {service.title}
                </h3>
                <p style={{ color: colors.textLight, lineHeight: 1.7 }}>
                  {service.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section style={{
        background: colors.dark,
        padding: '5rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Quote size={60} style={{ color: colors.secondary, marginBottom: '2rem' }} />
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 600,
            color: '#ffffff',
            lineHeight: 1.6,
            marginBottom: '2rem',
            textTransform: 'uppercase',
          }}>
            I BELIEVE THAT IF YOU SHOW PEOPLE THE PROBLEMS AND YOU SHOW THEM THE SOLUTIONS THEY WILL BE MOVED TO ACT.
          </h2>
          <p style={{ color: colors.secondary, fontSize: '1.1rem', fontWeight: 600 }}>
            William Henry Gates
          </p>
        </div>
      </section>

      {/* Features + Stats Section */}
      <section style={{ padding: '6rem 2rem', background: colors.background }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
            {/* Left - Text content */}
            <div>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: colors.dark,
                marginBottom: '1.5rem',
                textTransform: 'uppercase',
              }}>
                AT THE END OF THE DAY, GOING FORWARD, A NEW NORMAL.
              </h2>
              <p style={{ color: colors.textLight, lineHeight: 1.8, marginBottom: '1.5rem' }}>
                Podcasting operational change management inside of workflows to establish a framework. Taking seamless key performance indicators offline to maximise the long tail.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  'Collaboratively administrate empowered markets via plug-and-play.',
                  'Dynamically procrastinate B2C users after installed base benefits.',
                  'Dramatically visualize customer directed convergence without revolutionary.',
                  'Organically grow the holistic view of disruptive innovation via workplace.',
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem', color: colors.textLight }}>
                    <CheckCircle size={18} style={{ color: colors.secondary, flexShrink: 0, marginTop: '0.2rem' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right - Features grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
              {features.map((feature, idx) => (
                <div key={idx} style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
                  <h3 style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: colors.dark,
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: colors.textLight, fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.dark} 100%)`,
        padding: '4rem 2rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
            {stats.map((stat, idx) => (
              <div key={idx}>
                <div style={{
                  fontSize: '3.5rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  lineHeight: 1,
                  marginBottom: '0.5rem',
                }}>
                  {stat.number}{stat.suffix}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        background: colors.secondary,
        padding: '3rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{
            color: '#ffffff',
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '1rem',
          }}>
            SUSPENDISSE ARCU, CONSECTETUR EGET URNA, CONDIMENTUM VOLUTPAT FELIS.
          </p>
          <a
            href="/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Read More <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '6rem 2rem', background: colors.surface }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: colors.dark,
            marginBottom: '4rem',
            textAlign: 'center',
            textTransform: 'uppercase',
          }}>
            CLIENTS SAY
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                style={{
                  background: colors.background,
                  padding: '2.5rem',
                  position: 'relative',
                }}
              >
                <Quote size={30} style={{ color: colors.secondary, marginBottom: '1rem', opacity: 0.3 }} />
                <p style={{
                  color: colors.textLight,
                  lineHeight: 1.8,
                  marginBottom: '2rem',
                  fontStyle: 'italic',
                }}>
                  "{testimonial.content}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    style={{ width: '60px', height: '60px', borderRadius: '50%' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: colors.dark }}>{testimonial.name}</div>
                    <div style={{ color: colors.textLight, fontSize: '0.9rem' }}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      {posts.length > 0 && (
        <section style={{ padding: '6rem 2rem', background: colors.background }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: colors.dark,
              marginBottom: '4rem',
              textAlign: 'center',
              textTransform: 'uppercase',
            }}>
              LATEST NEWS
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
              {posts.slice(0, 3).map((post, idx) => (
                <article key={post.id} style={{ background: colors.surface }}>
                  <div style={{ aspectRatio: '16/10', overflow: 'hidden' }}>
                    <img
                      src={post.featuredImage || `https://picsum.photos/600/400?random=${idx + 50}`}
                      alt={post.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ color: colors.textLight, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      {new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: colors.dark,
                      marginBottom: '1rem',
                      lineHeight: 1.4,
                    }}>
                      {post.title}
                    </h3>
                    <a
                      href={getPostPermalink(post)}
                      style={{
                        color: colors.primary,
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
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
