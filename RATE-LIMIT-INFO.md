# Daily Rate Limit System

## Overview
The AI quiz generation system now has a **5 quizzes per 24-hour period** rate limit to prevent unexpected costs.

## How It Works

### Normal Usage (Within Limit)
1. Admin generates quizzes normally
2. Each generation is tracked in Firebase
3. Visual badge shows current usage (e.g., "🤖 Daily AI Usage: 3/5")
4. Badge color indicates status:
   - **Green** (0-2): Plenty of quota remaining
   - **Yellow** (3-4): Approaching limit
   - **Red** (5+): Limit reached

### When Limit is Reached
After 5 quiz generations in 24 hours:

1. **Error Dialog Appears:**
   ```
   ⚠️ DAILY LIMIT REACHED

   Daily limit of 5 quiz generations reached
   (5 generated in last 24 hours).
   Admin approval required to continue.

   As the admin (techride.trevor@gmail.com),
   you can override this limit.

   Do you want to generate this quiz anyway?

   Click OK to override, or Cancel to stop.
   ```

2. **Admin Choices:**
   - **Click OK**: Override approved, quiz generates anyway
   - **Click Cancel**: Generation stopped, returns to form

### Admin Override
- Only `techride.trevor@gmail.com` can override
- Override is intentional - requires explicit confirmation
- Each override is logged separately in Firebase
- Override resets after clicking (next generation requires new approval)

## Checking Current Usage

### Visual Badge (Auto-updates)
- Located in bottom-right corner of admin panel
- Click badge to view detailed statistics page
- Updates automatically when page loads

### Stats Dashboard
Visit `/admin/stats` to see:
- Exact count of generations in last 24 hours
- Timestamp of each generation
- Total cost estimates
- Full history

## Why This Limit?

**Cost Protection:**
- At $0.03-0.05 per quiz, 5/day = max $0.25/day
- Without limit: accidental loops could cost $$$
- 5 quizzes/day is generous for homeschool use

**Typical Usage:**
- Most days: 0-2 quiz generations
- Busy setup days: 3-5 quizzes
- Rare edge cases: Admin override available

## Adjusting the Limit

If you need to change the daily limit (currently 5):

1. Edit `functions/index.js`
2. Find line: `const DAILY_LIMIT = 5;`
3. Change to desired number (e.g., 10)
4. Redeploy: `firebase deploy --only functions`

## Technical Details

### How Time Window Works
- **Rolling 24-hour window**, not calendar day
- Example: If you generate 5 quizzes at 2pm Monday:
  - Limit applies until 2pm Tuesday
  - At 2:01pm Tuesday, you can generate again
  - Each generation "drops off" after exactly 24 hours

### What Gets Counted
- Every successful AI quiz generation
- Includes both:
  - Normal generations
  - Override-approved generations
- Does NOT count:
  - Failed generation attempts
  - Manual quiz creation
  - Editing existing quizzes

### Data Storage
All generations logged in Firebase at `ai-usage-logs` with:
```json
{
  "timestamp": 1699876543210,
  "userId": "abc123",
  "userEmail": "techride.trevor@gmail.com",
  "bookTitle": "Charlotte's Web",
  "author": "E.B. White",
  "questionCount": 10,
  "difficulty": "medium",
  "inputTokens": 1823,
  "outputTokens": 1654,
  "model": "claude-3-5-sonnet-20241022"
}
```

## Best Practices

1. **Plan Your Quizzes**: Think through what you need before generating
2. **Use Manual Entry**: For quick edits, manual creation doesn't count against limit
3. **Edit AI Quizzes**: Generate once, then edit/refine instead of regenerating
4. **Monitor the Badge**: Check usage before starting bulk quiz creation
5. **Override Sparingly**: Each override costs money - use intentionally

## FAQ

**Q: What if I need more than 5 quizzes in one day?**
A: Use the admin override - just be aware each additional quiz costs ~$0.03-0.05.

**Q: Can I disable the limit?**
A: Yes, set `DAILY_LIMIT = 999999` in functions/index.js, but not recommended for cost safety.

**Q: Does the limit reset at midnight?**
A: No, it's a rolling 24-hour window from each generation.

**Q: What if students try to generate quizzes?**
A: Only admins can generate quizzes at all - students don't have access to the AI feature.

**Q: Does editing an AI-generated quiz count toward the limit?**
A: No, only the initial AI generation counts. Edit as much as you want!

**Q: Can other admins override?**
A: Yes, any email in the ALLOWED_EMAILS list gets override capability.

## Cost Protection Summary

| Safeguard | Protection Level |
|-----------|-----------------|
| Admin-only access | Prevents student misuse |
| 5/day rate limit | Caps daily cost at ~$0.25 |
| Confirmation dialog | Prevents accidental overrides |
| Visual usage badge | Awareness of current usage |
| Stats dashboard | Track spending in real-time |
| Anthropic monthly limit | Hard cap at $10/month (set in Anthropic console) |

**Bottom line:** With all these safeguards, you're very well protected from unexpected costs!
