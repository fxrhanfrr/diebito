# 🎨 Diabeto Maestro - Styling Guide

This guide explains how to use the centralized CSS classes in your project for consistent styling and easy maintenance.

## 📁 File Structure

- `app/globals.css` - Main CSS file with all custom properties and utility classes
- `STYLING_GUIDE.md` - This documentation file

## 🎯 CSS Custom Properties (Variables)

All colors, spacing, and other design tokens are defined as CSS custom properties for easy customization:

### Colors
```css
--primary-blue: #2563eb;
--primary-green: #16a34a;
--primary-red: #dc2626;
--primary-yellow: #eab308;
--primary-purple: #9333ea;
```

### Gradients
```css
--gradient-primary: linear-gradient(135deg, #dbeafe 0%, #dcfce7 100%);
--gradient-secondary: linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%);
--gradient-success: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
--gradient-warning: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
--gradient-error: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
```

### Text Colors
```css
--text-primary: #111827;
--text-secondary: #6b7280;
--text-muted: #9ca3af;
--text-light: #d1d5db;
```

## 🧩 Utility Classes

### Layout Classes
```html
<!-- Page containers -->
<div className="page-container">          <!-- min-h-screen p-6 -->
<div className="page-content">            <!-- max-w-7xl mx-auto -->
<div className="page-header">             <!-- mb-8 -->
<h1 className="page-title">              <!-- text-3xl font-bold text-gray-900 mb-2 -->
<p className="page-subtitle">             <!-- text-gray-600 -->
```

### Background Classes
```html
<div className="bg-gradient-primary">     <!-- Primary gradient background -->
<div className="bg-gradient-secondary">   <!-- Secondary gradient background -->
<div className="bg-gradient-success">     <!-- Success gradient background -->
<div className="bg-gradient-warning">     <!-- Warning gradient background -->
<div className="bg-gradient-error">       <!-- Error gradient background -->
<div className="bg-page">                 <!-- Gray-50 background -->
<div className="bg-card">                 <!-- White card background -->
```

### Text Classes
```html
<p className="text-primary">              <!-- Primary text color -->
<p className="text-secondary">            <!-- Secondary text color -->
<p className="text-muted">                <!-- Muted text color -->
<p className="text-light">                <!-- Light text color -->
```

### Button Classes
```html
<button className="btn-primary">          <!-- Blue primary button -->
<button className="btn-secondary">        <!-- Gray secondary button -->
<button className="btn-success">          <!-- Green success button -->
<button className="btn-warning">          <!-- Yellow warning button -->
<button className="btn-error">            <!-- Red error button -->
```

### Card Classes
```html
<div className="card">                    <!-- Basic card styling -->
<div className="card-hover">              <!-- Card with hover effect -->
<div className="card-header">             <!-- Card header styling -->
<div className="card-content">            <!-- Card content styling -->
```

### Form Classes
```html
<div className="form-container">          <!-- Form page container -->
<div className="form-card">               <!-- Form card styling -->
<div className="form-group">              <!-- Form group spacing -->
<label className="form-label">            <!-- Form label styling -->
<input className="form-input">            <!-- Form input styling -->
<div className="form-error">              <!-- Error message styling -->
<div className="form-success">            <!-- Success message styling -->
```

### Navigation Classes
```html
<a className="nav-link">                  <!-- Navigation link styling -->
<a className="nav-link-active">           <!-- Active navigation link -->
<a className="nav-mobile-link">           <!-- Mobile navigation link -->
```

### Status Classes
```html
<span className="status-pending">         <!-- Pending status badge -->
<span className="status-completed">       <!-- Completed status badge -->
<span className="status-cancelled">       <!-- Cancelled status badge -->
<span className="status-active">          <!-- Active status badge -->
<span className="status-inactive">        <!-- Inactive status badge -->
```

### Badge Classes
```html
<span className="badge-primary">          <!-- Primary badge -->
<span className="badge-secondary">        <!-- Secondary badge -->
<span className="badge-success">          <!-- Success badge -->
<span className="badge-warning">          <!-- Warning badge -->
<span className="badge-error">            <!-- Error badge -->
```

### Icon Classes
```html
<Icon className="icon-sm">                <!-- Small icon (16x16) -->
<Icon className="icon-md">                <!-- Medium icon (20x20) -->
<Icon className="icon-lg">                <!-- Large icon (24x24) -->
<Icon className="icon-xl">                <!-- Extra large icon (32x32) -->
```

