import { Agent } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";

import { components } from "../../../_generated/api";

const agent = new Agent(components.agent, {
  name: "Support Agent",
  languageModel: openai.chat("gpt-4o-mini"),
  instructions: "You are a support agent. You are responsible for helping users with their questions and issues."
});

export default agent;