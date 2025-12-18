import React from 'react';
import type { Post } from '@/types';
import { Header } from '../parts/Header';
import { Footer } from '../parts/Footer';

interface SingleTemplateProps {
  post?: Post;
}

export default function SingleTemplate({ post }: SingleTemplateProps) {
  if (!post) {
    return (
      <div className="single-template">
        <Header />
        <p>Post not found</p>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="single-template">
      <Header />
      <article className="single-post">
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          {post.featuredImage && (
            <img 
              src={post.featuredImage} 
              alt={post.title} 
              className="featured-image"
            />
          )}
          <div className="post-meta">
            {post.author && <span className="post-author">By {post.author}</span>}
            <span className="post-date">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
            {post.categories && post.categories.length > 0 && (
              <span className="post-categories">
                {post.categories.join(', ')}
              </span>
            )}
          </div>
        </header>
        
        <div 
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {post.tags && post.tags.length > 0 && (
          <footer className="post-footer">
            <div className="post-tags">
              {post.tags.map((tag) => (
                <a key={tag} href={`/tag/${tag}`} className="tag">
                  {tag}
                </a>
              ))}
            </div>
          </footer>
        )}
      </article>
      <Footer />
    </div>
  );
}
