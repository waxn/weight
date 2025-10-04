# Deployment Guide

## Vercel Deployment

### Prerequisites
1. Vercel account
2. GitHub repository with your code
3. Convex deployment URL

### Steps

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it's a SvelteKit project

2. **Environment Variables**:
   Add these environment variables in Vercel dashboard:
   ```
   PUBLIC_CONVEX_URL=your_convex_deployment_url
   ```

3. **Build Settings**:
   - Framework Preset: SvelteKit
   - Build Command: `npm run build`
   - Output Directory: `.svelte-kit`

4. **Deploy**:
   - Click "Deploy" and Vercel will build and deploy your app
   - Your app will be available at `https://your-app.vercel.app`

### Convex Setup
Make sure your Convex deployment is running:
```bash
npx convex deploy
```

### Environment Variables
The app uses these environment variables:
- `PUBLIC_CONVEX_URL`: Your Convex deployment URL (automatically set by Convex)

### Features
- ✅ Mobile-optimized responsive design
- ✅ Dark mode toggle with persistence
- ✅ Real-time data with Convex
- ✅ Workout day management
- ✅ Exercise tracking with SVG icons
- ✅ Weight progression tracking
- ✅ Settings management

### Production Notes
- The app uses a demo user system for development
- In production, implement proper authentication
- All data is stored in Convex database
- No hardcoded ports or localhost URLs
