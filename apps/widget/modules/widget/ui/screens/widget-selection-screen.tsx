"use client";

import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useMutation } from "convex/react";
import { ChevronRightIcon, MessageSquareTextIcon } from "lucide-react";

import { api } from "@workspace/backend/_generated/api";
import { contactSessionIdAtomFamily, conversationIdAtom, errorMessageAtom, organizationIdAtom, screenAtom } from "../../atoms/widget-atoms";
import { Button } from "@workspace/ui/components/button";
import WidgetHeader from "../components/widget-header";

const WidgetSelectionScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setConversationId = useSetAtom(conversationIdAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""));
  const [isPending, setIsPending] = useState<boolean>(false);

  const createConversation = useMutation(api.public.conversations.create);

  const handleCreateNewChat = async () => {
    if (!organizationId) {
      setErrorMessage("Missing organization ID");
      setScreen("error");
      return;
    }

    if (!contactSessionId) {
      setScreen("auth");
      return;
    }

    try {
      setIsPending(true);
      const conversationId = await createConversation({
        organizationId,
        contactSessionId
      });
      setConversationId(conversationId);
      setScreen("chat");
    } catch (error) {
      console.error(error);
      setScreen("auth");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">Hi there! 👋</p>
          <p className="text-lg">Let&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto">
        <Button
          variant="outline"
          className="h-16 w-full justify-between"
          onClick={handleCreateNewChat}
          disabled={isPending}
        >
          <div className="flex items-center gap-2">
            <MessageSquareTextIcon className="size-4" />
            <p>Start chat</p>
          </div>
          <ChevronRightIcon />
        </Button>
      </div>
    </>
  )
}

export default WidgetSelectionScreen