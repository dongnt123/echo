"use client";

import { useAction, useQuery } from "convex/react";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";
import { useAtomValue, useSetAtom } from "jotai";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeftIcon, MenuIcon } from "lucide-react";

import { api } from "@workspace/backend/_generated/api";
import { contactSessionIdAtomFamily, conversationIdAtom, organizationIdAtom, screenAtom } from "../../atoms/widget-atoms";
import { Button } from "@workspace/ui/components/button";
import { AIConversation, AIConversationContent, AIConversationScrollButton } from "@workspace/ui/components/ai/conversation";
import { AIInput, AIInputSubmit, AIInputTextarea, AIInputToolbar, AIInputTools } from "@workspace/ui/components/ai/input";
import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { AISuggestion, AISuggestions } from "@workspace/ui/components/ai/suggestion";
import { Form, FormField } from "@workspace/ui/components/form";
import WidgetHeader from "../components/widget-header";

const mesageSchema = z.object({
  message: z.string().min(1, "Message is required!")
});

const WidgetChatScreen = () => {
  const organizationId = useAtomValue(organizationIdAtom);
  const conversationId = useAtomValue(conversationIdAtom);
  const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""));
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const conversation = useQuery(api.public.conversations.getOne, (conversationId && contactSessionId) ? {
    conversationId,
    contactSessionId
  } : "skip");
  const messages = useThreadMessages(api.public.messages.getMany, (conversation?.threadId && contactSessionId) ? {
    threadId: conversation.threadId,
    contactSessionId
  } : "skip",
    { initialNumItems: 10 });

  const createMessage = useAction(api.public.messages.create);

  const form = useForm<z.infer<typeof mesageSchema>>({
    resolver: zodResolver(mesageSchema),
    defaultValues: {
      message: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof mesageSchema>) => {
    if (!conversation || !contactSessionId) return;

    form.reset();
    await createMessage({
      threadId: conversation.threadId,
      prompt: values.message,
      contactSessionId
    })
  }

  const handleBack = () => {
    setConversationId(null);
    setScreen("selection");
  }

  return (
    <>
      <WidgetHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="transparent" onClick={handleBack}>
            <ArrowLeftIcon />
          </Button>
          <p>Chat</p>
        </div>
        <Button size="icon" variant="transparent">
          <MenuIcon />
        </Button>
      </WidgetHeader>
      <AIConversation>
        <AIConversationContent>
          {toUIMessages(messages.results ?? [])?.map((message) => (
            <AIMessage
              from={message.role === "user" ? "user" : "assistant"}
              key={message.id}
            >
              <AIMessageContent>
                <AIResponse>
                  {message.text}
                </AIResponse>
              </AIMessageContent>
            </AIMessage>
          ))}
        </AIConversationContent>
      </AIConversation>

      <Form {...form}>
        <AIInput onSubmit={form.handleSubmit(onSubmit)} className="rounded-none border-x-0 border-b-0">
          <FormField
            control={form.control}
            name="message"
            disabled={conversation?.status === "resolved"}
            render={({ field }) => (
              <AIInputTextarea
                disabled={conversation?.status === "resolved"}
                onChange={field.onChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)();
                  }
                }}
                placeholder={conversation?.status === "resolved" ? "This conversation has been resolved" : "Type your message..."}
                value={field.value}
              />
            )}
          />
          <AIInputToolbar>
            <AIInputTools />
            <AIInputSubmit
              disabled={conversation?.status === "resolved" || !form.formState.isValid}
              status="ready"
              type="submit"
            />
          </AIInputToolbar>
        </AIInput>
      </Form>
    </>
  )
}

export default WidgetChatScreen