import React from 'react';
import { 
  ThemeTemplateProps, 
  Header, 
  Footer, 
  Sidebar,
  PostMeta,
  getPostPermalink 
} from '../index';

/**
 * Page With Sidebar Template
 * WordPress equivalent: page-with-sidebar.php, page.php with get_sidebar()
 * Demonstrates WordPress-like sidebar integration
 */
const PageWithSidebarTemplate: React.FC<ThemeTemplateProps> = ({ 
  post,
  posts = [],
  primaryMenu,
  footerMenu,
  footerWidgets,
  sidebarWidgets,
  header,
}) => {
  if (!post) {
    return (
      <div>
        <Header primaryMenu={primaryMenu} header={header} />
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h1>Page not found</h1>
        </div>
        <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
      </div>
    );
  }

  // Get unique categories from all posts for sidebar
  const categories = Array.from(
    new Set(posts.flatMap(p => p.categories || []))
  );

  return (
    <div className="page-with-sidebar-template">
      {/* Header Part */}
      <Header primaryMenu={primaryMenu} header={header} />

      {/* Main Content Area */}
      <div style={{
        maxWidth: '1340px',
        margin: '0 auto',
        padding: 'var(--spacing-60, 4rem) var(--spacing-50, 2rem)',
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: 'var(--spacing-60, 3rem)',
      }}>
        {/* Main Content */}
        <main className="site-main">
          <article className="page-content">
            {/* Page Header */}
            <header className="page-header" style={{
              marginBottom: 'var(--spacing-50, 2rem)',
              paddingBottom: 'var(--spacing-40, 1.5rem)',
              borderBottom: '2px solid #e2e8f0'
            }}>
              <h1 style={{
                fontSize: 'clamp(2.15rem, 5vw, 3rem)',
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: '1rem',
                lineHeight: 1.2
              }}>
                {post.title}
              </h1>

              {/* Post Meta Part */}
              {post.type === 'post' && (
                <PostMeta 
                  post={post}
                  showAuthor={true}
                  showDate={true}
                  showCategories={true}
                  showTags={true}
                />
              )}
            </header>

            {/* Featured Image */}
            {post.featuredImage && (
              <div style={{ marginBottom: 'var(--spacing-50, 2rem)' }}>
                <img 
                  src={post.featuredImage}
                  alt={post.title}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '500px',
                    objectFit: 'cover',
                    borderRadius: '0.5rem'
                  }}
                />
              </div>
            )}

            {/* Page Content */}
            <div 
              className="page-content-body"
              style={{
                fontSize: 'var(--wp--preset--font-size--medium, 1rem)',
                lineHeight: 1.75,
                color: '#475569'
              }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Page Footer */}
            {post.type === 'post' && (
              <footer className="page-footer" style={{
                marginTop: 'var(--spacing-60, 3rem)',
                paddingTop: 'var(--spacing-50, 2rem)',
                borderTop: '1px solid #e2e8f0'
              }}>
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}>
                    <span style={{ 
                      fontWeight: 600, 
                      color: '#64748b',
                      fontSize: '0.875rem'
                    }}>
                      Tags:
                    </span>
                    {post.tags.map(tag => (
                      <a 
                        key={tag}
                        href={`/tag/${tag.toLowerCase()}`}
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: '#f1f5f9',
                          color: '#64748b',
                          textDecoration: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          transition: 'background 0.2s'
                        }}
                      >
                        #{tag}
                      </a>
                    ))}
                  </div>
                )}
              </footer>
            )}
          </article>
        </main>

        {/* Sidebar Part */}
        <Sidebar 
          widgets={sidebarWidgets}
          recentPosts={posts.filter(p => p.status === 'Published').slice(0, 5)}
          categories={categories}
        />
      </div>

      {/* Footer Part */}
      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
};

export default PageWithSidebarTemplate;
