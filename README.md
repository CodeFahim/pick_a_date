# For Nishi 💌

A small page to ask Nishi on a date.

## Files

| File | What it is |
|---|---|
| `index.html` | All the screens (intro, note, question, yes, plan, day, final, no) |
| `style.css` | Colors, layout, animations, character moods |
| `script.js` | The logic: No steps, runaway button, party, date picker, emails, reset |
| `email-template-update.html` | EmailJS template #1 ("opened it" + "said no") |
| `email-template-yes.html` | EmailJS template #2 ("SHE SAID YES") |

Only the first 3 go to GitHub. The email templates get pasted into EmailJS.

## Flow

```
Intro (envelope) → Note (types itself) → Question
   No  → 6 sad steps (button runs away on step 2) → 7th No = kind ending
   Yes → party 🎉 → pick date type → pick day + time + note → It's a date!
```

## Step 1: EmailJS setup

1. EmailJS → **Email Templates** → **Create New Template**
2. **To Email**: your own email. **Subject**: `{{emoji}} {{title}}`
3. Content → open the **code editor (`<>`)** → paste all of `email-template-update.html` → **Save**
4. Copy its **Template ID** (`template_xxxx`)
5. Repeat for `email-template-yes.html` with Subject: `💖 SHE SAID YES!`
6. Open `script.js` and fill in the top section:
   ```js
   serviceId: "service_xxxx",
   templateUpdate: "template_xxxx",
   templateYes: "template_yyyy",
   ```

## Step 2: GitHub Pages

1. GitHub → **New repository** → name it `for-nishi` → **Public** → Create
2. **Add file → Upload files** → drag `index.html`, `style.css`, `script.js` → **Commit**
3. **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main` / `(root)` → **Save**
4. Wait about 1 minute. Your link is `https://<your-username>.github.io/for-nishi/`
5. (Optional) EmailJS → Account → Security → allow only your `github.io` domain

## Step 3: Test, then send

1. Open the link on your phone and try both the Yes and No paths. Check that the emails arrive (and mark them "Not spam")
2. **Reset**: tap the tiny 🌸 in the bottom-right corner **7 times quickly** → tap **Reset**
3. Send her the link 💌

## Where to change things

| Want to change… | Go to |
|---|---|
| Note text | `script.js` → `NOTE_LINES` |
| No messages / steps | `script.js` → `NO_STEPS` |
| Runaway button lines | `script.js` → `DODGE_LINES` |
| Date options + jokes | `index.html` → SCREEN 5 |
| Colors | `style.css` → `:root` |
