/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as clerkTypes from "../clerkTypes.js";
import type * as crons from "../crons.js";
import type * as errorLogging from "../errorLogging.js";
import type * as errors from "../errors.js";
import type * as http from "../http.js";
import type * as paymentAttemptTypes from "../paymentAttemptTypes.js";
import type * as paymentAttempts from "../paymentAttempts.js";
import type * as userSettings from "../userSettings.js";
import type * as users from "../users.js";
import type * as withErrorHandling from "../withErrorHandling.js";
import type * as youtube from "../youtube.js";
import type * as youtubeTypes from "../youtubeTypes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  clerkTypes: typeof clerkTypes;
  crons: typeof crons;
  errorLogging: typeof errorLogging;
  errors: typeof errors;
  http: typeof http;
  paymentAttemptTypes: typeof paymentAttemptTypes;
  paymentAttempts: typeof paymentAttempts;
  userSettings: typeof userSettings;
  users: typeof users;
  withErrorHandling: typeof withErrorHandling;
  youtube: typeof youtube;
  youtubeTypes: typeof youtubeTypes;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
