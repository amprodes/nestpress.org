import React, { useEffect } from 'react';
import { 
  ThemeTemplateProps, 
  Header, 
  Footer, 
  HeroBanner, 
  FeatureGrid, 
  PostsGrid,
  getPostPermalink 
} from '../index';
import { useNestPressHooks } from '../../../hooks/nestpress-hooks';

/**
 * Index Template (Front Page / Home)
 * WordPress equivalent: index.php, front-page.php
 * Uses reusable parts and patterns for WordPress-like structure
 */
const IndexTemplate: React.FC<ThemeTemplateProps> = ({ 
  posts = [],
  primaryMenu,
  footerMenu,
  footerWidgets,
  header,
}) => {
  const { doAction, applyFilters } = useNestPressHooks();

  // WordPress template hooks
  useEffect(() => {
    doAction('template:index:loaded', { posts });
    return () => {
      doAction('template:index:unloaded');
    };
  }, [posts]);

  // Define features for the FeatureGrid pattern
  const features = [
    { icon: '🚀', title: 'Fast & Modern', description: 'Built with React 19 & NestJS for blazing fast performance' },
    { icon: '🎨', title: 'Beautiful Themes', description: 'Install and customize themes like WordPress, but better' },
    { icon: '🔌', title: 'Hook System', description: 'Powerful WordPress-like hooks with TypeScript safety' },
    { icon: '🛒', title: 'E-Commerce', description: 'Built-in Shopify-like commerce features out of the box' },
    { icon: '🤖', title: 'AI-Powered', description: 'Content generation and SEO optimization with AI' },
    { icon: '🗄️', title: 'Multi-Database', description: 'Works with MongoDB, Firebase, DynamoDB, and Supabase' }
  ];

  return (
    <div className="index-template">
      {/* WordPress hook: template:index:before_header */}
      {doAction('template:index:before_header')}
      
      {/* Header Part */}
      <Header primaryMenu={primaryMenu} header={header} />

      {/* WordPress hook: template:index:after_header */}
      {doAction('template:index:after_header')}
      {/* Hero Banner Pattern */}
      <HeroBanner 
        title="Welcome to NestPress"
        subtitle="A modern CMS with WordPress-like features, built with NestJS & React"
        ctaText="Read Our Blog"
        ctaUrl="/blog"
      />

      {/* Feature Grid Pattern */}
      <div style={{ maxWidth: '1340px', margin: '0 auto', padding: '0 var(--spacing-50, 2rem)' }}>
        <FeatureGrid features={features} columns={3} />
      </div>

      {/* Latest Posts Section */}
      {posts.length > 0 && (
        <section style={{ maxWidth: '1340px', margin: '0 auto', padding: '0 var(--spacing-50, 2rem)' }}>
          {/* WordPress hook: template:index:before_posts */}
          {doAction('template:index:before_posts', { posts })}
          
          <h2 style={{ 
            fontSize: 'clamp(1.75rem, 4vw, 2rem)', 
            marginBottom: 'var(--spacing-50, 2rem)', 
            fontWeight: 700,
            color: '#1e293b'
          }}>
            Latest Posts
          </h2>
          {/* Posts Grid Pattern */}
          <PostsGrid 
            posts={posts.slice(0, 6)} 
            columns={3}
            showExcerpt={true}
            showMeta={true}
            showFeaturedImage={true}
          />
          
          {/* WordPress hook: template:index:after_posts */}
          {doAction('template:index:after_posts', { posts })}
        </section>
      )}

      {/* WordPress hook: template:index:before_footer */}
      {doAction('template:index:before_footer')}
      
      {/* Footer Part */}
      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
      
      {/* WordPress hook: template:index:after_footer */}
      {doAction('template:index:after_footer')}
    </div>
  );
};

export default IndexTemplate;
