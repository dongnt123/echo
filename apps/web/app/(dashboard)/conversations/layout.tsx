import ConversationsLayout from "@/modules/dashboard/ui/layouts/conversations-layout";

export default function ConversationsMainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ConversationsLayout>
      {children}
    </ConversationsLayout>
  )
}