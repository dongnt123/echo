import { Agent } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";

import { SUPPORT_AGENT_PROMPT } from "../../../../constants";
import { components } from "../../../_generated/api";

const agent = new Agent(components.agent, {
  name: "Support Agent",
  languageModel: openai.chat("gpt-4o-mini"),
  instructions: SUPPORT_AGENT_PROMPT
});

export default agent;