import { ConvexError, v } from "convex/values";
import { saveMessage } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";

import { mutation, query } from "../_generated/server";
import { components } from "../_generated/api";
import supportAgent from "../system/ai/agents/supportAgent";

export const create = mutation({
  args: {
    prompt: v.string(),
    conversationId: v.id("conversations")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Unauthorized"
    });

    const organizationId = identity.orgId as string;
    if (!organizationId) throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Organization not found"
    });

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new ConvexError({
      code: "NOT_FOUND",
      message: "Conversation not found"
    });
    if (conversation.organizationId !== organizationId) throw new ConvexError({
      code: "FORBIDDEN",
      message: "You are not allowed to access this conversation"
    });
    if (conversation.status === "resolved") throw new ConvexError({
      code: "BAD_REQUEST",
      message: "Conversation already resolved"
    });

    await saveMessage(ctx, components.agent, {
      threadId: conversation.threadId,
      agentName: identity.familyName,
      message: {
        role: "assistant",
        content: args.prompt
      }
    })
  }
});

export const getMany = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Unauthorized"
    });

    const organizationId = identity.orgId as string;
    if (!organizationId) throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Organization not found"
    });

    const conversation = await ctx.db.query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique();
    if (!conversation) throw new ConvexError({
      code: "NOT_FOUND",
      message: "Conversation not found"
    });
    if (conversation.organizationId !== organizationId) throw new ConvexError({
      code: "FORBIDDEN",
      message: "You are not allowed to access this conversation"
    });

    const paginated = await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts
    });

    return paginated;
  }
});