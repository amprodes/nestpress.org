import React from 'react';
import { ThemeTemplateProps } from './types';
import Header from './Header';
import Footer from './Footer';

const PageSidebarTemplate: React.FC<ThemeTemplateProps> = (props) => {
  const { posts = [], post, sidebarWidgets = [] } = props;

  return (
    <div className="page-sidebar-template min-h-screen text-gray-800">
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
              <div 
                className="prose max-w-none" 
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />
            </article>
          )}

          {/* Index/Archive View (Fallback or List) */}
          {!post && (
            <div className="posts-grid space-y-8">
              {posts.filter(p => p.status === 'PUBLISHED').map((item) => (
                <article key={item.id} className="post-card border-b pb-8">
                  {item.featuredImage && (
                    <img 
                      src={item.featuredImage} 
                      alt={item.title} 
                      className="w-full h-64 object-cover mb-4 rounded-lg"
                    />
                  )}
                  <h2 className="text-2xl font-bold mb-2">
                    <a href={`/blog/${item.slug}`} className="hover:text-blue-600">
                      {item.title}
                    </a>
                  </h2>
                  <p className="text-gray-600 mb-4">{item.excerpt}</p>
                  <div className="post-meta text-sm text-gray-500">
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="col-span-1">
          {sidebarWidgets.map((widget) => (
            <div key={widget.id} className="widget mb-6 p-4 rounded bg-gray-50">
              <h3 className="font-bold text-lg mb-2 border-b pb-2">{widget.title}</h3>
              <div className="widget-content">
                {widget.content}
              </div>
            </div>
          ))}
        </aside>
      </main>

      <Footer {...props} />
    </div>
  );
};

export default PageSidebarTemplate;