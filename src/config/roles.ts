const allRoles = {
  ADMIN: [
    "VIEW_COURSE",
    "DELETE_COURSE",
    "UPDATE_COURSE",
    "CREATE_COURSE",
    "GET_ALL_ITEMS_CART",
    "DELETE_ITEM_CART_HARD",
    "CREATE_LINK"
  ],
  AFFILIATOR: ["CREATE_LINK", "VIEW_COURSE"],
  AUTHOR: ["CREATE_COURSE", "UPDATE_COURSE"],
  USER: ["VIEW_COURSE", "PURCHASE_COURSE", "ADD_TO_CART"],
};

export const roles: string[] = Object.keys(allRoles);
export const roleRights: Map<string, string[]> = new Map(
  Object.entries(allRoles)
);
