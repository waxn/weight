/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as exerciseLogs from "../exerciseLogs.js";
import type * as exercises from "../exercises.js";
import type * as users from "../users.js";
import type * as weights from "../weights.js";
import type * as workoutDays from "../workoutDays.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  exerciseLogs: typeof exerciseLogs;
  exercises: typeof exercises;
  users: typeof users;
  weights: typeof weights;
  workoutDays: typeof workoutDays;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
