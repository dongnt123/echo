"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePaginatedQuery } from "convex/react";
import { useAtomValue, useSetAtom } from "jotai";
import { formatDistanceToNow } from "date-fns";
import { ListIcon, ArrowRightIcon, ArrowUpIcon, CheckIcon, CornerUpLeftIcon } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import { getCountryFlagUrl, getCountryFromTimezone } from "@/lib/country-utils";
import { api } from "@workspace/backend/_generated/api";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { conversationStatusFilterAtom } from "../../atom";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Skeleton } from "@workspace/ui/components/skeleton";
import DicebearAvatar from "@workspace/ui/components/shared/dicebear-avatar";
import ConversationStatusIcon from "@workspace/ui/components/shared/conversation-status-icon";
import InfiniteScrollTrigger from "@workspace/ui/components/shared/infinite-scroll-trigger";

const ConversationsPanel = () => {
  const pathname = usePathname();
  const statusFilter = useAtomValue(conversationStatusFilterAtom);
  const setStatusFilter = useSetAtom(conversationStatusFilterAtom);
  const conversations = usePaginatedQuery(api.private.conversations.getMany, {
    status: statusFilter === "all" ? undefined : statusFilter
  }, {
    initialNumItems: 10
  });

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore, isLoadingFirstPage } = useInfiniteScroll({
    status: conversations.status,
    loadMore: conversations.loadMore
  });

  return (
    <div className="flex flex-col h-full w-full bg-background text-sidebar-foreground">
      <div className="flex flex-col gap-3.5 border-b p-2">
        <Select
          defaultValue="all"
          onValueChange={(value) => setStatusFilter(value as Doc<"conversations">["status"] | "all")}
          value={statusFilter}
        >
          <SelectTrigger className="h-8 border-none px-1.5 shadow-none ring-0 hover:bg-accent hover:text-accent-foreground focus-visible:ring-0">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <ListIcon className="size-4" />
                <span>All</span>
              </div>
            </SelectItem>
            <SelectItem value="unresolved">
              <div className="flex items-center gap-2">
                <ArrowRightIcon className="size-4" />
                <span>Unresolved</span>
              </div>
            </SelectItem>
            <SelectItem value="escalated">
              <div className="flex items-center gap-2">
                <ArrowUpIcon className="size-4" />
                <span>Escalated</span>
              </div>
            </SelectItem>
            <SelectItem value="resolved">
              <div className="flex items-center gap-2">
                <CheckIcon className="size-4" />
                <span>Resolved</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoadingFirstPage ? (
        <ConversationsPanelSkeleton />
      ) : (
        <ScrollArea className="max-h-[calc(100vh-53px)]">
          <div className="flex flex-1 flex-col h-full text-sm">
            {conversations?.results?.map((conversation) => {
              const isLastMessageFromOperator = conversation.lastMessage?.message?.role !== "user";
              const country = getCountryFromTimezone(conversation.contactSession.metadata?.timezone);
              const countryFlagUrl = country?.code ? getCountryFlagUrl(country.code) : undefined;

              return (
                <Link
                  key={conversation._id}
                  href={`/conversations/${conversation._id}`}
                  className={cn("relative flex cursor-pointer items-start gap-3 border-b p-4 py-5 text-sm leading-tight hover:bg-accent hover:text-accent-foreground",
                    pathname === `/conversations/${conversation._id}` && "bg-accent text-accent-foreground"
                  )}
                >
                  <div className={cn("-translate-y-1/2 absolute top-1/2 left-0 h-[64%] w-1 rounded-r-full bg-neutral-300 opacity-0 transition-opacity",
                    pathname === `/conversations/${conversation._id}` && "opacity-100"
                  )} />
                  <DicebearAvatar
                    seed={conversation.contactSession._id}
                    size={40}
                    badgeImageUrl={countryFlagUrl}
                    className="shrink-0"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex w-full items-center gap-2">
                      <span className="truncate font-bold">{conversation.contactSession.name}</span>
                      <span className="ml-auto shrink-0 text-muted-foreground text-xs">{formatDistanceToNow(new Date(conversation._creationTime))}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div className="flex w-0 grow items-center gap-1">
                        {isLastMessageFromOperator && (
                          <CornerUpLeftIcon className="size-3 shrink-0 text-muted-foreground" />
                        )}
                        <span className={cn("line-clamp-1 text-muted-foreground text-xs",
                          !isLastMessageFromOperator && "font-bold text-black"
                        )}>{conversation.lastMessage?.text}</span>
                      </div>
                      <ConversationStatusIcon status={conversation.status} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
        </ScrollArea>
      )}
    </div>
  )
}

const ConversationsPanelSkeleton = () => {
  return (
    <div className="flex flex-1 flex-col min-h-0 gap-2 overflow-auto">
      <div className="relative flex w-full min-w-0 flex-col p-2">
        <div className="w-full space-y-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3 rounded-lg p-4">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <div className="flex w-full items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="ml-auto h-3 w-12 shrink-0" />
                </div>
                <div className="mt-2">
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ConversationsPanel