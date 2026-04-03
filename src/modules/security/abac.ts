// src/modules/security/abac.ts

export const checkABAC = (ctx: any): boolean => {
  const { user, resource, context } = ctx;

  // 🚫 Blocked IP
  if (context?.ipBlocked) return false;

  // 🧑‍🔧 HANDLER → same district
  if (user.role === "HANDLER") {
    if (resource?.districtId !== user.districtId) {
      return false;
    }
  }

  // ⏰ Time restriction example
  if (context?.time) {
    const hour = new Date(context.time).getHours();
    if (hour < 6 || hour > 22) return false;
  }

  return true;
};