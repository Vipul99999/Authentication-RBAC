type PolicyContext = {
  user: any;
  resource?: any;
  action: string;
  context?: any;
};

export const evaluatePolicy = ({
  user,
  resource,
  action,
  context,
}: PolicyContext): boolean => {
  // 🔒 Global checks
  if (!user || !user.isActive) return false;

  // 🔐 ADMIN → full access
  if (user.role === "ADMIN") return true;

  // 👤 USER → own data only
  if (user.role === "USER") {
    if (action === "read_profile" || action === "update_profile") {
      return resource?.ownerId === user.id;
    }
  }

  // 🧑‍🔧 HANDLER → limited by location
  if (user.role === "HANDLER") {
    if (action === "create_user") {
      return user.districtId === resource?.districtId;
    }

    if (action === "view_user") {
      return user.districtId === resource?.districtId;
    }
  }

  // 🌐 Context-based example (IP restriction)
  if (context?.ipBlocked) {
    return false;
  }

  return false;
};