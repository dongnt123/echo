import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react";

import { Doc } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import Hint from "@workspace/ui/components/shared/hint";

interface ConversationStatusButtonProps {
  status: Doc<"conversations">["status"];
  onClick: () => void;
  disabled?: boolean;
}

const ConversationStatusButton = ({ status, onClick, disabled = false }: ConversationStatusButtonProps) => {

  if (status === "resolved") {
    return (
      <Hint text="Mark as unresolved">
        <Button variant="tertiary" size="sm" onClick={onClick} disabled={disabled}>
          <CheckIcon />
          Resolved
        </Button>
      </Hint>
    )
  }

  if (status === "escalated") {
    return (
      <Hint text="Mark as resolved">
        <Button variant="warning" size="sm" onClick={onClick} disabled={disabled}>
          <ArrowUpIcon />
          Escalated
        </Button>
      </Hint>
    )
  }

  return (
    <Hint text="Mark as unresolved">
      <Button variant="tertiary" size="sm" onClick={onClick} disabled={disabled}>
        <ArrowRightIcon />
        Unresolved
      </Button>
    </Hint>
  )
}

export default ConversationStatusButton