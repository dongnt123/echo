import { mutation, query } from "./_generated/server";

export const getMany = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  }
});

export const addUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await ctx.db.insert("users", {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password"
    });

    return userId;
  }
});