### Spacing Classes
```html
<div className="space-section">           <!-- Section spacing (space-y-6) -->
<div className="space-content">           <!-- Content spacing (space-y-4) -->
<div className="space-items">             <!-- Item spacing (space-y-2) -->
```

### Grid Classes
```html
<div className="grid-responsive">         <!-- Responsive grid (1/2/3 cols) -->
<div className="grid-2-cols">             <!-- 2 column grid -->
<div className="grid-3-cols">             <!-- 3 column grid -->
```

### Flex Classes
```html
<div className="flex-center">             <!-- Center items -->
<div className="flex-between">            <!-- Space between items -->
<div className="flex-start">              <!-- Align items start -->
<div className="flex-end">                <!-- Align items end -->
```

### Animation Classes
```html
<div className="animate-fade-in">         <!-- Fade in animation -->
<div className="animate-slide-up">        <!-- Slide up animation -->
<div className="animate-bounce-in">       <!-- Bounce in animation -->
```

### Loading Classes
```html
<div className="loading-spinner">         <!-- Spinning loader -->
<div className="loading-dots">            <!-- Dots loader container -->
<div className="loading-dot">             <!-- Individual dot -->
```

### Empty State Classes
```html
<div className="empty-state">             <!-- Empty state container -->
<div className="empty-state-icon">        <!-- Empty state icon -->
<h3 className="empty-state-title">       <!-- Empty state title -->
<p className="empty-state-description">   <!-- Empty state description -->
```

## 🔧 How to Customize

### 1. Change Colors
Edit the CSS custom properties in `app/globals.css`:

```css
:root {
  --primary-blue: #your-color;
  --primary-green: #your-color;
  /* ... other colors */
}
```

### 2. Modify Gradients
Update gradient definitions:

```css
:root {
  --gradient-primary: linear-gradient(135deg, #color1 0%, #color2 100%);
}
```

### 3. Adjust Spacing
Modify spacing variables:

```css
:root {
  --spacing-md: 1.5rem; /* Change from 1rem to 1.5rem */
}
```

### 4. Update Border Radius
Change border radius values:

```css
:root {
  --radius-md: 0.75rem; /* Change from 0.5rem to 0.75rem */
}
```

## 📱 Responsive Design

The CSS includes responsive utilities that automatically adjust based on screen size:

- **Mobile (≤640px)**: Reduced padding, smaller text
- **Tablet (768px+)**: Medium padding and spacing
- **Desktop (1024px+)**: Full padding and spacing

## 🌙 Dark Mode Support

Dark mode is automatically supported through CSS custom properties. The system will switch colors based on the user's preference:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: #f9fafb;
    --bg-primary: #111827;
    /* ... other dark mode overrides */
  }
}
```

## 🎨 Usage Examples

### Complete Page Layout
```html
<div className="page-container bg-page">
  <div className="page-content">
    <div className="page-header">
      <h1 className="page-title">Page Title</h1>
      <p className="page-subtitle">Page description</p>
    </div>
    
    <div className="grid-responsive">
      <div className="card card-hover">
        <div className="card-header">
          <h3>Card Title</h3>
        </div>
        <div className="card-content">
          <p className="text-secondary">Card content</p>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Form Layout
```html
<div className="form-container bg-gradient-primary">
  <div className="form-card">
    <div className="form-group">
      <label className="form-label">Label</label>
      <input className="form-input" />
    </div>
    <button className="btn-primary">Submit</button>
  </div>
</div>
```

### Loading State
```html
<div className="empty-state">
  <div className="loading-spinner"></div>
  <div className="text-muted">Loading...</div>
</div>
```

### Empty State
```html
<div className="empty-state">
  <div className="empty-state-icon">📝</div>
  <h3 className="empty-state-title">No items found</h3>
  <p className="empty-state-description">Description text</p>
  <button className="btn-primary">Action</button>
</div>
```

## 🚀 Benefits

1. **Consistency**: All components use the same design tokens
2. **Maintainability**: Change colors/spacing in one place
3. **Performance**: Reduced CSS bundle size
4. **Accessibility**: Built-in dark mode support
5. **Responsive**: Automatic mobile-first design
6. **Developer Experience**: Easy to use class names

## 🔄 Migration from Tailwind

Instead of:
```html
<div className="min-h-screen bg-gray-50 p-6">
  <div className="max-w-7xl mx-auto">
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Title</h1>
```

Use:
```html
<div className="page-container bg-page">
  <div className="page-content">
    <h1 className="page-title">Title</h1>
```

This approach makes your code more maintainable and easier to customize!
