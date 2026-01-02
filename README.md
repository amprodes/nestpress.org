<div align="center">
<img width="1200" height="475" alt="NestPress CMS Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# NestPress CMS

**A full-stack headless CMS combining WordPress-like content management with Shopify-like e-commerce functionality.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-red.svg)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

## Features

### 📝 Content Management (WordPress-like)
- Posts & Pages with rich text editing
- Categories and tags
- Media library with file uploads
- Comment management
- SEO optimization with meta tags
- **✨ WordPress Meta System** - Custom fields for posts, users, and comments (wp_postmeta, wp_usermeta, wp_commentmeta)
- **✨ WordPress Taxonomy System** - Full taxonomy architecture (wp_terms, wp_term_taxonomy, wp_term_relationships, wp_termmeta)
  - Built-in taxonomies: categories (hierarchical) and tags (non-hierarchical)
  - Custom taxonomy registration
  - Term management and metadata
  - Post-term relationships
- **✨ WordPress Post Type System** - Custom post type registration and management
  - Built-in post types: post, page, attachment
  - Custom post types (e.g., product with WooCommerce-style taxonomies)
  - Post type validation and queries
  - WordPress-compatible API (register_post_type, get_post_types, etc.)

### 🛒 E-commerce (Shopify-like)
- Product catalog management
- Order processing
- Inventory tracking
- Customer management
- Multiple payment gateway support

### 🎨 Theme System
- Multiple built-in themes
- Customizable colors and fonts
- Full-width and boxed layouts
- Dark mode support

### 🤖 AI-Powered
- Content generation with AI
- SEO suggestions
- Product descriptions
- Multiple AI provider support (Gemini, OpenAI, Anthropic)

### 🔐 Security & Auth
- JWT-based authentication
- Role-based access control (Admin, Editor, Author, Subscriber)
- Rate limiting
- CORS protection

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **NestJS 10** - Server framework
- **TypeScript** - Type safety
- **JWT** - Authentication
- **Swagger/OpenAPI** - API documentation
- **Multi-database support** - MongoDB, Firebase, DynamoDB, Supabase

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone and Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install
```

### 2. Configure Environment

**Frontend** (`.env.local`):
```env
VITE_API_URL=http://localhost:4000/api/v1
GEMINI_API_KEY=your_gemini_api_key
```

**Backend** (`backend/.env`):
```env
PORT=4000
NODE_ENV=development
API_PREFIX=api/v1

# Database
DATABASE_PROVIDER=mongodb
MONGODB_URI=mongodb://localhost:27017/nestpress

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Run Development Servers

```bash
# Terminal 1: Start backend
cd backend && npm run start:dev

# Terminal 2: Start frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000/api/v1
- **API Docs**: http://localhost:4000/docs
- **OpenAPI Spec**: http://localhost:4000/api/openapi.json

### Demo Credentials
- **Email**: admin@nestpress.com
- **Password**: admin123

## Project Structure

```
nestpress-cms/
├── backend/                  # NestJS Backend
│   ├── src/
│   │   ├── common/           # Guards, decorators, filters
│   │   ├── config/           # Configuration modules
│   │   └── modules/          # Feature modules
│   │       ├── auth/         # JWT authentication
│   │       ├── users/        # User management
│   │       ├── posts/        # Blog posts
│   │       ├── pages/        # Static pages
│   │       ├── products/     # E-commerce products
│   │       ├── orders/       # Order management
│   │       ├── media/        # Media library
│   │       ├── themes/       # Theme system
│   │       ├── settings/     # Site settings
│   │       ├── ai/           # AI content generation
│   │       ├── health/       # Health checks
│   │       └── database/     # Multi-database abstraction
│   └── package.json
├── components/               # React components
├── contexts/                 # React contexts
│   ├── AuthContext.tsx       # Authentication state
│   └── CMSContext.tsx        # CMS data state
├── services/                 # API services
│   └── api.ts                # Typed API client
├── types.ts                  # TypeScript types
└── package.json
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login and get tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/profile` | Get current user |

### Content
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/posts` | List all posts |
| POST | `/api/v1/posts` | Create a post |
| GET | `/api/v1/posts/:id` | Get a post |
| PATCH | `/api/v1/posts/:id` | Update a post |
| DELETE | `/api/v1/posts/:id` | Delete a post |

### E-commerce
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List products |
| POST | `/api/v1/products` | Create product |
| GET | `/api/v1/orders` | List orders |
| POST | `/api/v1/orders` | Create order |

## Scripts

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
```

### Backend
```bash
npm run start:dev  # Start with hot reload
npm run build      # Production build
npm run start:prod # Start production server
```

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built with ❤️ using NestJS + React</strong>
</div>
