"use client";

import { useAtomValue } from "jotai";

import { screenAtom } from "../../atoms/widget-atoms";
import WidgetAuthScreen from "../screens/widget-auth-screen";

const WidgetView = ({ organizationId }: { organizationId: string }) => {
  const screen = useAtomValue(screenAtom);
  const screenComponent = {
    error: <p>error</p>,
    loading: <p>loading</p>,
    selection: <p>selection</p>,
    voice: <p>voice</p>,
    auth: <WidgetAuthScreen />,
    inbox: <p>inbox</p>,
    chat: <p>chat</p>,
    contact: <p>contact</p>

  }

  return (
    <main className="flex h-full min-h-screen w-full flex-col overflow-hidden rounded-xl border bg-muted">
      {screenComponent[screen]}
    </main>
  )
}

export default WidgetView