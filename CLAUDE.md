# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lunora Stitch is an Astro-based web component template builder that allows users to create websites by selecting and ordering different UI components. The application provides a comprehensive collection of pre-built components across various categories including navigation, hero sections, services, contact forms, and more.

## Development Commands

- **Development server**: `npm run dev` - Starts the Astro development server
- **Build**: `npm run build` - Creates production build
- **Preview**: `npm run preview` - Previews the built application
- **Astro CLI**: `npm run astro` - Access Astro CLI commands

## Architecture & Structure

### Core Architecture
The project is structured as a component showcase and template builder with the following key architectural patterns:

1. **Template Builder Pattern**: The main application (`/templateBuilder`) allows users to select components from dropdown menus, arrange them using order inputs, and generate previews.

2. **Component Organization**: Components are organized in a hierarchical structure:
   - `src/layouts/show/` - Contains display components that showcase individual component types
   - `src/layouts/[type]/` - Contains numbered component variations (e.g., `hero/1.astro`, `hero/2.astro`)
   - `src/pages/component/[type].astro` - Dynamic routing for component types

3. **Dynamic Component Rendering**: Uses Astro's dynamic imports and component mapping to render selected components based on URL parameters or form selections.

### Key Directories

- **`src/layouts/Layout.astro`**: Main layout with global CSS variables, font definitions, and dark mode support
- **`src/pages/templateBuilder.astro`**: Interactive template builder interface with component selectors
- **`src/pages/component/[type].astro`**: Dynamic component renderer using static path generation
- **`src/layouts/show/`**: Display components for each component category
- **`src/components/darkMode/`**: Dark mode implementation with localStorage persistence
- **`src/components/styles/`**: Organized CSS files (base styles, button styles, navigation styles)

### Component Categories
The system supports these component types with extensive variations:
- E-commerce (collections, products, hero)
- Navigation (22+ variations)
- Hero sections (120+ variations grouped by alignment)
- Services (170+ variations grouped by card count)
- Side-by-side layouts (100+ variations)
- Team, Gallery, Steps, Stats, Pricing
- FAQ, Reviews, Contact Forms (30+ variations)
- CTA, Footer, Interior Pages, Blog, Events

### Styling System

The project uses a hybrid approach with:
- **CSS Custom Properties**: Defined in Layout.astro for colors, fonts, and spacing
- **SCSS**: Used for component-specific styling with nesting
- **Global Styles**: Base reset, button, and dark mode styles
- **Dark Mode**: Implemented with data attributes and CSS custom properties

Custom properties include:
- Color scheme (primary, secondary, header, body text, backgrounds)
- Typography (font families, sizes with clamp() for responsive design)
- Dark mode variants (backgroundColorDark, bodyTextColorDark, etc.)

### Content Management

- **Astro Content Collections**: Configured in `src/content.config.ts` using glob loader for markdown files in `src/data/catta/`
- **Static Generation**: Components use `getStaticPaths()` for pre-generating all component variations

### State Management

- **Component Selection**: Managed via form selects and order inputs in template builder
- **Component Ordering**: Real-time reordering using CSS flexbox order property
- **Preview Generation**: Encodes selected components as URL parameters for the preview page
- **Dark Mode**: Persisted in localStorage with system preference fallback

## Development Guidelines

### Adding New Components
1. Create numbered component files in appropriate `src/layouts/[type]/` directory
2. Add corresponding display component in `src/layouts/show/[Type].astro`
3. Update the component mapping in `src/pages/component/[type].astro`
4. Add select options in `src/pages/templateBuilder.astro`
5. Update static paths in `getStaticPaths()`

### Font Management
Custom fonts are loaded via `@font-face` declarations in Layout.astro:
- Yellowtail (decorative)
- Oswald (headings, 400 & 700 weights)
- Source Sans 3 (body text, via CSS fallback)

### Dark Mode Implementation
- Theme detection script runs inline before page render
- Uses `data-theme="dark"` attribute on document element
- CSS custom properties automatically switch based on theme
- Theme preference stored in localStorage

### Component Naming Conventions
- Layout components: PascalCase (e.g., `Hero.astro`, `Services.astro`)
- Component variations: Numbered (e.g., `1.astro`, `2.astro`)
- Show components: Match their corresponding layout name
- CSS classes: kebab-case with BEM-like structure where appropriate

### Features to implement
 Feature 1: i want to click on a button and all <img> will replace their src by a grey default like a placeholder, we gonna set at center a button for upload the new src for replace it.

 Feature 2: after will make the same for make all txt editable.

 Feature 3(not priority): change different color who is stock in :root directly with form in the page for custom

 Question: it it better/simple to make it in same page as templateBuilder, or, to select the current Layout selected in all select, build a specific ui with only those layout in a new page, then implement the two earlier features?