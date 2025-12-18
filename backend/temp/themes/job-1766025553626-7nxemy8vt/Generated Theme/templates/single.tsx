import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from './Header';
import Footer from './Footer';

const SingleTemplate: React.FC<ThemeTemplateProps> = (props) => {
  const { posts, post, primaryMenu, sidebarWidgets, siteSettings } = props;

  return (
    <div className="single-template min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
      <Header {...props} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Single Post View */}
        {post && (
          <article className="single-post">
            <header className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              <div className="post-meta text-sm text-gray-500 flex items-center gap-4">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                {post.author && <span>By {typeof post.author === 'string' ? post.author : post.author.name}</span>}
              </div>
            </header>

            {post.featuredImage && (
              <div className="mb-8">
                <img 
                  src={post.featuredImage} 
                  alt={post.title} 
                  className="w-full h-auto rounded-lg shadow-sm object-cover" 
                  style={{ maxHeight: '600px' }}
                />
              </div>
            )}

            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        )}

        {/* Index/Archive View (Fallback or List) */}
        {!post && posts && (
          <div className="posts-grid grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {posts.filter(p => p.status === 'PUBLISHED').map((post) => (
              <article key={post.id} className="post-card border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {post.featuredImage && (
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">
                    <a href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </a>
                  </h2>
                  <div className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer {...props} />
    </div>
  );
};

export default SingleTemplate;