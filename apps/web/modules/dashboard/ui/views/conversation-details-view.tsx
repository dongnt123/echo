"use client";

import { useMutation, useQuery } from "convex/react";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MoreHorizontalIcon, Wand2Icon } from "lucide-react";

import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { Button } from "@workspace/ui/components/button";
import { AIConversation, AIConversationContent, AIConversationScrollButton } from "@workspace/ui/components/ai/conversation";
import { AIInput, AIInputButton, AIInputSubmit, AIInputTextarea, AIInputToolbar, AIInputTools } from "@workspace/ui/components/ai/input";
import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { Form, FormField } from "@workspace/ui/components/form";
import InfiniteScrollTrigger from "@workspace/ui/components/shared/infinite-scroll-trigger";
import DicebearAvatar from "@workspace/ui/components/shared/dicebear-avatar";

const mesageSchema = z.object({
  message: z.string().min(1, "Message is required!")
});

interface ConversationDetailsViewProps {
  conversationId: Id<"conversations">;
}

const ConversationDetailsView = ({ conversationId }: ConversationDetailsViewProps) => {
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
  }

  return (
    <div className="flex h-full flex-col bg-muted">
      <div className="flex items-center justify-between border-b bg-background p-2.5">
        <Button variant="ghost" size="sm">
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </div>

      <AIConversation className="max-h-[calc(100vh-180px)]">
        <AIConversationContent>
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
          {toUIMessages(messages.results ?? [])?.map((message) => (
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
                  disabled={conversation?.status === "resolved" || form.formState.isSubmitting}
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
                <AIInputButton>
                  <Wand2Icon />
                  Enhance
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

export default ConversationDetailsView