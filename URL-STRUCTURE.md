# URL Structure

This app uses pretty URLs for a cleaner user experience.

## Available URLs

| Pretty URL | Actual File | Description |
|------------|-------------|-------------|
| `/` | `index.html` | Main quiz app homepage |
| `/todos` | `todos.html` | Todo list for students (requires login) |
| `/admin` | `admin.html` | Admin panel (restricted to techride.trevor@gmail.com) |

## How It Works

The app uses GitHub Pages' 404 handler to route pretty URLs:

1. User visits `/admin`
2. GitHub Pages serves `404.html`
3. JavaScript in `404.html` redirects to `admin.html`
4. URL stays clean as `/admin`

## Internal Links

All internal navigation uses pretty URLs:
- `window.location.href = '/'` - Go to home
- `window.location.href = '/todos'` - Go to todos
- `window.location.href = '/admin'` - Go to admin panel

## Benefits

- **Cleaner URLs**: `/admin` instead of `/admin.html`
- **Professional appearance**: Better for sharing
- **Consistent experience**: Matches modern web apps
- **GitHub Pages compatible**: Works without server-side routing

## Technical Details

- `404.html` handles all routing logic
- Routes are defined in a simple JavaScript mapping
- Falls back to actual 404 for unknown routes
- Preserves query strings and hashes
