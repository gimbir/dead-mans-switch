# If I Should Die Before I Wake - Frontend

Modern, secure, and user-friendly frontend application for the Dead Man's Switch system. Built with React, TypeScript, and Tailwind CSS.

## Overview

This is the frontend application for "If I Should Die Before I Wake" - a dead man's switch service that allows users to schedule encrypted messages to be sent to loved ones if they fail to check in regularly. The frontend provides an intuitive interface for managing switches, messages, and check-ins.

## Features

- **Authentication System**
  - User registration and login
  - JWT-based authentication
  - Protected routes and session management
  - Remember me functionality

- **Switch Management**
  - Create, edit, and delete switches
  - Configure check-in intervals and grace periods
  - Real-time switch status monitoring
  - Batch operations on switches

- **Message Management**
  - Create and manage encrypted messages
  - Support for multiple recipients
  - Message preview functionality
  - Organized message list with filtering

- **User Experience**
  - Multi-language support (English, Turkish)
  - Dark/Light theme toggle
  - Responsive design for all devices
  - Loading states and error boundaries
  - Toast notifications
  - Confirmation dialogs for critical actions

- **Custom Hooks**
  - `useAuth` - Authentication state management
  - `useCheckIn` - Check-in operations
  - `useMessages` - Message CRUD operations
  - `useSwitches` - Switch management
  - `useConfirmDialog` - Confirmation dialog state

## Tech Stack

### Core
- **React 19** - UI library
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool and dev server

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Flag Icons** - Country flags for language switcher

### State Management & Data Fetching
- **Zustand** - Lightweight state management
- **TanStack Query (React Query)** - Server state management
- **Axios** - HTTP client

### Forms & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **@hookform/resolvers** - Zod integration

### Routing & Navigation
- **React Router DOM 7** - Client-side routing

### Internationalization
- **i18next** - Internationalization framework
- **react-i18next** - React bindings for i18next
- **i18next-browser-languagedetector** - Language detection

### Utilities
- **date-fns** - Date manipulation
- **react-hot-toast** - Toast notifications

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Authentication forms
│   │   ├── common/       # Reusable components
│   │   ├── layout/       # Layout components
│   │   ├── message/      # Message components
│   │   └── switch/       # Switch components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── i18n/             # Internationalization
│   │   └── locales/      # Translation files
│   ├── pages/            # Page components
│   │   ├── auth/         # Auth pages
│   │   ├── dashboard/    # Dashboard page
│   │   └── switch/       # Switch pages
│   ├── services/         # API services
│   ├── stores/           # Zustand stores
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── constants/        # Constants and configs
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── .env.example          # Environment variables template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── tailwind.config.js    # Tailwind config
└── vite.config.ts        # Vite config
```

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- Yarn package manager

### Installation

1. Clone the repository and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
yarn install
```

3. Create environment variables file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### Development

Start the development server:
```bash
yarn dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:
```bash
yarn build
```

Preview the production build:
```bash
yarn preview
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Start development server with hot reload |
| `yarn build` | Build for production |
| `yarn preview` | Preview production build locally |
| `yarn lint` | Run ESLint |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api` |

## Key Components

### Common Components
- **ErrorBoundary** - Catches and handles React errors
- **ConfirmDialog** - Reusable confirmation dialog
- **LoadingSkeleton** - Loading state placeholders
- **ProtectedRoute** - Route wrapper for authentication
- **ThemeSwitcher** - Dark/Light mode toggle
- **LanguageSwitcher** - Language selection

### Feature Components
- **SwitchCard** - Display switch information
- **SwitchForm** - Create/Edit switch form
- **SwitchList** - List of switches with filtering
- **CheckInButton** - Quick check-in action
- **MessageForm** - Create/Edit message
- **MessageList** - Display messages
- **MessagePreview** - Preview message content

## Theming

The application supports dark and light themes with custom CSS variables. Theme preferences are persisted in localStorage.

### Theme System
- Automatic theme detection based on system preferences
- Manual theme toggle
- Persistent theme selection
- Theme-aware components

## Internationalization

Currently supported languages:
- English (en)
- Turkish (tr)

Language detection is automatic based on browser settings, with manual override available via the LanguageSwitcher component.

### Adding a New Language

1. Create a new translation file in `src/i18n/locales/`
2. Add the language to the i18n configuration
3. Update the LanguageSwitcher component

## Code Style & Conventions

- **TypeScript** - Strict mode enabled
- **ESLint** - Code linting and formatting
- **Component Organization** - Feature-based folder structure
- **Naming Conventions**:
  - Components: PascalCase
  - Hooks: camelCase with `use` prefix
  - Services: camelCase with `.service.ts` suffix
  - Types: PascalCase with descriptive names

## Performance Optimizations

- Code splitting with React.lazy
- Query caching with TanStack Query
- Optimized re-renders with proper memoization
- Tree-shaking with Vite
- CSS optimization with Tailwind

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Write meaningful commit messages
3. Add tests for new features
4. Update documentation as needed

## License

This project is part of the "If I Should Die Before I Wake" application.

## Related

- [Backend Repository](../backend) - Node.js/Express backend API
- [Project Plan](../PROJECT_PLAN.md) - Overall project documentation
