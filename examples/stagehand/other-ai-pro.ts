import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { Stagehand } from "stagehand-nstbrowser";
import { AISdkClient } from "./ai-client-sdk";

const openAI = createOpenAI({
  apiKey: "your-openai-key",
  baseURL: "https://your-other-ai-provider/v1",
});

async function example() {
  const stagehand = new Stagehand({
    apiKey: 'your-nstbrowser-api-key', // for authentication
    profileId: 'your-nstbrowser-profile-id', // required
    llmClient: new AISdkClient({
      model: openAI.chat("gpt-4o"),
    }),
  });

  await stagehand.init();
  await stagehand.page.goto("https://news.ycombinator.com");

  const headlines = await stagehand.page.extract({
    instruction: "Extract only 3 stories from the Hacker News homepage.",
    schema: z.object({
      stories: z
        .array(
          z.object({
            title: z.string(),
            url: z.string(),
            points: z.number(),
          }),
        )
        .length(3),
    }),
  });

  console.log(headlines);

  await stagehand.close();
}

(async () => {
  try {
    await example();
  } catch (e) {
    console.log(e);
  }
})();
