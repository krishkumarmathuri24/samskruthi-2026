---
description: Deploy all code changes to GitHub and Vercel
---

// turbo-all

After making ANY code changes to the project, ALWAYS run these steps automatically without asking the user. The user should NEVER have to run git commands manually.

## Steps

1. Stage all modified files:
```
git -C "c:\Users\krish\OneDrive\Documents\college fest website\samskruthi" add -A
```

2. Commit with a meaningful message describing what was changed:
```
git -C "c:\Users\krish\OneDrive\Documents\college fest website\samskruthi" commit -m "<describe the fix or feature here>"
```

3. Push to GitHub (this automatically triggers a Vercel redeploy since the project is linked):
```
git -C "c:\Users\krish\OneDrive\Documents\college fest website\samskruthi" push origin main
```

4. Confirm to the user that changes are live and Vercel will redeploy in ~1-2 minutes.

## Notes
- The GitHub repo is: https://github.com/krishkumarmathuri24/samskruthi-2026.git
- Vercel is linked to this GitHub repo and auto-deploys on every push to `main`
- NEVER skip this workflow after making code changes
- Run all 3 git steps every single time without waiting for user approval
