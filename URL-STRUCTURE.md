# URL Structure - Homeschool App

**Date**: November 18, 2025
**Status**: ✅ Complete

---

## Pretty URLs Implemented

All pages now use clean directory-based URLs without `.html` extensions.

### Main Pages

| URL | File Path | Description |
|-----|-----------|-------------|
| `/` | `/index.html` | Dashboard (home page) |
| `/quiz` | `/quiz/index.html` | Book quizzes |
| `/subjects` | `/subjects/index.html` | Subject browser |
| `/todos` | `/todos/index.html` | To-do list |

### Teacher & Admin Pages

| URL | File Path | Description |
|-----|-----------|-------------|
| `/teacher` | `/teacher/index.html` | Teacher panel |
| `/admin` | `/admin/index.html` | Admin panel |

### Documentation Pages

| URL | File Path | Description |
|-----|-----------|-------------|
| `/how-to-use` | `/how-to-use.html` | Usage guide |
| `/whats-new` | `/whats-new.html` | Feature comparison |
| `/offline` | `/offline.html` | Offline fallback |

---

## How It Works

### Directory Structure

```
homeschool/
├── index.html                  # Dashboard - serves at /
├── quiz/
│   └── index.html              # Quizzes - serves at /quiz
├── subjects/
│   └── index.html              # Subjects - serves at /subjects
├── todos/
│   └── index.html              # To-dos - serves at /todos
├── teacher/
│   └── index.html              # Teacher panel - serves at /teacher
└── admin/
    └── index.html              # Admin panel - serves at /admin
```

### Firebase Hosting Configuration

Firebase Hosting automatically serves `index.html` files when accessing directory paths:

- `/quiz` → serves `/quiz/index.html`
- `/subjects` → serves `/subjects/index.html`
- `/todos` → serves `/todos/index.html`

No rewrites needed in `firebase.json` - the directory structure handles it automatically!

---

## Navigation Links Updated

All navigation links across the app now use pretty URLs:

### Bottom Navigation (Mobile)
```html
<a href="/">Home</a>
<a href="/subjects">Subjects</a>
<a href="/todos">To-Do</a>
<a href="/quiz">Quizzes</a>
```

### Dashboard Quick Actions
```javascript
window.location.href='/subjects'
window.location.href='/todos'
```

---

## Benefits

✅ **Clean URLs** - No `.html` extensions visible
✅ **Professional** - Modern web app feel
✅ **SEO-Friendly** - Better for search engines
✅ **Shareable** - Easier to share and remember
✅ **Future-Proof** - Easy to add more nested routes
✅ **Consistent** - All pages follow same pattern

---

## Testing URLs

### Local Development
```bash
# Start Firebase emulators
npm run dev

# Test URLs
http://localhost:5050/
http://localhost:5050/quiz
http://localhost:5050/subjects
http://localhost:5050/todos
http://localhost:5050/teacher
http://localhost:5050/admin
```

### Production
```bash
# Deploy to Firebase Hosting
npm run deploy

# Test URLs
https://your-app.web.app/
https://your-app.web.app/quiz
https://your-app.web.app/subjects
https://your-app.web.app/todos
```

---

## URL Consistency

All URLs now use **plural nouns** for consistency:
- ✅ `/subjects` (not `/subject`)
- ✅ `/todos` (not `/todo`)
- ✅ `/quiz` (acceptable singular - refers to quiz system)

This follows REST API best practices and makes URLs more intuitive.

---

**Updated by**: Claude (AI Assistant)
**Date**: November 18, 2025
