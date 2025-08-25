"use client";

import { useAtomValue } from "jotai";

import { screenAtom } from "../../atoms/widget-atoms";
import WidgetAuthScreen from "../screens/widget-auth-screen";
import WidgetErrorScreen from "../screens/widget-error-screen";
import WidgetLoadingScreen from "../screens/widget-loading-screen";
import WidgetSelectionScreen from "../screens/widget-selection-screen";
import WidgetChatScreen from "../screens/widget-chat-screen";

const WidgetView = ({ organizationId }: { organizationId: string }) => {
  const screen = useAtomValue(screenAtom);
  const screenComponent = {
    error: <WidgetErrorScreen />,
    loading: <WidgetLoadingScreen organizationId={organizationId} />,
    selection: <WidgetSelectionScreen />,
    voice: <p>voice</p>,
    auth: <WidgetAuthScreen />,
    inbox: <p>inbox</p>,
    chat: <WidgetChatScreen />,
    contact: <p>contact</p>

  }

  return (
    <main className="flex h-full min-h-screen w-full flex-col overflow-hidden rounded-xl border bg-muted">
      {screenComponent[screen]}
    </main>
  )
}

export default WidgetView