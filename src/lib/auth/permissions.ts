type Role = "owner" | "admin" | "accountant" | "finance_manager" | "bookkeeper" | "viewer";

const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 6,
  admin: 5,
  finance_manager: 4,
  accountant: 3,
  bookkeeper: 2,
  viewer: 1,
};

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  finance_manager: "Finance Manager",
  accountant: "Accountant",
  bookkeeper: "Bookkeeper",
  viewer: "Viewer",
};

export function hasRole(userRole: string, required: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as Role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[required];
  return userLevel >= requiredLevel;
}

export function canManage(userRole: string) {
  return hasRole(userRole, "bookkeeper");
}

export function canPost(userRole: string) {
  return hasRole(userRole, "accountant");
}

export function canApprove(userRole: string) {
  return hasRole(userRole, "finance_manager");
}

export function canAdmin(userRole: string) {
  return hasRole(userRole, "admin");
}

export function isOwner(userRole: string) {
  return userRole === "owner";
}

export function canViewReports(userRole: string) {
  return hasRole(userRole, "viewer");
}
