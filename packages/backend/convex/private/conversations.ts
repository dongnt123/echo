import { ConvexError, v } from "convex/values";
import { paginationOptsValidator, PaginationResult } from "convex/server";
import { MessageDoc } from "@convex-dev/agent";

import { mutation, query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import supportAgent from "../system/ai/agents/supportAgent";

export const getMany = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(v.union(
      v.literal("unresolved"),
      v.literal("escalated"),
      v.literal("resolved")
    ))
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

    let conversations: PaginationResult<Doc<"conversations">>;
    if (args.status) {
      conversations = await ctx.db.query("conversations")
        .withIndex("by_status_and_organization_id", (q) => q.eq("status", args.status as Doc<"conversations">["status"]).eq("organizationId", organizationId))
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      conversations = await ctx.db.query("conversations")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    const conversationsWithAdditionalData = await Promise.all(
      conversations.page.map(async (conversation) => {
        const contactSession = await ctx.db.get(conversation.contactSessionId);
        if (!contactSession) return null;

        let lastMessage: MessageDoc | null = null;
        const messages = await supportAgent.listMessages(ctx, {
          threadId: conversation.threadId,
          paginationOpts: { numItems: 1, cursor: null }
        });
        if (messages.page.length > 0) lastMessage = messages.page[0] ?? null;

        return {
          ...conversation,
          lastMessage,
          contactSession
        }
      })
    );

    const validConversations = conversationsWithAdditionalData.filter((conversation): conversation is NonNullable<typeof conversation> => conversation !== null);

    return {
      ...conversations,
      page: validConversations
    }
  }
});

export const getOne = query({
  args: {
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

    const contactSession = await ctx.db.get(conversation.contactSessionId);
    if (!contactSession) throw new ConvexError({
      code: "NOT_FOUND",
      message: "Contact session not found"
    });

    return {
      ...conversation,
      contactSession
    };
  }
});

export const updateStatus = mutation({
  args: {
    conversationId: v.id("conversations"),
    status: v.optional(v.union(
      v.literal("unresolved"),
      v.literal("escalated"),
      v.literal("resolved")
    ))
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

    await ctx.db.patch(args.conversationId, {
      status: args.status
    });
  }
});