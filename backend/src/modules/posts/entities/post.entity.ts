import { ApiProperty } from '@nestjs/swagger';

export enum PostStatus {
  PUBLISHED = 'published',
  DRAFT = 'draft',
  TRASH = 'trash',
}

export class Post {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'My First Blog Post' })
  title: string;

  @ApiProperty({ example: 'my-first-blog-post' })
  slug: string;

  @ApiProperty({ example: 'This is the content of my blog post...' })
  content: string;

  @ApiProperty({ example: 'A brief excerpt of the post...' })
  excerpt?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  featuredImage?: string;

  @ApiProperty({ enum: PostStatus, example: PostStatus.DRAFT })
  status: PostStatus;

  @ApiProperty()
  authorId: string;

  @ApiProperty({ type: [String], example: ['technology', 'programming'] })
  categories?: string[];

  @ApiProperty({ type: [String], example: ['nestjs', 'typescript'] })
  tags?: string[];

  @ApiProperty({ example: 0 })
  views: number;

  @ApiProperty({ example: 0 })
  likes: number;

  @ApiProperty({ description: 'SEO meta title' })
  metaTitle?: string;

  @ApiProperty({ description: 'SEO meta description' })
  metaDescription?: string;

  @ApiProperty()
  publishedAt?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
