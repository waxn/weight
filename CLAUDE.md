# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A mobile-optimized workout tracking app built with SvelteKit and Convex. Users can create workout routines, track exercise progress with automatic weight progression suggestions, and view statistics.

## Tech Stack

- **Frontend**: SvelteKit 2.x, Svelte 5, TypeScript
- **Backend**: Convex (database + real-time queries/mutations)
- **Styling**: Tailwind CSS 3.x with custom dark mode
- **State**: Svelte stores (minimal global state)

## Development Commands

```bash
# Development server (SvelteKit)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check

# Type checking with watch mode
npm run check:watch

# Start Convex development server (separate terminal)
npx convex dev

# Deploy Convex backend
npx convex deploy
```

## Architecture

### Database Schema (Convex)

The app uses 5 main tables defined in `convex/schema.ts`:

1. **users**: User profiles with legacy weight fields (being migrated)
2. **workoutDays**: Workout routines with exercise lists
3. **workoutDayExercises**: Exercise-specific settings per workout (weight, reps, sets, increments)
4. **exercises**: Exercise library (built-in + custom)
5. **exerciseLogs**: Historical performance tracking

### Key Data Flow

- **Workout Day Creation**: User creates a workout day → adds exercises from library → sets weight/reps/sets per exercise → stored in `workoutDays` + `workoutDayExercises`
- **Logging Workouts**: User completes exercise → marks success/fail → creates `exerciseLog` entry → suggested weight = last weight + increment
- **Weight Progression**: Each exercise has a `weightIncrement` field; on success, next suggestion = current + increment

### Frontend Structure

- **Routes**:
  - `/` - Dashboard (workout day list)
  - `/workout/[id]` - Workout session (mark exercises complete/failed)
  - `/workout/[id]/edit` - Edit workout day exercises
  - `/settings` - User settings
  - `/workout-settings` - Exercise configuration
  - `/stats` - Progress statistics
  - `/login` - Authentication (currently demo user)

- **State Management**:
  - `src/lib/stores.ts` - Global stores for `darkMode`, `user`, `isLoading`
  - `src/lib/convex.ts` - Convex client initialization

- **Key Components**:
  - `WorkoutDayCard.svelte` - Displays workout routines on dashboard
  - `ExerciseCard.svelte` - Individual exercise display
  - `LogExerciseModal.svelte` - Manual exercise logging
  - `CreateWorkoutDayModal.svelte` - Workout day creation
  - `SimpleWorkoutModal.svelte` - Quick workout flow

### Convex Functions

Located in `convex/`:

- **workoutDays.ts**:
  - `getUserWorkoutDays` - Fetches all workout days with populated exercise details
  - `createWorkoutDay`, `updateWorkoutDay`, `deleteWorkoutDay`
  - `addExerciseToWorkoutDay`, `updateExerciseInWorkoutDay`, `removeExerciseFromWorkoutDay`

- **exercises.ts**:
  - `initializeBuiltInExercises` - Seeds 15+ built-in exercises
  - `getAllExercises`, `createExercise`

- **exerciseLogs.ts**:
  - `logExercise` - Creates workout log entry
  - `getExerciseLogs` - Retrieves workout history
  - `getSuggestedWeight` - Calculates next weight recommendation
  - `deleteExerciseLog` - Undo feature

- **users.ts**:
  - User management functions

### Authentication

Currently uses a demo user (`demo@example.com`) for development. Production will require real auth implementation.

## Important Patterns

1. **Convex Client Usage**: Import from `$lib/convex`, use `convex.query()` or `convex.mutation()` with API from `convex/_generated/api`

2. **Exercise Settings Storage**: Exercise weight/reps/sets are NOT in the exercises table - they're in `workoutDayExercises` (per-workout configuration)

3. **Workout Status Tracking**: Uses sets to track daily completion status:
   - Check today's logs for exercise ID
   - Look for notes: "Completed successfully" or "Failed to complete"
   - Display appropriate UI state

4. **Dark Mode**: Stored in localStorage, synced with Svelte store, applied via Tailwind `dark:` classes

5. **Undo Feature**: Users can undo today's exercise logs via `deleteExerciseLog` mutation

## Development Notes

- The app initializes built-in exercises on mount (`+page.svelte:16`)
- All Convex mutations require `userId` parameter for authorization
- Exercise logs store timestamp as `completedAt` for historical tracking
- Weight progression logic: `suggestedWeight = lastLog.weight + lastLog.weightIncrement`
