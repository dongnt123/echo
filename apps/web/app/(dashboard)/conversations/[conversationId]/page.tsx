import ConversationDetailsView from "@/modules/dashboard/ui/views/conversation-details-view";

import { Id } from "@workspace/backend/_generated/dataModel";

interface ConversationDetailPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

const ConversationDetailPage = async ({ params }: ConversationDetailPageProps) => {
  const { conversationId } = await params;
  return (
    <ConversationDetailsView conversationId={conversationId as Id<"conversations">} />
  )
}

export default ConversationDetailPage