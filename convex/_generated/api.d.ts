/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as audioGenerator from "../audioGenerator.js";
import type * as authClerk from "../authClerk.js";
import type * as businessCategories from "../businessCategories.js";
import type * as businessLocations from "../businessLocations.js";
import type * as businessRegistration from "../businessRegistration.js";
import type * as businesses from "../businesses.js";
import type * as clerkBilling from "../clerkBilling.js";
import type * as clerkMobileWebhooks from "../clerkMobileWebhooks.js";
import type * as clerkPlans from "../clerkPlans.js";
import type * as clerkWebhooks from "../clerkWebhooks.js";
import type * as constants_clerkPlans from "../constants/clerkPlans.js";
import type * as http from "../http.js";
import type * as imageProxy from "../imageProxy.js";
import type * as lib_apiHelpers from "../lib/apiHelpers.js";
import type * as lib_authHelpers from "../lib/authHelpers.js";
import type * as lib_geo from "../lib/geo.js";
import type * as lib_subscriptionHelpers from "../lib/subscriptionHelpers.js";
import type * as services_clerkBillingService from "../services/clerkBillingService.js";
import type * as socialMediaValidation from "../socialMediaValidation.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  audioGenerator: typeof audioGenerator;
  authClerk: typeof authClerk;
  businessCategories: typeof businessCategories;
  businessLocations: typeof businessLocations;
  businessRegistration: typeof businessRegistration;
  businesses: typeof businesses;
  clerkBilling: typeof clerkBilling;
  clerkMobileWebhooks: typeof clerkMobileWebhooks;
  clerkPlans: typeof clerkPlans;
  clerkWebhooks: typeof clerkWebhooks;
  "constants/clerkPlans": typeof constants_clerkPlans;
  http: typeof http;
  imageProxy: typeof imageProxy;
  "lib/apiHelpers": typeof lib_apiHelpers;
  "lib/authHelpers": typeof lib_authHelpers;
  "lib/geo": typeof lib_geo;
  "lib/subscriptionHelpers": typeof lib_subscriptionHelpers;
  "services/clerkBillingService": typeof services_clerkBillingService;
  socialMediaValidation: typeof socialMediaValidation;
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
