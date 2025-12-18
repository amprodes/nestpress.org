# NestPress CMS Backend

A powerful headless CMS backend built with NestJS, featuring WordPress-like content management and Shopify-like e-commerce capabilities.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Role-based access control (Admin, Editor, Author, Subscriber)
  - Global auth guard with `@Public()` decorator for public routes

- **Content Management**
  - Posts with drafts, publishing workflow, and SEO optimization
  - Pages with custom templates and hierarchical structure
  - Media library for file uploads and management
  - Comments moderation system

- **E-Commerce**
  - Products with variants, inventory tracking
  - Orders with status workflow (pending → processing → shipped → delivered)
  - Multi-payment gateway support (Stripe, PayPal, Square)
  - Tax and shipping calculations

- **Theming System**
  - Built-in themes (Minimal Light/Dark, Modern Business, E-Commerce Starter)
  - Theme customization (colors, fonts, layout)
  - Custom theme support

- **AI-Powered Content**
  - Multiple AI providers (Google Gemini, OpenAI, Anthropic)
  - Blog post generation
  - SEO metadata generation
  - Content improvement and summarization

- **Multi-Database Support**
  - Firebase Firestore
  - MongoDB
  - AWS DynamoDB
  - Supabase (PostgreSQL)

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your environment variables in .env
```

## ⚙️ Configuration

Edit `.env` with your configuration:

```env
# Required
JWT_SECRET=your-super-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key

# Database (choose one)
DATABASE_PROVIDER=firebase  # firebase | mongodb | dynamodb | supabase

# AI Provider
AI_PROVIDER=gemini  # gemini | openai | anthropic
GEMINI_API_KEY=your-key

# Payment Provider
PAYMENT_PROVIDER=stripe  # stripe | paypal | square
```

## 🏃 Running the App

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api/v1`

Swagger documentation: `http://localhost:3000/docs`

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

### Posts
- `GET /posts` - List all posts (Admin/Editor)
- `GET /posts/published` - List published posts (Public)
- `GET /posts/slug/:slug` - Get post by slug (Public)
- `POST /posts` - Create post
- `PATCH /posts/:id` - Update post
- `POST /posts/:id/publish` - Publish post
- `DELETE /posts/:id` - Delete post

### Products
- `GET /products` - List all products (Admin/Editor)
- `GET /products/store` - List active products (Public)
- `GET /products/search?q=query` - Search products (Public)
- `POST /products` - Create product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Orders
- `GET /orders` - List all orders (Admin/Editor)
- `GET /orders/my-orders` - List user's orders
- `POST /orders` - Create order
- `PATCH /orders/:id/status` - Update order status

### AI Content
- `POST /ai/generate` - Generate content
- `POST /ai/generate-blog` - Generate blog post
- `POST /ai/generate-seo` - Generate SEO metadata
- `POST /ai/summarize` - Summarize content

### Settings
- `GET /settings` - Get site settings
- `PATCH /settings` - Update settings (Admin)

### Themes
- `GET /themes` - List all themes
- `GET /themes/active` - Get active theme
- `POST /themes/:id/activate` - Activate theme (Admin)

## 🔒 Security

- Helmet.js for security headers
- Rate limiting with @nestjs/throttler
- Input validation with class-validator
- CORS configuration
- JWT authentication with bcrypt password hashing

## 🏗️ Project Structure

```
src/
├── common/
│   ├── decorators/     # Custom decorators (@Public, @Roles, @CurrentUser)
│   ├── dto/            # Common DTOs (pagination, api response)
│   ├── filters/        # Exception filters
│   ├── guards/         # Auth guards (JWT, Roles)
│   └── interceptors/   # Logging, Transform interceptors
├── config/             # Configuration modules
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── ai.config.ts
│   └── payment.config.ts
├── modules/
│   ├── auth/           # Authentication module
│   ├── users/          # User management
│   ├── posts/          # Blog posts
│   ├── pages/          # Static pages
│   ├── products/       # E-commerce products
│   ├── orders/         # Order management
│   ├── media/          # Media library
│   ├── themes/         # Theme management
│   ├── settings/       # Site settings
│   ├── ai/             # AI content generation
│   └── database/       # Database abstraction layer
├── app.module.ts       # Root module
└── main.ts             # Application entry point
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 License

MIT
