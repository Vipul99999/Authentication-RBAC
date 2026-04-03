// src/modules/security/ownership.ts

export const checkOwnership = (user: any, resource?: any) => {
  if (!resource?.ownerId) return false;
  return resource.ownerId === user.id;
};