import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";

interface InfiniteScrollTriggerProps {
  canLoadMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  loadMoreText?: string;
  noMoreText?: string;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

const InfiniteScrollTrigger = ({
  canLoadMore,
  isLoadingMore,
  onLoadMore,
  loadMoreText = "Load more",
  noMoreText = "No more items",
  className,
  ref
}: InfiniteScrollTriggerProps) => {
  let text = loadMoreText;
  if (isLoadingMore) text = "Loading..."
  else if (!canLoadMore) text = noMoreText;

  return (
    <div ref={ref} className={cn("flex w-full justify-center py-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        disabled={!canLoadMore || isLoadingMore}
        onClick={onLoadMore}
      >
        {text}
      </Button>
    </div>
  )
}

export default InfiniteScrollTrigger