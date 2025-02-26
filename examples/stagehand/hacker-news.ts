import { z } from "zod";
import { Stagehand } from "stagehand-nstbrowser";

async function example() {
  const stagehand = new Stagehand({
    apiKey: 'your-nstbrowser-api-key', // for authentication
    profileId: 'your-nstbrowser-profile-id', // required
    modelClientOptions: {
      apiKey: 'your-openai-key'
    },
    modelName: 'gpt-4o',
    nstbrowserParams: {
      fingerprint: {
        userAgent: 'your-ua',
        hardwareConcurrency: 8,
        // your other fingerprints
      }
    }
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

  console.log("headlines: ", headlines);

  await stagehand.close();
}

(async () => {
  await example();
})();