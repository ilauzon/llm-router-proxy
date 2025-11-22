import type { UUID } from "crypto";
import "express";

declare module "express" {
  interface Request {
    /**
     * The API key of the user. Null if the user's API key is invalid or absent,
     * or if AuthMiddleware.requireApiKeyAuth was not used on that route.
     */
    apiKey?: UUID
  }
}