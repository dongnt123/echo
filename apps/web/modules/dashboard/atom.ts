import { atomWithStorage } from "jotai/utils";

import { Doc } from "@workspace/backend/_generated/dataModel";
import { DASHBOARD_CONVERSATIONS_FILTER_KEY } from "./constants";

export const conversationStatusFilterAtom = atomWithStorage<Doc<"conversations">["status"] | "all">(DASHBOARD_CONVERSATIONS_FILTER_KEY, "all");