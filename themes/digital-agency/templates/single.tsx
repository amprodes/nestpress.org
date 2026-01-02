import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../index';

export default function SingleTemplate(props: ThemeTemplateProps) {
  const { posts = [], post, site } = props || {};
  
  return (
    <div className="theme-page-wrapper">
      <Header {...props} />
      <div className="mk-post-wrap mk-post-date-on">
    	<div className="mk-post-image"><div className="mk-post-image-category"><a href="https://solis.premiumthemes.in/category/artworks/" rel="tag">Artworks</a></div>
                                    <a href="https://solis.premiumthemes.in/the-future-of-remote-work/" className="mk-post-grid-image swm-anim"><img loading="lazy" decoding="async" width="1034" height="639" src="https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-13.jpg" alt="" sizes="auto, (max-width: 1034px) 100vw, 1034px" className="attachment-full size-full" srcSet="https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-13.jpg 1034w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-13-300x185.jpg 300w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-13-1024x633.jpg 1024w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-13-768x475.jpg 768w" /></a>
                                </div>
    		<div className="mk-post-content">

                <div className="mk-post-meta highlight-text"><a href="https://solis.premiumthemes.in/2025/06/" className="entry-date mk-post-date-list published updated">June 30, 2025</a><div className="mk-post-date-list-separator mk-post-meta-separator"></div><a href="https://solis.premiumthemes.in/author/rubygates25/" className="swm-info-author">Ruby Gates</a><div className="mk-post-meta-separator"></div></div><h3 className="mk_post_title"><a href="https://solis.premiumthemes.in/the-future-of-remote-work/">The Future of Remote Work</a></h3>
            </div>
    </div>
      <Footer {...props} />
    </div>
  );
}
