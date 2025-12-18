import React from 'react';
import type { Post } from '@/types';
import { Header } from '../parts/Header';
import { Footer } from '../parts/Footer';

interface CategoryTemplateProps {
  posts?: Post[];
  categoryName?: string;
  categoryDescription?: string;
}

export default function CategoryTemplate({ 
  posts = [], 
  categoryName = 'Category',
  categoryDescription 
}: CategoryTemplateProps) {
  const publishedPosts = posts.filter(p => p.status === 'PUBLISHED');
  
  return (
    <div className="category-template">
      <Header />
      <header className="category-header">
        <h1 className="category-title">{categoryName}</h1>
        {categoryDescription && (
          <p className="category-description">{categoryDescription}</p>
        )}
        <p className="category-count">
          {publishedPosts.length} {publishedPosts.length === 1 ? 'post' : 'posts'}
        </p>
      </header>
      
      <div className="posts-list">
        {publishedPosts.map((post) => (
          <article key={post.id} className="post-item">
            {post.featuredImage && (
              <img src={post.featuredImage} alt={post.title} className="post-thumbnail" />
            )}
            <div className="post-details">
              <h2 className="post-title">
                <a href={`/blog/${post.slug}`}>{post.title}</a>
              </h2>
              {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
              <div className="post-meta">
                <span className="post-date">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
                {post.author && <span className="post-author">By {post.author}</span>}
              </div>
            </div>
          </article>
        ))}
      </div>
      <Footer />
    </div>
  );
}
