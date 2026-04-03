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

  // 🌐 Context-based restriction FIRST (global deny)
  if (context?.ipBlocked) return false;

  // 🔐 ADMIN → full access
  if (user.role === "ADMIN") return true;

  // 👤 USER → only own profile
  if (user.role === "USER") {
    if (
      action === "read_profile" ||
      action === "update_profile"
    ) {
      return resource?.id === user.id; // 🔥 FIX (owner check)
    }

    return false;
  }

  // 🧑‍🔧 HANDLER → location-based access
  if (user.role === "HANDLER") {
    // 🔥 HANDLER can create USER only in same address
    if (action === "create_user") {
      // resource can be null here → allow (controller will enforce)
      return true;
    }

    // 🔥 HANDLER can view/update only same address users
    if (
      action === "view_user" ||
      action === "update_user"
    ) {
      return resource?.addressId === user.addressId;
    }

    return false;
  }

  return false;
};