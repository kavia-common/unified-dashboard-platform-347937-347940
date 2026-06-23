# fitness_frontend (Next.js)

Mobile-first fitness dashboard UI with:
- Auth (Firebase email/password)
- Onboarding + goals
- Weekly plan
- Workout logging (incl. RPE)
- Activity logging (steps/cardio)
- Progress tracking (metrics/PRs/photos as URL references)
- Analytics charts
- Social sharing text
- Admin-only exercise/template management (gated via Firebase custom claim `admin: true`)

## Required environment variables

See `.env.example`.

## Run
```bash
npm install
npm run dev
```
