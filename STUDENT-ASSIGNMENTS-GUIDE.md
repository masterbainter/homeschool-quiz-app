# Student Assignment & Progress Tracking Guide

## Overview
You can now assign specific quizzes to students and track their progress!

## Student Profiles

### Configured Students
- **madmaxmadadax@gmail.com**
- **sakurasaurusjade@gmail.com**

### How Student Accounts Work
1. Student signs in with their Google account
2. They take their first quiz
3. Their profile is automatically created in Firebase
4. You can then assign quizzes to them
5. Their progress is tracked automatically

**Note:** You cannot assign quizzes until the student has taken at least one quiz (this creates their userId in the system).

## Admin: Assigning Quizzes

### Step 1: Access Student Progress Page
1. Go to admin panel: `/admin`
2. Click "👨‍🎓 Student Progress" button
3. View all students with their stats

### Step 2: Select a Student
Click on a student card to view their detailed progress. You'll see:
- **Assigned**: Number of quizzes assigned to them
- **Completed**: Number they've finished
- **Avg Score**: Average across all quiz attempts

### Step 3: Assign Quizzes
1. Click the green "+ Assign Quizzes" button
2. A modal shows all available quizzes
3. Check the boxes for quizzes you want to assign
4. Click "Save Assignments"
5. Student will see them on their homepage!

### Step 4: Monitor Progress
The student details page shows:

**Assignments Table:**
- Quiz name
- Status (Not Started / In Progress / Completed)
- Best score
- Number of attempts
- Date assigned
- Unassign button

**Recent Results Table:**
- All quiz attempts
- Scores and percentages
- Timestamps

## Student: Taking Assigned Quizzes

### What Students See

**On Homepage:**
When students log in, they see a "📝 My Assigned Quizzes" section at the top with:
- All quizzes assigned to them
- Status badges:
  - 🔴 **Not Started** - Haven't attempted yet
  - 🟡 **In Progress** - Started, scored under 80%
  - 🟢 **Completed** - Achieved 80% or higher
- Best score and attempt count
- Date assigned

**Visual Indicator:**
- Assigned quiz cards have a blue border
- 📌 Pin icon in corner
- Clickable to start/retake quiz

### How to Take an Assigned Quiz

1. Log in to school.bainter.xyz
2. See "My Assigned Quizzes" at top
3. Click on any quiz card
4. Take the quiz
5. Results are automatically saved
6. Can retake to improve score

## Progress Tracking

### For Students
- See all assigned quizzes on homepage
- Track own completion status
- View best scores
- Can retake to improve

### For Admin (You)
- See all students in one view
- Click any student to view details
- Monitor completion rates
- See best scores and all attempts
- Identify who needs help

## Assignment Workflow Example

**Monday Morning:**
1. You create a quiz for "Charlotte's Web"
2. Go to Student Progress page
3. Select student "madmaxmadadax@gmail.com"
4. Click "Assign Quizzes"
5. Check "Charlotte's Web"
6. Save

**Student Experience:**
1. Student logs in
2. Sees "My Assigned Quizzes" section
3. Sees "Charlotte's Web" with "Not Started" badge
4. Clicks and takes quiz
5. Completes with 85%
6. Badge updates to "Completed - 85%"

**Your View:**
1. Return to Student Progress
2. See assignment now shows "85% (1 attempt)"
3. Status badge shows "Completed"
4. Recent Results shows details with timestamp

## Features

### Assignment Management
- ✅ Assign multiple quizzes at once
- ✅ Unassign individual quizzes
- ✅ See assignment date
- ✅ Track who assigned it (always shows your email)

### Progress Monitoring
- ✅ Real-time updates as students complete quizzes
- ✅ Best score tracking (not just latest)
- ✅ Attempt count
- ✅ Completion status
- ✅ Average score across all attempts

### Student View
- ✅ Prominent "Assigned Quizzes" section
- ✅ Status badges (clear visual feedback)
- ✅ Quick access - click to start
- ✅ Can retake to improve scores

## Data Storage

### Firebase Structure
```
assignments/
  {userId}/
    {quizId}/
      assignedDate: "2025-11-13T00:00:00.000Z"
      assignedBy: "techride.trevor@gmail.com"

quiz-results/
  {resultId}/
    userId: "abc123"
    userEmail: "student@gmail.com"
    userName: "Student Name"
    quizId: "reading-books-charlottes-web"
    quiz: "Charlotte's Web"
    score: 8
    total: 10
    percentage: 80
    timestamp: "2025-11-13T00:00:00.000Z"
```

## Tips & Best Practices

### For You (Admin)

1. **Set Clear Expectations**
   - Assign quizzes after the book is read
   - Tell students when quizzes are assigned
   - Set completion deadlines verbally

2. **Monitor Regularly**
   - Check Student Progress page weekly
   - Look for "Not Started" quizzes
   - Review low scores to identify struggling areas

3. **Use Retakes**
   - Students can retake quizzes
   - Best score is tracked
   - Encourages learning from mistakes

4. **Assignment Strategy**
   - Assign 2-3 quizzes at a time
   - Don't overwhelm with too many
   - Add more as they complete

### For Students

1. **Check Daily**
   - Log in to see new assignments
   - Complete quizzes promptly
   - Review which ones are pending

2. **Improve Scores**
   - Can retake any quiz
   - Best score is what shows to teacher
   - Study and try again for better results

3. **Track Progress**
   - See completion status
   - Monitor own scores
   - Aim for 80%+ (green badge)

## Status Badge System

| Badge Color | Status | Meaning |
|-------------|--------|---------|
| 🔴 Red | Not Started | Quiz assigned but not attempted |
| 🟡 Yellow | In Progress | Attempted but scored under 80% |
| 🟢 Green | Completed | Achieved 80% or higher |

**Note:** Status is based on **best score**, not latest attempt.

## Common Scenarios

### "Student doesn't see assigned quiz"
1. Make sure they're logged in
2. Refresh the page
3. Check they completed at least one quiz (creates their profile)
4. Verify assignment in admin panel

### "Can I assign a quiz before student takes their first quiz?"
No - the system needs a userId which is created on first quiz attempt. Have them take any quiz first, then you can assign others.

### "Student completed but shows 'In Progress'"
Their score was under 80%. They can retake to improve and change status to "Completed" (green).

### "How to remove an assignment?"
1. Go to Student Progress page
2. Select the student
3. Click "Unassign" button next to the quiz
4. Or use "Assign Quizzes" modal and uncheck it

### "Can I see which quizzes need attention?"
Yes! In the assignments table, look for:
- Red "not-started" badges = haven't begun
- Yellow "in-progress" badges = need to improve
- Many attempts = might be struggling

## Future Enhancements (Not Yet Implemented)

Potential features for later:
- Due dates for assignments
- Notifications when quizzes are assigned
- Grading comments/feedback
- Assignment templates (assign same set to all students)
- Print progress reports
- Weekly email summaries

## Quick Reference

### Admin Actions
- **View Students**: `/admin/students`
- **Assign Quiz**: Select student → "+ Assign Quizzes"
- **Unassign**: Click "Unassign" in table
- **Check Progress**: Select student card

### Student Actions
- **View Assignments**: Homepage when logged in
- **Take Quiz**: Click assigned quiz card
- **Improve Score**: Retake any quiz
- **Check Status**: See badge color

---

**Questions or Issues?**
The assignment system integrates seamlessly with existing quizzes. Just assign and students will see them immediately on their homepage!
