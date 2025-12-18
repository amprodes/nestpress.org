# NestPress Menu System Documentation

## Overview

NestPress provides a fully functional WordPress-like menu system that's manageable via the admin interface and accessible in frontend templates. Menus support hierarchical navigation, drag-and-drop reordering, and multiple locations.

## Features

✅ **Admin Management**: Full CRUD operations via Appearance → Menus  
✅ **Multiple Locations**: Primary (header), Footer, Mobile, Custom  
✅ **Drag & Drop**: Reorder menu items by dragging  
✅ **Menu Items**: Label, URL, icon, target (same/new window)  
✅ **API Integration**: RESTful API for all menu operations  
✅ **Theme Integration**: Menus automatically passed to theme templates  
✅ **TypeScript**: Full type safety across the stack  

## Admin Usage

### Creating a Menu

1. Navigate to **Appearance → Menus** in the admin dashboard
2. Click **Create Menu**
3. Enter a name (e.g., "Main Navigation")
4. Select a location: Primary (Header), Footer, Mobile, or Custom
5. Click **Create**

### Adding Menu Items

1. Select a menu from the list
2. Click **+ Add Menu Item**
3. Fill in the details:
   - **Label**: Display text (e.g., "Home")
   - **URL**: Destination URL (e.g., "/", "/about")
   - **Icon**: Optional emoji or icon (e.g., 🏠)
   - **Target**: Same Window or New Window
4. Click **Add**

### Editing Menu Items

1. Click the **Edit** icon (pencil) on any menu item
2. Modify the fields
3. Click **Update**

### Reordering Items

1. Drag menu items by the grip handle (⋮⋮)
2. Drop in the desired position
3. Click **Save Menu** to persist changes

### Deleting Items

1. Click the **Trash** icon on any menu item
2. Click **Save Menu** to persist changes

## Developer Usage

### Backend API

All menu endpoints are available at `/api/v1/appearance/menus`:

```typescript
// Get all menus (Public)
GET /appearance/menus

// Get menu by location (Public)
GET /appearance/menus/location/:location

// Get menu by ID (Public)
GET /appearance/menus/:id

// Create menu (Admin/Editor)
POST /appearance/menus
{
  "name": "Main Navigation",
  "slug": "main-navigation",
  "location": "primary",
  "items": []
}

// Update menu (Admin/Editor)
PUT /appearance/menus/:id
{
  "name": "Updated Name",
  "items": [...]
}

// Delete menu (Admin only)
DELETE /appearance/menus/:id

// Add menu item (Admin/Editor)
POST /appearance/menus/:id/items
{
  "label": "Home",
  "url": "/",
  "target": "_self",
  "order": 0
}

// Update menu item (Admin/Editor)
PUT /appearance/menus/:id/items/:itemId

// Delete menu item (Admin/Editor)
DELETE /appearance/menus/:id/items/:itemId

// Reorder items (Admin/Editor)
POST /appearance/menus/:id/reorder
{
  "itemIds": ["item1", "item2", "item3"]
}
```

### Frontend API Integration

```typescript
import { menusApi } from '@/services/api';

// Get all menus
const menus = await menusApi.getAll();

// Get primary menu
const primaryMenu = await menusApi.getByLocation('primary');

// Create menu
const newMenu = await menusApi.create({
  name: 'Footer Navigation',
  slug: 'footer-navigation',
  location: 'footer',
  items: [
    {
      label: 'Privacy',
      url: '/privacy',
      target: '_self',
      order: 0,
    }
  ]
});

// Update menu
const updated = await menusApi.update(menuId, {
  name: 'Updated Name'
});

// Add item
const withNewItem = await menusApi.addItem(menuId, {
  label: 'Contact',
  url: '/contact',
  target: '_self',
  order: 1
});
```

### Using Menus in React Components

```typescript
import { useCMS } from '@/contexts/CMSContext';

function MyComponent() {
  const { menus, getMenuByLocation } = useCMS();
  
  // Get specific menu by location
  const primaryMenu = getMenuByLocation('primary');
  const footerMenu = getMenuByLocation('footer');
  
  return (
    <nav>
      {primaryMenu?.items.map(item => (
        <a 
          key={item.id}
          href={item.url}
          target={item.target}
        >
          {item.icon && <span>{item.icon}</span>}
          {item.label}
        </a>
      ))}
    </nav>
  );
}
```

### Using Menus in Theme Templates

Menus are automatically passed to all theme templates via props:

```typescript
// themes/your-theme/index.tsx

import { Menu, MenuItem } from '../../types';

export function SiteNav({ primaryMenu }: { primaryMenu?: Menu }) {
  // Use menu items or provide defaults
  const menuItems: MenuItem[] = primaryMenu?.items || [
    { id: '1', label: 'Home', url: '/', order: 0, target: '_self' },
    { id: '2', label: 'Blog', url: '/blog', order: 1, target: '_self' },
  ];

  return (
    <nav>
      <div className="logo">My Site</div>
      <ul>
        {menuItems
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(item => (
            <li key={item.id}>
              <a 
                href={item.url} 
                target={item.target || '_self'}
              >
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </a>
            </li>
          ))}
      </ul>
    </nav>
  );
}

export function SiteFooter({ footerMenu }: { footerMenu?: Menu }) {
  const items = footerMenu?.items || [];
  
  return (
    <footer>
      <nav>
        {items.map(item => (
          <a key={item.id} href={item.url}>{item.label}</a>
        ))}
      </nav>
    </footer>
  );
}
```

