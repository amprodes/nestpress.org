import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PageSidebarTemplate: React.FC<ThemeTemplateProps> = (props) => {
  const { posts = [], post, sidebarWidgets = [] } = props;

  return (
    <div className="page-sidebar-template min-h-screen bg-transparent text-[#444444]">
      <Header {...props} />

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 md:col-span-2">
          {/* Single Post View */}
          {post && (
            <article className="single-post">
              <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
              {post.featuredImage && (
                <img 
                  src={post.featuredImage} 
                  alt={post.title} 
                  className="w-full h-auto mb-6 rounded-lg" 
                />
              )}
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>
          )}

          {/* Index/Archive View */}
          {!post && (
            <div className="posts-grid space-y-8">
              {posts.filter(p => p.status === 'PUBLISHED').map((item) => (
                <article key={item.id} className="post-card border-b border-gray-200 pb-8 last:border-0">
                  {item.featuredImage && (
                    <img 
                      src={item.featuredImage} 
                      alt={item.title} 
                      className="w-full h-64 object-cover rounded-lg mb-4" 
                    />
                  )}
                  <h2 className="text-2xl font-bold mb-2">
                    <a href={`/blog/${item.slug}`} className="hover:text-blue-600 transition-colors">
                      {item.title}
                    </a>
                  </h2>
                  <div className="post-excerpt text-gray-600 mb-4">{item.excerpt}</div>
                  <a href={`/blog/${item.slug}`} className="text-blue-600 font-medium hover:underline">
                    Read more &rarr;
                  </a>
                </article>
              ))}
            </div>
          )}
        </div>
        
        <aside className="col-span-1">
          {sidebarWidgets.map((widget) => (
            <div key={widget.id} className="widget mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-xl mb-4 border-b border-gray-200 pb-2">{widget.title}</h3>
              <div className="widget-content" dangerouslySetInnerHTML={{ __html: widget.content }} />
            </div>
          ))}
        </aside>
      </main>

      <Footer {...props} />
    </div>
  );
};

export default PageSidebarTemplate;