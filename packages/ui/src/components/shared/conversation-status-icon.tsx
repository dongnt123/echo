import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

interface ConversationStatusIconProps {
  status: "unresolved" | "escalated" | "resolved";
}

const statusConfig = {
  unresolved: {
    icon: ArrowRightIcon,
    bgColor: "bg-destructive"
  },
  escalated: {
    icon: ArrowUpIcon,
    bgColor: "bg-yellow-500"
  },
  resolved: {
    icon: CheckIcon,
    bgColor: "bg-[#3FB62F]"
  }
} as const

const ConversationStatusIcon = ({ status }: ConversationStatusIconProps) => {
  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center justify-center rounded-full p-1.5", config.bgColor)}>
      <config.icon className="size-3 stroke-3 text-white" />
    </div>
  )
}

export default ConversationStatusIcon