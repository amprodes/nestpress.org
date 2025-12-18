import React from 'react';
import { ThemeTemplateProps } from '@/types';
import Header from './Header';
import Footer from './Footer';

const SingleTemplate: React.FC<ThemeTemplateProps> = (props) => {
  const { post } = props;

  return (
    <div className="single-template min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(68, 68, 68)' }}>
      <Header {...props} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {post && (
          <article className="single-post">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            
            {post.featuredImage && (
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-auto mb-6 rounded-lg"
              />
            )}

            <div className="post-meta mb-6 text-sm opacity-75">
              {post.author && <span className="mr-4">By {post.author}</span>}
              {post.createdAt && <span>{new Date(post.createdAt).toLocaleDateString()}</span>}
            </div>

            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        )}
      </main>

      <Footer {...props} />
    </div>
  );
};

export default SingleTemplate;