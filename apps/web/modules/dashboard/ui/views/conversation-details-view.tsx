"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MoreHorizontalIcon, Wand2Icon } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { Button } from "@workspace/ui/components/button";
import { AIConversation, AIConversationContent, AIConversationScrollButton } from "@workspace/ui/components/ai/conversation";
import { AIInput, AIInputButton, AIInputSubmit, AIInputTextarea, AIInputToolbar, AIInputTools } from "@workspace/ui/components/ai/input";
import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { Form, FormField } from "@workspace/ui/components/form";
import { Skeleton } from "@workspace/ui/components/skeleton";
import InfiniteScrollTrigger from "@workspace/ui/components/shared/infinite-scroll-trigger";
import DicebearAvatar from "@workspace/ui/components/shared/dicebear-avatar";
import ConversationStatusButton from "../components/conversation-status-button";

const mesageSchema = z.object({
  message: z.string().min(1, "Message is required!")
});

interface ConversationDetailsViewProps {
  conversationId: Id<"conversations">;
}

const ConversationDetailsView = ({ conversationId }: ConversationDetailsViewProps) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isEnhancingMessage, setIsEnhancingMessage] = useState<boolean>(false);
  const conversation = useQuery(api.private.conversations.getOne, { conversationId });
  const messages = useThreadMessages(api.private.messages.getMany, (conversation?.threadId) ? {
    threadId: conversation.threadId
  } : "skip",
    { initialNumItems: 10 });
  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } = useInfiniteScroll({
    status: messages.status,
    loadMore: messages.loadMore
  });
  const createMessage = useMutation(api.private.messages.create);

  const form = useForm<z.infer<typeof mesageSchema>>({
    resolver: zodResolver(mesageSchema),
    defaultValues: {
      message: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof mesageSchema>) => {
    if (!conversation) return;

    form.reset();
    await createMessage({
      conversationId: conversation._id,
      prompt: values.message
    });
  };

  const enhanceResponse = useAction(api.private.messages.enhanceResponse);
  const handleEnhanceResponse = async () => {
    if (!conversation) return;

    setIsEnhancingMessage(true);
    const currentValue = form.getValues("message");
    const enhancedResponse = await enhanceResponse({
      prompt: currentValue
    });
    form.setValue("message", enhancedResponse);
    setIsEnhancingMessage(false);
  };

  const updateConversationStatus = useMutation(api.private.conversations.updateStatus);
  const handleUpdateConversationStatus = async () => {
    if (!conversation) return;

    setIsUpdatingStatus(true);
    let newStatus: "unresolved" | "escalated" | "resolved";
    if (conversation.status === "unresolved") {
      newStatus = "escalated";
    } else if (conversation.status === "escalated") {
      newStatus = "resolved";
    } else {
      newStatus = "unresolved";
    }

    try {
      await updateConversationStatus({
        conversationId: conversation._id,
        status: newStatus
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (conversation === undefined || messages.status === "LoadingFirstPage") {
    return <ConversationDetailsViewSkeleton />;
  }

  return (
    <div className="flex h-full flex-col bg-muted">
      <div className="flex items-center justify-between border-b bg-background p-2.5">
        <Button variant="ghost" size="sm">
          <MoreHorizontalIcon className="size-4" />
        </Button>
        {conversation && (
          <ConversationStatusButton status={conversation?.status} onClick={handleUpdateConversationStatus} disabled={isUpdatingStatus} />
        )}
      </div>

      <AIConversation className="max-h-[calc(100vh-180px)]">
        <AIConversationContent>
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
          {toUIMessages(messages.results ?? [])
            ?.filter((message) => message.text && message.text.trim() !== "")
            ?.map((message) => (
            <AIMessage
              from={message.role === "user" ? "assistant" : "user"}
              key={message.id}
            >
              <AIMessageContent>
                <AIResponse>
                  {message.text}
                </AIResponse>
              </AIMessageContent>
              {message.role === "user" && (
                <DicebearAvatar
                  imageUrl="/logo.svg"
                  seed={conversation?.contactSessionId ?? ""}
                  size={32}
                />
              )}
            </AIMessage>
          ))}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>

      <div className="p-2">
        <Form {...form}>
          <AIInput onSubmit={form.handleSubmit(onSubmit)} className="rounded-none border-x-0 border-b-0">
            <FormField
              control={form.control}
              name="message"
              disabled={conversation?.status === "resolved"}
              render={({ field }) => (
                <AIInputTextarea
                  disabled={conversation?.status === "resolved" || form.formState.isSubmitting || isEnhancingMessage}
                  onChange={field.onChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                  placeholder={conversation?.status === "resolved" ? "This conversation has been resolved" : "Type your response as operator..."}
                  value={field.value}
                />
              )}
            />
            <AIInputToolbar>
              <AIInputTools>
                <AIInputButton disabled={conversation?.status === "resolved" || !form.formState.isValid || isEnhancingMessage} onClick={handleEnhanceResponse}>
                  <Wand2Icon />
                  {isEnhancingMessage ? "Enhancing..." : "Enhance"}
                </AIInputButton>
              </AIInputTools>
              <AIInputSubmit
                disabled={conversation?.status === "resolved" || !form.formState.isValid}
                status="ready"
                type="submit"
              />
            </AIInputToolbar>
          </AIInput>
        </Form>
      </div>
    </div>
  )
}

const ConversationDetailsViewSkeleton = () => {
  return (
    <div className="flex h-full flex-col bg-muted">
      <div className="flex items-center justify-between border-b bg-background p-2.5">
        <Button variant="ghost" size="sm">
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </div>
      <AIConversation className="max-h-[calc(100vh-180px)]">
        <AIConversationContent>
          {Array.from({ length: 10 }).map((_, index) => {
            const isUser = index % 2 === 0;
            const widths = ["w-48", "w-60", "w-72"];
            const width = widths[index % widths.length];

            return (
              <div key={index} className={cn("group flex w-full items-end gap-2 py-2 [&>div]:max-w-[80%]", isUser ? "is-user" : "is-assistant flex-row-reverse")}>
                <Skeleton className={cn("h-10 rounded-lg bg-neutral-200", width)} />
                <Skeleton className="size-8 rounded-full bg-neutral-200" />
              </div>
            )
          })}
        </AIConversationContent>
      </AIConversation>
      <div className="p-2">
        <AIInput>
          <AIInputTextarea disabled placeholder="Type your response as operator..." />
          <AIInputToolbar>
            <AIInputTools />
            <AIInputSubmit status="ready" disabled />
          </AIInputToolbar>
        </AIInput>
      </div>
    </div>
  )
}

export default ConversationDetailsView