### Theme Template Props

All theme templates receive these props:

```typescript
export interface ThemeTemplateProps {
  // Core data
  data?: any;
  posts?: Post[];
  post?: Post;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  
  // Appearance data (including menus)
  menus?: Menu[];           // All menus
  primaryMenu?: Menu;       // Primary location menu
  footerMenu?: Menu;        // Footer location menu
  widgets?: Widget[];
  header?: HeaderSettings;
  sidebarWidgets?: Widget[];
  footerWidgets?: Widget[];
  headerWidgets?: Widget[];
}
```

## TypeScript Types

```typescript
export interface MenuItem {
  id: string;
  label: string;
  url: string;
  target?: '_blank' | '_self';
  cssClass?: string;
  parentId?: string;        // For nested menus (future)
  order: number;
  icon?: string;
}

export interface Menu {
  id: string;
  name: string;
  slug: string;
  location: 'primary' | 'footer' | 'mobile' | 'custom';
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
}
```

## Menu Locations

- **primary**: Main header navigation
- **footer**: Footer navigation
- **mobile**: Mobile-specific menu (responsive)
- **custom**: Custom location for theme-specific use

## Best Practices

### 1. Always Provide Fallbacks
```typescript
const items = primaryMenu?.items || defaultMenuItems;
```

### 2. Sort by Order Property
```typescript
items.sort((a, b) => (a.order || 0) - (b.order || 0))
```

### 3. Handle External Links
```typescript
<a 
  href={item.url}
  target={item.target || '_self'}
  rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
>
  {item.label}
</a>
```

### 4. Display Icons When Available
```typescript
{item.icon && <span className="menu-icon">{item.icon}</span>}
{item.label}
```

### 5. Active Link Styling
```typescript
const isActive = window.location.pathname === item.url;
<a 
  href={item.url}
  className={isActive ? 'active' : ''}
>
  {item.label}
</a>
```

## Example: Complete Navigation Component

```typescript
import React from 'react';
import { Menu, MenuItem } from '@/types';

interface NavigationProps {
  primaryMenu?: Menu;
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  primaryMenu, 
  className = '' 
}) => {
  const items = primaryMenu?.items || [];
  
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className={`navigation ${className}`}>
      <ul className="menu">
        {items
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(item => {
            const isActive = window.location.pathname === item.url;
            const isExternal = item.url.startsWith('http');
            
            return (
              <li key={item.id} className={isActive ? 'active' : ''}>
                <a
                  href={item.url}
                  target={item.target || '_self'}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="menu-link"
                >
                  {item.icon && (
                    <span className="menu-icon">{item.icon}</span>
                  )}
                  <span className="menu-label">{item.label}</span>
                  {item.target === '_blank' && (
                    <span className="external-icon">↗</span>
                  )}
                </a>
              </li>
            );
          })}
      </ul>
    </nav>
  );
};
```

## Database Schema

Menus are stored in the `menus` collection with the following structure:

```json
{
  "id": "menu_1234567890",
  "name": "Main Navigation",
  "slug": "main-navigation",
  "location": "primary",
  "items": [
    {
      "id": "item_1234567890",
      "label": "Home",
      "url": "/",
      "target": "_self",
      "order": 0,
      "icon": "🏠"
    },
    {
      "id": "item_0987654321",
      "label": "About",
      "url": "/about",
      "target": "_self",
      "order": 1
    }
  ],
  "createdAt": "2025-12-14T10:00:00.000Z",
  "updatedAt": "2025-12-14T10:30:00.000Z"
}
```

## Future Enhancements

- **Hierarchical Menus**: Parent-child relationships for dropdown menus
- **Mega Menus**: Complex multi-column navigation
- **Menu Permissions**: Role-based visibility for menu items
- **Menu Widgets**: Menus as widgets in sidebar/footer
- **Menu Shortcodes**: Embed menus anywhere with `[menu location="footer"]`
- **Menu Caching**: Performance optimization for large menus
- **Import/Export**: Backup and restore menu configurations

## Troubleshooting

### Menus not appearing in frontend

1. Check if menu exists in admin (Appearance → Menus)
2. Verify menu has items and correct location
3. Ensure theme is passing `primaryMenu` prop to navigation
4. Check browser console for API errors

### Menu items not saving

1. Verify backend is running (http://localhost:4000)
2. Check user has Admin or Editor role
3. Look for errors in browser console and backend logs
4. Ensure menu ID is valid

### Drag & drop not working

1. Check that items have unique IDs
2. Verify `order` property is being updated
3. Ensure "Save Menu" is clicked after reordering

## Related Documentation

- [Theme System](./THEME_SYSTEM.md)
- [WordPress Features](./WORDPRESS_FEATURES.md)
- [API Documentation](http://localhost:4000/docs)
