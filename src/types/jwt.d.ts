import "express";

declare module "express" {
  interface Request {
    /**
     * The ID of the user, determined by the user's JWT. Will be null if the user's JWT 
     * is invalid or absent.
     */
    userId?: number
  }
}