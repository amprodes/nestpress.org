import React, { useEffect } from 'react';
import { ThemeTemplateProps, Header, Footer } from '../index';
import { useNestPressHooks } from '../../../hooks/nestpress-hooks.tsx';

/**
 * Page Template
 * WordPress equivalent: page.php
 */
const PageTemplate: React.FC<ThemeTemplateProps> = ({ 
  post,
  primaryMenu,
  footerMenu,
  footerWidgets,
  header,
}) => {
  const { doAction, applyFilters } = useNestPressHooks();
  
  // WordPress hook: template loaded
  useEffect(() => {
    doAction('template:page:loaded', { post });
    
    return () => {
      doAction('template:page:unloaded');
    };
  }, [post?.id]);
  
  if (!post) {
    return <div>Page not found</div>;
  }

  // Apply WordPress filter to page title and content
  const filteredTitle = applyFilters('template:page:post_title', post.title, post);
  const filteredContent = applyFilters('template:page:post_content', post.content, post);

  return (
    <div className="page-template">
      {/* WordPress hook: template:page:before_header */}
      {doAction('template:page:before_header')}
      
      <Header primaryMenu={primaryMenu} header={header} />
      
      {/* WordPress hook: template:page:after_header */}
      {doAction('template:page:after_header')}
      
      {/* WordPress hook: template:page:before_content */}
      {doAction('template:page:before_content', { post })}
      
      <article style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 2rem' }}>
        <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700 }}>
            {filteredTitle}
          </h1>
        </header>

        <div 
          style={{ 
            lineHeight: 1.8,
            fontSize: '1.1rem',
            color: '#334155'
          }}
          dangerouslySetInnerHTML={{ __html: filteredContent }}
        />
      </article>
      
      {/* WordPress hook: template:page:after_content */}
      {doAction('template:page:after_content', { post })}

      {/* WordPress hook: template:page:before_footer */}
      {doAction('template:page:before_footer')}

      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
      
      {/* WordPress hook: template:page:after_footer */}
      {doAction('template:page:after_footer')}
    </div>
  );
};

export default PageTemplate;
