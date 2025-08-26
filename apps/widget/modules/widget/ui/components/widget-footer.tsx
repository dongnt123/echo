import { useAtomValue, useSetAtom } from "jotai";
import { HomeIcon, InboxIcon } from "lucide-react";

import { screenAtom } from "../../atoms/widget-atoms";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";

const WidgetFooter = () => {
  const screen = useAtomValue(screenAtom);
  const setScreen = useSetAtom(screenAtom);

  return (
    <footer className="flex items-center justify-between border-t bg-background">
      <Button
        variant="ghost"
        size="icon"
        className="h-14 flex-1 rounded-none"
        onClick={() => setScreen("selection")}
      >
        <HomeIcon className={cn("size-5", screen === "selection" && "text-primary")} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-14 flex-1 rounded-none"
        onClick={() => setScreen("inbox")}
      >
        <InboxIcon className={cn("size-5", screen === "inbox" && "text-primary")} />
      </Button>
    </footer>
  )
}

export default WidgetFooter