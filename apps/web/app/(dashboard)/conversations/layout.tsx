import { Provider } from "jotai";

import ConversationsLayout from "@/modules/dashboard/ui/layouts/conversations-layout";

export default function ConversationsMainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ConversationsLayout>
      <Provider>
        {children}
      </Provider>
    </ConversationsLayout>
  )
}