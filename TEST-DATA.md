# Test Data Setup - Homeschool App

**Date**: November 18, 2025
**Status**: ✅ Subjects populated with test data

---

## Test Subjects Available

The app now has **6 complete subjects** with sample content:

### 1. 🔢 Mathematics
- **3 sections**: Basic Arithmetic, Beginning Algebra, Geometry Basics
- **30 total items** across all sections
- Color: Blue

### 2. 🔬 Science
- **3 sections**: Life Science, Matter & Chemistry, Forces & Motion
- **37 total items** across all sections
- Color: Green

### 3. 📚 History
- **3 sections**: Ancient Civilizations, American History, World Geography
- **44 total items** across all sections
- Color: Orange

### 4. 📖 Literature & Reading
- **3 sections**: Reading Comprehension, Creative Writing, Classic Literature
- **43 total items** across all sections
- Color: Purple

### 5. ✍️ Language Arts
- **3 sections**: Grammar & Mechanics, Vocabulary Building, Spelling & Phonics
- **38 total items** across all sections
- Color: Pink

### 6. 🎨 Arts & Music
- **3 sections**: Visual Arts, Music Theory, Drama & Theater
- **24 total items** across all sections
- Color: Teal

---

## How to Use Test Data

### View Subjects Dashboard
```bash
# Navigate to subjects page
http://localhost:5050/subjects
```

You'll see all 6 subjects displayed in a beautiful grid with:
- Subject icons
- Subject titles
- Descriptions
- Section counts

### View Individual Subject
Click on any subject card to see its sections. For example:
```bash
# Mathematics subject with query parameter
http://localhost:5050/subjects?subject=mathematics
```

Each subject page shows:
- Subject header with icon and description
- Grid of available sections
- Section type badges (lessons, projects, practice, etc.)
- Item counts per section

---

## Setup Scripts

### Initial Setup (Already Run)
```bash
node setup-test-subjects.js
```

This populates the Firebase emulator with all test subjects and sections.

### Reset Test Data
To reset and repopulate test data:
```bash
# Stop emulators
# Restart emulators (clears data)
npm run dev

# In another terminal, repopulate
node setup-test-subjects.js
```

---

## Data Structure

Test data follows this Firebase structure:

```
curriculum/
├── mathematics/
│   ├── id: "mathematics"
│   ├── title: "Mathematics"
│   ├── description: "..."
│   ├── icon: "🔢"
│   ├── color: "blue"
│   ├── enabled: true
│   ├── order: 1
│   └── sections/
│       ├── arithmetic/
│       │   ├── title: "Basic Arithmetic"
│       │   ├── description: "..."
│       │   ├── type: "lessons"
│       │   ├── itemCount: 12
│       │   └── order: 1
│       ├── algebra/
│       └── geometry/
├── science/
├── history/
├── literature/
├── language/
└── arts/
```

---

## Testing Features

With this test data, you can now test:

✅ **Subject Grid Display** - Dashboard shows all subjects
✅ **Subject Navigation** - Click to navigate to subject details
✅ **Section Display** - Each subject shows its sections
✅ **Section Counts** - Item counts display correctly
✅ **Color Themes** - Different colors per subject
✅ **Icons** - Emoji icons for each subject
✅ **Filtering** - Enabled/disabled subjects
✅ **Sorting** - Subjects ordered by `order` field

---

## Modifying Test Data

To add or modify subjects, edit `setup-test-subjects.js`:

```javascript
const testCurriculum = {
  // Add your custom subject here
  cooking: {
    id: 'cooking',
    title: 'Cooking & Nutrition',
    description: 'Recipes, nutrition, and food science',
    icon: '🍳',
    color: 'red',
    enabled: true,
    order: 7,
    sections: {
      basics: {
        id: 'basics',
        title: 'Kitchen Basics',
        description: 'Essential cooking skills',
        type: 'lessons',
        enabled: true,
        order: 1,
        itemCount: 10
      }
    }
  }
};
```

Then run:
```bash
node setup-test-subjects.js
```

---

## Available Colors

The app supports these subject colors:
- `blue` - Mathematics (cool, logical)
- `green` - Science (nature, growth)
- `orange` - History (warm, classic)
- `purple` - Literature (creative, artistic)
- `pink` - Language (communication, friendly)
- `teal` - Arts (vibrant, expressive)
- `red` - Optional (energy, passion)
- `yellow` - Optional (bright, cheerful)

Colors are defined in `design-system-2026.css`.

---

## Next Steps

Now that subjects are populated, you can:

1. **Test Navigation** - Click through subjects and sections
2. **Add Quiz Content** - Populate sections with actual quizzes/lessons
3. **Customize** - Modify subjects for your specific curriculum
4. **Add Students** - Use `setup-dev-users.js` to add test student accounts
5. **Track Progress** - Test student progress tracking features

---

**Created by**: Claude (AI Assistant)
**Date**: November 18, 2025
