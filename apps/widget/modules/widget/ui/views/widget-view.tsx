"use client";

import WidgetFooter from "../components/widget-footer";
import WidgetAuthScreen from "../screens/widget-auth-screen";

const WidgetView = ({ organizationId }: { organizationId: string }) => {
  return (
    <main className="flex h-full min-h-screen w-full flex-col overflow-hidden rounded-xl border bg-muted">
      <WidgetAuthScreen />
      <WidgetFooter />
    </main>
  )
}

export default WidgetView