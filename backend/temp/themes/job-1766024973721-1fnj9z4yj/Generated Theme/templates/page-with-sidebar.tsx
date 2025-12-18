```javascript
import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from './Header';
import Footer from './Footer';

const PageSidebarTemplate: React.FC<ThemeTemplateProps> = (props) => {
  const { posts = [], post, sidebarWidgets = [] } = props;

  return (
    <div className="page-sidebar-template min-h-screen bg-transparent text-gray-800">
      <Header {...props} />

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
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

          {/* Index/Archive View (only rendered if no single post is active) */}
          {!post && (
            <div className="posts-grid space-y-8">
              {posts.filter(p => p.status === 'PUBLISHED').map((postItem) => (
                <article key={postItem.id} className="post-card border-b border-gray-200 pb-8">
                  {postItem.featuredImage && (
                    <img 
                      src={postItem.featuredImage} 
                      alt={postItem.title} 
                      className="w-full h-64 object-cover mb-4 rounded-lg"
                    />
                  )}
                  <h2 className="text-2xl font-bold mb-2">
                    <a href={`/blog/${postItem.slug}`} className="hover:text-blue-600 transition-colors">
                      {postItem.title}
                    </a>
                  </h2>
                  <div className="text-gray-600 mb-4">{postItem.excerpt}</div>
                  <a href={`/blog/${postItem.slug}`} className="text-blue-600 font-medium hover:underline">
                    Read more
                  </a>
                </article>
              ))}
            </div>
          )}
        </div>
        
        <aside className="md:col-span-1">
          <div className="sticky top-8">
            {sidebarWidgets.map((widget) => (
              <div key={widget.id} className="widget mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-lg mb-4 border-b pb-2">{widget.title}</h3>
                <div className="widget-content">
                  {widget.content}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </main>

      <Footer {...props} />
    </div>
  );
};

export default PageSidebarTemplate;
```