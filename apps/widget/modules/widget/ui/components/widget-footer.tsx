import { HomeIcon, InboxIcon } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";

const WidgetFooter = () => {
  const screen = "selection";

  return (
    <footer className="flex items-center justify-between border-t bg-background">
      <Button
        variant="ghost"
        size="icon"
        className="h-14 flex-1 rounded-none"
        onClick={() => { }}
      >
        <HomeIcon className={cn("size-5", screen === "selection" && "text-primary")} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-14 flex-1 rounded-none"
        onClick={() => { }}
      >
        <InboxIcon className={cn("size-5", false && "text-primary")} />
      </Button>
    </footer>
  )
}

export default WidgetFooter