# AI Alternatives for Quiz Generation - Cost Comparison

## Current: Anthropic Claude 3.5 Sonnet
- **Input:** $3 per million tokens
- **Output:** $15 per million tokens
- **Cost per quiz:** ~$0.03-0.05
- **Quality:** Excellent - Very reliable, follows instructions well
- **Pros:** Best quality, consistent formatting, great at educational content
- **Cons:** More expensive than some alternatives

---

## Cheaper Alternatives

### 1. OpenAI GPT-4o Mini (CHEAPEST & RECOMMENDED)
- **Input:** $0.15 per million tokens (20x cheaper!)
- **Output:** $0.60 per million tokens (25x cheaper!)
- **Cost per quiz:** ~$0.001-0.002 (under 1 cent!)
- **Quality:** Very good - Slightly less consistent than Claude but much cheaper
- **Monthly estimate:** $0.05-0.20 for 50-100 quizzes
- **API:** https://platform.openai.com/
- **Free tier:** $5 credit for new accounts

**Migration effort:** Low - Similar API structure to Anthropic

### 2. OpenAI GPT-4o
- **Input:** $2.50 per million tokens
- **Output:** $10 per million tokens
- **Cost per quiz:** ~$0.025-0.04
- **Quality:** Excellent - Comparable to Claude
- **Pros:** Slightly cheaper than Claude, very reliable
- **Cons:** Not as cheap as Mini

### 3. Google Gemini 1.5 Flash (FREE TIER!)
- **Input:** FREE up to 15 requests/minute
- **Output:** FREE up to 1 million tokens/day
- **Cost per quiz:** $0 (within free tier)
- **Quality:** Good - Can be inconsistent with formatting
- **Free tier limits:** 1,500 requests/day
- **API:** https://ai.google.dev/
- **Pros:** FREE for your usage level!
- **Cons:** Rate limits, less consistent than paid options

**Migration effort:** Medium - Different API structure

### 4. Google Gemini 1.5 Pro
- **Input:** $1.25 per million tokens (60% cheaper)
- **Output:** $5 per million tokens (67% cheaper)
- **Cost per quiz:** ~$0.012-0.018
- **Quality:** Very good - Better than Flash, cheaper than Claude
- **Has free tier:** 2 requests/minute free

### 5. Meta Llama 3.1 (via Together AI or Groq)
- **Cost:** $0.18 per million tokens (input)
- **Cost:** $0.18 per million tokens (output)
- **Cost per quiz:** ~$0.0006-0.001 (nearly free!)
- **Quality:** Good - Open source, requires more prompt engineering
- **Providers:**
  - Together AI: https://www.together.ai/
  - Groq: https://groq.com/ (extremely fast!)

**Migration effort:** Medium-High - Different API, more prompt tuning needed

---

## Cost Comparison Table (50 quizzes/month)

| Provider | Cost per Quiz | 50 Quizzes/Month | Quality | Recommendation |
|----------|---------------|------------------|---------|----------------|
| **Anthropic Claude 3.5 Sonnet** | $0.035 | $1.75 | ⭐⭐⭐⭐⭐ | Current |
| **OpenAI GPT-4o Mini** | $0.0015 | $0.075 | ⭐⭐⭐⭐ | **BEST VALUE** |
| **Google Gemini Flash** | $0 | $0 | ⭐⭐⭐ | **FREE OPTION** |
| **Google Gemini Pro** | $0.015 | $0.75 | ⭐⭐⭐⭐ | Good middle |
| **OpenAI GPT-4o** | $0.03 | $1.50 | ⭐⭐⭐⭐⭐ | Similar to Claude |
| **Llama 3.1 (Groq)** | $0.0008 | $0.04 | ⭐⭐⭐ | Super cheap |

---

## My Recommendations

### Option 1: Switch to GPT-4o Mini (RECOMMENDED)
**Save ~95% on costs** while maintaining good quality.

**Pros:**
- $0.075/month instead of $1.75/month (for 50 quizzes)
- Very easy migration (similar API)
- Excellent quality for educational content
- OpenAI has robust infrastructure

**Cons:**
- Slightly less consistent than Claude (but still very good)

### Option 2: Try Gemini Flash Free Tier First
**Completely free** for your usage level.

**Pros:**
- $0/month
- Google's AI is improving rapidly
- No billing needed at all

**Cons:**
- Less consistent output formatting
- Rate limits (but plenty for your use case)
- May require more error handling

### Option 3: Stay with Claude
If $1-2/month is acceptable and you value the quality, Claude is still excellent.

---

## How to Switch to GPT-4o Mini

I can help you switch. The changes needed:

1. Get OpenAI API key from: https://platform.openai.com/api-keys
2. Update 3 lines in functions/index.js
3. Update Firebase config with new key
4. Deploy updated function
5. Test a quiz generation

**Total time:** ~5 minutes

The API is very similar:
```javascript
// Current (Anthropic)
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  messages: [{ role: 'user', content: prompt }]
});

// New (OpenAI)
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: prompt }]
});
```

---

## Bottom Line

**If you want to save money:**
- Switch to **GPT-4o Mini** = $0.075/month (vs $1.75/month)
- Or try **Gemini Flash** = $0/month (free!)

**If quality is most important:**
- Stay with **Claude 3.5 Sonnet** = $1.75/month

**For your homeschool use case** with ~20-50 quizzes/month, I'd recommend **GPT-4o Mini** - it's 20x cheaper and quality is still very good for quiz generation.

Want me to help you switch?
