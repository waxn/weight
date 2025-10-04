# 💪 Workout Tracker

A mobile-optimized workout tracking app built with SvelteKit and Convex. Track your workouts, set goals, and monitor your fitness progress with automatic weight progression.

## Features

- 🔐 **Authentication** - Secure login with Convex Auth
- 📱 **Mobile-First Design** - Optimized for mobile devices
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 🏋️ **Workout Days** - Create and manage different workout routines
- 💪 **Exercise Library** - Built-in exercises with custom exercise creation
- ⚖️ **Weight Tracking** - Automatic weight progression suggestions
- 📊 **Progress Logging** - Track sets, reps, and weights
- 🎯 **Smart Suggestions** - AI-powered weight recommendations

## Tech Stack

- **Frontend**: SvelteKit, TypeScript, Tailwind CSS
- **Backend**: Convex (Database, Auth, Real-time)
- **Styling**: Tailwind CSS with custom components
- **Icons**: Heroicons, Emojis

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Convex account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Workout
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev
   ```
   Follow the prompts to create a new Convex project.

4. **Configure environment variables**
   ```bash
   cp env.example .env.local
   ```
   Update the `.env.local` file with your Convex deployment URL.

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Current Status

The app is currently set up with **mock data** for development purposes. This means:

- ✅ **UI/UX**: Fully functional interface with dark mode, responsive design
- ✅ **Components**: All UI components working (modals, forms, navigation)
- ✅ **Mock Data**: Sample workout days and exercises for testing
- ⚠️ **Authentication**: Currently using mock user (implement real auth for production)
- ⚠️ **Database**: Using mock data (connect to Convex for real data persistence)

## Next Steps for Production

1. **Set up Convex Database**:
   ```bash
   npx convex dev
   ```

2. **Implement Authentication**:
   - Add your preferred auth provider (Auth0, Clerk, etc.)
   - Update the Convex functions to use real authentication
   - Remove mock data and implement real database operations

3. **Deploy**:
   - Deploy Convex backend: `npx convex deploy`
   - Deploy frontend to Vercel/Netlify

## Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable UI components
│   ├── stores.ts           # Svelte stores for state management
│   └── convex.ts           # Convex client configuration
├── routes/
│   ├── +layout.svelte      # Main app layout
│   ├── +page.svelte        # Dashboard
│   ├── settings/           # User settings
│   └── workout/[id]/       # Individual workout sessions
convex/
├── schema.ts               # Database schema
├── users.ts               # User management functions
├── workoutDays.ts         # Workout day functions
├── exercises.ts           # Exercise management
└── exerciseLogs.ts        # Exercise logging functions
```

## Key Features

### Workout Days
- Create custom workout routines (e.g., "Leg Day", "Push Day")
- Add multiple exercises to each workout day
- Organize workouts by muscle groups or training splits

### Exercise Management
- Built-in exercise library with 15+ common exercises
- Create custom exercises with icons and categories
- Track exercise performance over time

### Weight Progression
- Set your current weight and preferred increment
- Automatic weight suggestions based on previous performance
- Progressive overload tracking

### Mobile Optimization
- Responsive design that works on all screen sizes
- Touch-friendly interface
- Fast loading and smooth animations

## Database Schema

The app uses Convex with the following main tables:

- **users**: User profiles and weight settings
- **workoutDays**: Workout routines and exercise lists
- **exercises**: Exercise library (built-in and custom)
- **exerciseLogs**: Performance tracking and history

## Development

### Running Tests
```bash
npm run check
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Deployment

1. **Deploy to Convex**
   ```bash
   npx convex deploy
   ```

2. **Deploy Frontend**
   - Deploy to Vercel, Netlify, or your preferred platform
   - Set environment variables in your deployment platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
