import { mutation, query } from "./_generated/server";

export const getMany = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Not authenticated");

    return await ctx.db.query("users").collect();
  }
});

export const addUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Not authenticated");

    const orgId = identity.orgId as string;
    if (!orgId) throw new Error("Missing organization");

    const userId = await ctx.db.insert("users", {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password"
    });

    return userId;
  }
});