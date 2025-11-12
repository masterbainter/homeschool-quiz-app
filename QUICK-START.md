# Quick Start Guide - Homeschool Learning Hub

Your complete homeschool app with dynamic curriculum and AI quiz generation!

## 🌐 Your Site

**Live URL:** https://school.bainter.xyz

### Pages:
- `/` - Dashboard with all subjects
- `/reading` - Reading subject (book quizzes)
- `/reading/books` - Book quiz list
- `/todos` - Student homework/task management
- `/admin` - Admin panel (you only)

## 🚀 Quick Deploy AI Generation

To enable AI quiz generation, run this one command:

```bash
./deploy-ai.sh
```

This will:
1. Login to Firebase (if needed)
2. Set your Anthropic API key
3. Deploy the AI function
4. Give you next steps

**Manual deployment:** See `DEPLOY-FUNCTIONS.md`

## 📝 Creating Quizzes

### Option 1: AI Generation (Recommended)

1. Go to https://school.bainter.xyz/admin
2. Click "Add New Quiz"
3. Enter book details:
   - Title: "Charlotte's Web"
   - Author: "E.B. White" (optional)
   - Questions: 8
   - Difficulty: Medium (Ages 10-11)
   - Context: "Focus on friendship themes" (optional)
4. Click "Generate Quiz"
5. Wait 15-30 seconds
6. Review/edit questions
7. Save!

**Cost:** ~$0.015 per quiz (~1.5 cents)

### Option 2: Manual Entry

1. Click "Manual Entry Instead"
2. Add questions one by one
3. Save when done

### Option 3: Hybrid

1. Generate with AI
2. Edit any questions you want
3. Click "+ Add Question" to add more manually
4. Remove questions you don't want
5. Save your custom quiz!

## 👨‍🏫 Managing Curriculum

### Current Setup:
```
Reading & Literature 📚
  └── Book Quizzes (Quiz section)
```

### Adding More Subjects (Future):

Edit in Firebase Console > Realtime Database > `curriculum`:

```javascript
{
  "math": {
    "title": "Mathematics",
    "icon": "🔢",
    "description": "Practice math skills",
    "order": 2,
    "enabled": true,
    "color": "math",
    "sections": {
      "arithmetic": {
        "title": "Arithmetic Practice",
        "description": "Addition, subtraction, multiplication, division",
        "type": "quiz",
        "order": 1,
        "enabled": true
      }
    }
  }
}
```

Then create quizzes with ID: `math-arithmetic-fractions`

## 📊 Viewing Results

### Student Quiz Results:
1. Firebase Console > Realtime Database
2. Navigate to `quiz-results`
3. See all quiz attempts with:
   - Student name and email
   - Quiz name
   - Score and percentage
   - Timestamp

### Student Todos:
1. Firebase Console > Realtime Database
2. Navigate to `todos/{userId}`
3. See all their tasks

Or use the admin view at `/todos` (when signed in as admin)

## 🔐 Security

### Firebase Rules:

Your database rules (already configured):

```json
{
  "rules": {
    "curriculum": {
      ".read": "auth != null",
      ".write": "auth.token.email === 'techride.trevor@gmail.com'"
    },
    "quizzes": {
      ".read": "auth != null",
      ".write": "auth.token.email === 'techride.trevor@gmail.com'"
    },
    "quiz-results": {
      ".read": "auth.token.email === 'techride.trevor@gmail.com'",
      ".write": "auth != null"
    },
    "todos": {
      ".read": "auth != null && (root.child('todos').child(auth.uid).exists() || auth.token.email === 'techride.trevor@gmail.com')",
      "$userId": {
        ".read": "auth.uid === $userId || auth.token.email === 'techride.trevor@gmail.com'",
        ".write": "auth.uid === $userId"
      }
    }
  }
}
```

**What this means:**
- Students can read curriculum and quizzes
- Only you can create/edit curriculum and quizzes
- Only you can see all quiz results
- Students can only see/edit their own todos
- You can see everyone's todos

## 👥 Student Access

Students need:
1. Google account
2. Sign in at https://school.bainter.xyz
3. Click subject → section → quiz
4. Take quiz, see results
5. Use `/todos` for homework

## 🎨 Customization

### Change Colors:

Edit `dashboard-styles.css`:

```css
.subject-card.reading {
    background: linear-gradient(135deg, #YOUR_COLOR1, #YOUR_COLOR2);
}
```

### Add More Difficulty Levels:

Edit `admin.html` AI section:

```html
<option value="beginner">Beginner (Ages 6-8)</option>
```

### Change Admin Email:

Edit `admin.js` and `functions/index.js`:

```javascript
const ADMIN_EMAIL = 'your-new-email@gmail.com';
```

Then redeploy functions.

## 📈 Usage Tips

### For Best AI Quizzes:
- Be specific with book title and author
- Use context field for focused quizzes ("Focus on chapters 1-5")
- Start with 8 questions, adjust based on results
- Review AI questions - sometimes they need tweaking

### Quiz Naming Convention:
- Format: `{subject}-{section}-{quiz-name}`
- Example: `reading-books-charlottes-web`
- Automatically handled by admin panel

### Expanding Curriculum:
1. Add subject to Firebase `curriculum`
2. Enable it (`enabled: true`)
3. Add sections within subject
4. Create quizzes with matching prefix
5. Students see it immediately!

## 🐛 Troubleshooting

### AI generation not working:
1. Check function is deployed: `firebase functions:list`
2. Check API key: `firebase functions:config:get`
3. Check logs: `firebase functions:log`
4. Try redeploying: `./deploy-ai.sh`

### Students can't access:
1. Check they're signed in with Google
2. Verify Firebase Auth is enabled
3. Check database rules in Firebase Console

### Quiz not showing:
1. Verify quiz ID matches pattern: `{subject}-{section}-{name}`
2. Check quiz is saved in Firebase Database
3. Refresh browser

## 💰 Costs

### Firebase:
- **Free tier:** 50K reads/day, 20K writes/day
- **Your usage:** Well within free tier
- **Cost:** $0/month

### Claude API:
- **Cost:** ~$0.015 per quiz generated
- **100 quizzes:** ~$1.50
- **Very affordable for homeschooling**

### Total:
- **Hosting:** Free (GitHub Pages)
- **Database:** Free (Firebase)
- **AI:** Pay per use (~1.5¢ per quiz)

## 📚 Documentation Files

- `README.md` - Original project overview
- `FIREBASE-SETUP.md` - Complete Firebase setup
- `AI-QUIZ-SETUP.md` - AI generation setup options
- `DEPLOY-FUNCTIONS.md` - Detailed deployment guide
- `DNS-SETUP.md` - Custom domain setup
- `URL-STRUCTURE.md` - How routing works
- `QUICK-START.md` - This file!

## 🎯 Next Steps

1. **Deploy AI:** Run `./deploy-ai.sh`
2. **Create First Quiz:** Use AI to generate a quiz
3. **Add Students:** Have them sign in with Google
4. **Monitor Progress:** Check quiz results in Firebase
5. **Expand:** Add more subjects when ready

## 🆘 Need Help?

Check the documentation files above, or:
1. Check Firebase Console for errors
2. Check browser console (F12) for errors
3. Review function logs: `firebase functions:log`

## 🎉 You're All Set!

Your homeschool app is ready with:
- ✅ Dynamic curriculum system
- ✅ AI quiz generation
- ✅ Student todo management
- ✅ Progress tracking
- ✅ Secure authentication
- ✅ Beautiful UI
- ✅ Mobile responsive

**Start creating quizzes and let your kids learn!** 📚✨
