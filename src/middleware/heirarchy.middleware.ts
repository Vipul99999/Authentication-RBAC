import { AppError } from "./error.middleware"; // Import custom AppError class from error.middleware - used for throwing standardized HTTP errors with status codes

export const enforceHierarchy = (req: any, _res: any, next: any) => {
  // Middleware function to enforce RBAC hierarchy rules. Runs between auth middleware (populates req.user) and route handler
  const creator = req.user; // Extract authenticated creator user from req.user (set by prior auth middleware like JWT verify)
  const target = req.body; // Extract target data (e.g., new user being created) from request body

  if (creator.role === "HANDLER") {
    // Check if creator has HANDLER role (from User.role enum: ADMIN, HANDLER, USER)
    if (creator.districtId !== target.districtId) {
      // Enforce hierarchy: HANDLER can only operate within their assigned district (from normalized location tables)
      throw new AppError("Handler cannot create outside district", 403); // Throw forbidden error if district mismatch - stops execution, sends 403 response
    }
  } // End HANDLER check (ADMIN/USER implicitly allowed, no checks)

  next(); // Proceed to next middleware/route handler if checks pass
};
