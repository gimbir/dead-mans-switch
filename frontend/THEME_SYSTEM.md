# Centralized Theme System

## Overview

We use CSS Variables to manage all theme colors in one place (`src/index.css`). This eliminates the need for `dark:` prefixes everywhere!

## How It Works

All theme colors are defined as CSS variables in `:root` (light mode) and `:root.dark` (dark mode). The theme automatically switches when the user changes their preference.

## Usage

### Instead of This (Old Way):
```tsx
// ❌ DON'T: Using dark: prefix everywhere
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  <p className="text-gray-600 dark:text-gray-300">Text</p>
</div>
```

### Use This (New Way):
```tsx
// ✅ DO: Using theme utility classes
<div className="bg-theme-card text-theme-primary">
  <p className="text-theme-secondary">Text</p>
</div>
```

## Available Utility Classes

### Background Colors
- `.bg-theme-primary` - Main background (white → gray-800)
- `.bg-theme-secondary` - Secondary background (gray-50 → gray-900)
- `.bg-theme-card` - Card backgrounds (white → gray-800)
- `.bg-theme-hover` - Hover states (gray-100 → gray-700)

### Text Colors
- `.text-theme-primary` - Primary text (gray-900 → gray-100)
- `.text-theme-secondary` - Secondary text (gray-600 → gray-300)
- `.text-theme-tertiary` - Tertiary text (gray-500 → gray-400)
- `.text-theme-inverse` - Inverse text (white → gray-900)

### Border Colors
- `.border-theme-primary` - Primary borders (gray-200 → gray-700)
- `.border-theme-secondary` - Secondary borders (gray-300 → gray-600)

### Brand Colors
- `.bg-brand-primary` - Brand color button/backgrounds
- `.text-brand-primary` - Brand color text
- `.border-brand-primary` - Brand color borders

## Custom Colors (Direct Variables)

You can also use variables directly in your components:

```tsx
<div style={{ backgroundColor: 'rgb(var(--bg-card))' }}>
  <p style={{ color: 'rgb(var(--text-primary))' }}>Text</p>
</div>
```

## Available CSS Variables

### Light Mode
- `--bg-primary`: white
- `--bg-card`: white
- `--text-primary`: gray-900
- `--text-secondary`: gray-600
- `--color-primary`: indigo-600
- `--color-success`: green-500
- `--color-error`: red-500

### Dark Mode (Automatically Applied)
- `--bg-primary`: gray-800
- `--bg-card`: gray-800
- `--text-primary`: gray-100
- `--text-secondary`: gray-300
- `--color-primary`: indigo-500
- (Colors adjust automatically)

## Benefits

1. **Single Source of Truth**: All colors in `src/index.css`
2. **No Repetition**: No need for `dark:` prefix everywhere
3. **Easy Maintenance**: Change theme colors in one place
4. **Automatic**: Theme switches happen automatically
5. **Consistent**: Same color names across all components

## Example Component

```tsx
export const MyComponent = () => {
  return (
    <div className="bg-theme-card border border-theme-primary rounded-lg p-4">
      <h2 className="text-theme-primary text-xl font-bold">
        Title
      </h2>
      <p className="text-theme-secondary mt-2">
        This text automatically adapts to dark/light mode!
      </p>
      <button className="bg-brand-primary text-theme-inverse px-4 py-2 rounded">
        Click Me
      </button>
    </div>
  );
};
```

## Future: Extend the System

To add new theme colors, edit `src/index.css`:

```css
:root {
  --my-custom-color: 123 45 67; /* RGB values */
}

:root.dark {
  --my-custom-color: 234 56 78; /* RGB values for dark mode */
}

/* Then create utility class */
@layer utilities {
  .bg-custom { background-color: rgb(var(--my-custom-color)); }
}
```

That's it! Your custom color is now theme-aware! 🎨
