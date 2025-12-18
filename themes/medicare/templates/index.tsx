/**
 * MediCare - Index Template (Homepage)
 * Cloned from: https://pearl.stylemixthemes.com/medical/
 * Medical clinic with hero slider, departments, doctors, prices, appointment form
 */

import React from 'react';
import { Phone, Mail, Clock, MapPin, ArrowRight, ChevronRight, Stethoscope, Heart, Eye, Brain, Beaker, Smile, Activity, Ambulance, Users, Award, Calendar, Star } from 'lucide-react';
import { getPostPermalink } from '../index';

const colors = {
  primary: '#00a8e8',
  secondary: '#003459',
  accent: '#00d4aa',
  dark: '#1a1a2e',
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
  const topBarInfo = [
    { icon: MapPin, text: '51 Uxbridge Road, San Francisco W7 3PX' },
    { icon: Phone, text: '020 8567 0707' },
    { icon: Clock, text: 'Mon — Sat: 8 am — 5 pm' },
  ];

  const highlights = [
    { icon: Beaker, title: 'RESEARCH', desc: 'Pre-order today just for $879 per tooth' },
    { icon: Ambulance, title: 'AMBULANCE', desc: 'Affordable french braces for kids and adults' },
    { icon: Award, title: 'SPECIALISTS', desc: 'Top standards and high quality' },
  ];

  const departments = [
    { icon: Stethoscope, title: 'ENT Center', desc: 'Deals with conditions of the ear, nose, and throat (ENT) and related structures of the head and neck.' },
    { icon: Activity, title: 'Traumatology', desc: 'Injuries caused by accidents or violence to a person, and the surgical therapy and repair of the damage.' },
    { icon: Eye, title: 'Ophthalmology', desc: 'The branch of medicine that deals with the anatomy, physiology and diseases of the eyeball.' },
    { icon: Heart, title: 'Cardiology', desc: 'Congenital heart defects, coronary artery disease, heart failure, valvular heart disease and electrophysiology.' },
    { icon: Beaker, title: 'Laboratory', desc: 'Tests are done on clinical specimens in order to obtain information about the health of a patient.' },
    { icon: Smile, title: 'Dentistry', desc: 'The oral mucosa, and of adjacent and related structures and tissues, particularly in the maxillofacial area.' },
  ];

  const doctors = [
    { name: 'John Gordon', role: 'Practice Principal', image: 'https://i.pravatar.cc/200?img=60' },
    { name: 'Grace Taylor', role: 'Associate Otolaryngologist', image: 'https://i.pravatar.cc/200?img=32' },
    { name: 'Sarah Mitchell', role: 'Cardiologist', image: 'https://i.pravatar.cc/200?img=44' },
    { name: 'Robert Henderson', role: 'Oral Health Therapist', image: 'https://i.pravatar.cc/200?img=53' },
  ];

  const prices = [
    { name: 'Surgery', price: '150', desc: "It's a virtually undetectable, comfortable and hygienic system used to improve your smile." },
    { name: 'Cosmetic Dentistry', price: '40', desc: 'Do you feel a shooting pain in your teeth when eating or drinking something hot?' },
    { name: 'Rotavirus Test', price: '100', desc: 'As dental professionals we believe in preventive dental care.' },
    { name: 'Eye Examination', price: '120', desc: 'Root canal therapy may be required to save the remaining tooth structure.' },
  ];

  const stats = [
    { number: '15', label: 'years of experience' },
    { number: '79', label: 'visited conferences' },
    { number: '452', label: 'smiling clients' },
    { number: '14', label: 'master certifications' },
  ];

  const testimonials = [
    { name: 'Amanda Wilson', content: 'The staff was incredibly professional and caring. My treatment was explained thoroughly and I felt comfortable throughout the entire process.', rating: 5 },
    { name: 'Michael Chen', content: 'Best medical clinic I have ever visited. The doctors are knowledgeable and the facilities are state of the art. Highly recommended!', rating: 5 },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Top Bar */}
      <div style={{ background: colors.secondary, padding: '0.75rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {topBarInfo.map((info, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                <info.icon size={14} />
                <span>{info.text}</span>
              </div>
            ))}
          </div>
          <a
            href="/appointment"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: colors.primary,
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <Calendar size={14} /> Make an Appointment
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <section style={{
        background: `linear-gradient(rgba(0,52,89,0.85), rgba(0,52,89,0.85)), url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&h=800&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        padding: '0 2rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ maxWidth: '650px' }}>
            <p style={{ color: colors.primary, fontWeight: 600, marginBottom: '1rem', fontSize: '1rem' }}>
              FIRST AID MEDICAL CLINIC
            </p>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: '1.5rem',
            }}>
              Your Health is our<br />
              <span style={{ color: colors.primary }}>Highest Priority</span>
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.8,
              marginBottom: '2rem',
            }}>
              With over 30 years of dental experience and experience with implants, we are experts in all facets of dentistry services.
            </p>
            <a
              href="/about"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 2rem',
                background: colors.primary,
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
              }}
            >
              Read More <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Highlights Bar */}
      <section style={{ background: colors.background, padding: '0', marginTop: '-60px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            {highlights.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '2.5rem 2rem',
                  background: idx === 1 ? colors.primary : colors.background,
                  textAlign: 'center',
                }}
              >
                <item.icon size={40} style={{ color: idx === 1 ? '#ffffff' : colors.primary, marginBottom: '1rem' }} />
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: idx === 1 ? '#ffffff' : colors.dark,
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {item.title}
                </h3>
                <p style={{ color: idx === 1 ? 'rgba(255,255,255,0.8)' : colors.textLight, fontSize: '0.9rem' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section style={{ padding: '6rem 2rem', background: colors.background }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: colors.dark,
            textAlign: 'center',
            marginBottom: '4rem',
          }}>
            About our Clinic
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <img
                src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=450&fit=crop"
                alt="Medical clinic"
                style={{ width: '100%', height: '450px', objectFit: 'cover', borderRadius: '8px' }}
              />
            </div>
            <div>
              <p style={{ color: colors.textLight, lineHeight: 1.9, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                Our Medical Clinic is dedicated to providing the most up to date general, orthodontic and family dentistry.
              </p>
              <p style={{ color: colors.textLight, lineHeight: 1.9, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                Our Clinic has grown to provide a world class facility for the treatment of tooth loss, dental cosmetics and advanced restorative dentistry.
              </p>
              <p style={{ color: colors.textLight, lineHeight: 1.9, marginBottom: '2rem', fontSize: '1.05rem' }}>
                We are among the most qualified implant providers in the USA with over 35 years of quality training and experience.
              </p>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: `1px solid ${colors.border}` }}>
                {stats.map((stat, idx) => (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: colors.primary }}>{stat.number}</div>
                    <div style={{ fontSize: '0.75rem', color: colors.textLight, textTransform: 'uppercase' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section style={{ padding: '6rem 2rem', background: colors.surface }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: colors.dark,
            textAlign: 'center',
            marginBottom: '4rem',
          }}>
            Our Departments
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {departments.map((dept, idx) => (
              <div
                key={idx}
                style={{
                  padding: '2.5rem',
                  background: colors.background,
                  borderRadius: '8px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `${colors.primary}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                }}>
                  <dept.icon size={36} style={{ color: colors.primary }} />
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: colors.dark,
                  marginBottom: '1rem',
                }}>
                  {dept.title}
                </h3>
                <p style={{ color: colors.textLight, lineHeight: 1.7, fontSize: '0.95rem' }}>
                  {dept.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section style={{ padding: '6rem 2rem', background: colors.background }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: colors.dark,
            textAlign: 'center',
            marginBottom: '4rem',
          }}>
            Our Doctors
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
            {doctors.map((doctor, idx) => (
              <div
                key={idx}
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  position: 'relative',
                  marginBottom: '1.5rem',
                  overflow: 'hidden',
                  borderRadius: '50%',
                  width: '180px',
                  height: '180px',
                  margin: '0 auto 1.5rem',
                  border: `4px solid ${colors.primary}`,
                }}>
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: colors.dark,
                  marginBottom: '0.5rem',
                }}>
                  {doctor.name}
                </h3>
                <p style={{ color: colors.primary, fontSize: '0.9rem' }}>
                  {doctor.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '6rem 2rem', background: colors.surface }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: colors.dark,
            textAlign: 'center',
            marginBottom: '4rem',
          }}>
            Our Prices
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {prices.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.5rem 2rem',
                  background: colors.background,
                  borderRadius: '8px',
                  borderLeft: `4px solid ${colors.primary}`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.dark, marginBottom: '0.5rem' }}>
                    {item.name}
                  </h3>
                  <p style={{ color: colors.textLight, fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {item.desc}
                  </p>
                </div>
                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: colors.primary,
                  marginLeft: '2rem',
                }}>
                  ${item.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appointment Form Section */}
      <section style={{
        padding: '6rem 2rem',
        background: `linear-gradient(rgba(0,52,89,0.9), rgba(0,52,89,0.9)), url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&h=600&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '3rem',
          }}>
            Request Appointment
          </h2>
          <form style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Name*"
              style={{
                padding: '1rem 1.25rem',
                border: 'none',
                background: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                fontSize: '1rem',
              }}
            />
            <input
              type="text"
              placeholder="Phone*"
              style={{
                padding: '1rem 1.25rem',
                border: 'none',
                background: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                fontSize: '1rem',
              }}
            />
            <input
              type="text"
              placeholder="Date*"
              style={{
                padding: '1rem 1.25rem',
                border: 'none',
                background: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                fontSize: '1rem',
              }}
            />
            <input
              type="text"
              placeholder="Time*"
              style={{
                padding: '1rem 1.25rem',
                border: 'none',
                background: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                fontSize: '1rem',
              }}
            />
            <textarea
              placeholder="Your Message"
              rows={4}
              style={{
                gridColumn: 'span 2',
                padding: '1rem 1.25rem',
                border: 'none',
                background: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                fontSize: '1rem',
                resize: 'vertical',
              }}
            />
            <div style={{ gridColumn: 'span 2', textAlign: 'center' }}>
              <button
                type="submit"
                style={{
                  padding: '1rem 3rem',
                  background: colors.primary,
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                Make an Appointment
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '6rem 2rem', background: colors.background }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: colors.dark,
            textAlign: 'center',
            marginBottom: '4rem',
          }}>
            Our Happy Clients
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '2.5rem',
                  background: colors.surface,
                  borderRadius: '8px',
                  borderLeft: `4px solid ${colors.primary}`,
                }}
              >
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={18} fill={colors.primary} stroke={colors.primary} />
                  ))}
                </div>
                <p style={{ color: colors.textLight, lineHeight: 1.8, marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  "{item.content}"
                </p>
                <div style={{ fontWeight: 700, color: colors.dark }}>— {item.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      {posts.length > 0 && (
        <section style={{ padding: '6rem 2rem', background: colors.surface }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: colors.dark,
              textAlign: 'center',
              marginBottom: '4rem',
            }}>
              Latest News
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
              {posts.slice(0, 3).map((post, idx) => (
                <article key={post.id} style={{ background: colors.background, borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '16/10', overflow: 'hidden' }}>
                    <img
                      src={post.featuredImage || `https://picsum.photos/600/400?random=${idx + 70}`}
                      alt={post.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ color: colors.primary, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      {new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.dark, marginBottom: '1rem', lineHeight: 1.4 }}>
                      {post.title}
                    </h3>
                    <a
                      href={getPostPermalink(post)}
                      style={{
                        color: colors.primary,
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.9rem',
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
