import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from './Header';
import Footer from './Footer';

const PageSidebarTemplate: React.FC<ThemeTemplateProps> = (props) => {
  const { posts, post, sidebarWidgets } = props;

  return (
    <div className="page-sidebar-template min-h-screen bg-transparent text-gray-700">
      <Header {...props} />

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 md:col-span-2">
          {/* Single Post View */}
          {post && (
            <article className="single-post">
              <h1 className="text-4xl font-bold mb-6 text-gray-900">{post.title}</h1>
              {post.featuredImage && (
                <img 
                  src={post.featuredImage} 
                  alt={post.title} 
                  className="w-full h-auto mb-6 rounded shadow-sm"
                />
              )}
              <div className="post-meta text-sm text-gray-500 mb-6">
                {post.author && <span className="mr-4">By {post.author}</span>}
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div 
                className="prose max-w-none" 
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />
            </article>
          )}

          {/* Archive/Index View */}
          {!post && posts && (
            <div className="posts-grid flex flex-col gap-8">
              {posts.filter(p => p.status === 'PUBLISHED').map((postItem) => (
                <article key={postItem.id} className="post-card border-b border-slate-200 pb-8 last:border-0">
                  {postItem.featuredImage && (
                    <img 
                      src={postItem.featuredImage} 
                      alt={postItem.title} 
                      className="w-full h-64 object-cover mb-4 rounded" 
                    />
                  )}
                  <h2 className="text-2xl font-bold mb-2">
                    <a href={`/blog/${postItem.slug}`} className="text-blue-600 hover:underline">
                      {postItem.title}
                    </a>
                  </h2>
                  <div className="text-sm text-gray-500 mb-2">
                    {new Date(postItem.createdAt).toLocaleDateString()}
                  </div>
                  {postItem.excerpt && <p className="text-gray-600">{postItem.excerpt}</p>}
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="col-span-1">
          {sidebarWidgets && sidebarWidgets.map((widget) => (
            <div key={widget.id} className="widget mb-8 p-4 rounded bg-transparent">
              <h3 className="font-bold text-lg mb-4 text-gray-900 border-b border-slate-200 pb-2">
                {widget.title}
              </h3>
              <div 
                className="widget-content" 
                dangerouslySetInnerHTML={{ __html: widget.content }} 
              />
            </div>
          ))}
        </aside>
      </main>

      <Footer {...props} />
    </div>
  );
};

export default PageSidebarTemplate;