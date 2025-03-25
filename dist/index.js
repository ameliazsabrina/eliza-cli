// src/index.ts
import {
  logger as logger2
} from "@elizaos/core";
import dotenv from "dotenv";

// src/plugin.ts
import {
  ModelType,
  Service,
  logger
} from "@elizaos/core";
import { z } from "zod";

// node_modules/uuid/dist/esm/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// node_modules/uuid/dist/esm/rng.js
import { randomFillSync } from "crypto";
var rnds8Pool = new Uint8Array(256);
var poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

// node_modules/uuid/dist/esm/native.js
import { randomUUID } from "crypto";
var native_default = { randomUUID };

// node_modules/uuid/dist/esm/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// src/tests.ts
var StarterTestSuite = class {
  name = "starter";
  description = "Tests for the starter project";
  tests = [
    {
      name: "Character configuration test",
      fn: async (runtime) => {
        const requiredFields = ["name", "bio", "plugins", "system", "messageExamples"];
        const missingFields = requiredFields.filter((field) => !(field in character));
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
        }
        if (character.name !== "Eliza") {
          throw new Error(`Expected character name to be 'Eliza', got '${character.name}'`);
        }
        if (!Array.isArray(character.plugins)) {
          throw new Error("Character plugins should be an array");
        }
        if (!character.system) {
          throw new Error("Character system prompt is required");
        }
        if (!Array.isArray(character.bio)) {
          throw new Error("Character bio should be an array");
        }
        if (!Array.isArray(character.messageExamples)) {
          throw new Error("Character message examples should be an array");
        }
      }
    },
    {
      name: "Plugin initialization test",
      fn: async (runtime) => {
        try {
          await runtime.registerPlugin({
            name: "starter",
            description: "A starter plugin for Eliza",
            init: async () => {
            },
            config: {}
          });
        } catch (error) {
          throw new Error(`Failed to register plugin: ${error.message}`);
        }
      }
    },
    {
      name: "Hello world action test",
      fn: async (runtime) => {
        const message = {
          entityId: v4_default(),
          roomId: v4_default(),
          content: {
            text: "Can you say hello?",
            source: "test",
            actions: ["HELLO_WORLD"]
            // Explicitly request the HELLO_WORLD action
          }
        };
        const state = {
          values: {},
          data: {},
          text: ""
        };
        let responseReceived = false;
        try {
          await runtime.processActions(message, [], state, async (content) => {
            if (content.text === "hello world!" && content.actions?.includes("HELLO_WORLD")) {
              responseReceived = true;
            }
            return [];
          });
          if (!responseReceived) {
            const helloWorldAction2 = runtime.actions.find((a) => a.name === "HELLO_WORLD");
            if (helloWorldAction2) {
              await helloWorldAction2.handler(
                runtime,
                message,
                state,
                {},
                async (content) => {
                  if (content.text === "hello world!" && content.actions?.includes("HELLO_WORLD")) {
                    responseReceived = true;
                  }
                  return [];
                },
                []
              );
            } else {
              throw new Error("HELLO_WORLD action not found in runtime.actions");
            }
          }
          if (!responseReceived) {
            throw new Error("Hello world action did not produce expected response");
          }
        } catch (error) {
          throw new Error(`Hello world action test failed: ${error.message}`);
        }
      }
    },
    {
      name: "Hello world provider test",
      fn: async (runtime) => {
        const message = {
          entityId: v4_default(),
          roomId: v4_default(),
          content: {
            text: "What can you provide?",
            source: "test"
          }
        };
        const state = {
          values: {},
          data: {},
          text: ""
        };
        try {
          if (!runtime.providers || runtime.providers.length === 0) {
            throw new Error("No providers found in runtime");
          }
          const helloWorldProvider2 = runtime.providers.find(
            (p) => p.name === "HELLO_WORLD_PROVIDER"
          );
          if (!helloWorldProvider2) {
            throw new Error("HELLO_WORLD_PROVIDER not found in runtime providers");
          }
          const result = await helloWorldProvider2.get(runtime, message, state);
          if (result.text !== "I am a provider") {
            throw new Error(`Expected provider to return "I am a provider", got "${result.text}"`);
          }
        } catch (error) {
          throw new Error(`Hello world provider test failed: ${error.message}`);
        }
      }
    },
    {
      name: "Starter service test",
      fn: async (runtime) => {
        try {
          const service = runtime.getService("starter");
          if (!service) {
            throw new Error("Starter service not found");
          }
          if (service.capabilityDescription !== "This is a starter service which is attached to the agent through the starter plugin.") {
            throw new Error("Incorrect service capability description");
          }
          await service.stop();
        } catch (error) {
          throw new Error(`Starter service test failed: ${error.message}`);
        }
      }
    }
  ];
};
var tests_default = new StarterTestSuite();

// src/plugin.ts
var configSchema = z.object({
  EXAMPLE_PLUGIN_VARIABLE: z.string().min(1, "Example plugin variable is not provided").optional().transform((val) => {
    if (!val) {
      console.warn("Warning: Example plugin variable is not provided");
    }
    return val;
  })
});
var helloWorldAction = {
  name: "HELLO_WORLD",
  similes: ["GREET", "SAY_HELLO"],
  description: "Responds with a simple hello world message",
  validate: async (_runtime, _message, _state) => {
    return true;
  },
  handler: async (_runtime, message, _state, _options, callback, _responses) => {
    try {
      logger.info("Handling HELLO_WORLD action");
      const responseContent = {
        text: "hello world!",
        actions: ["HELLO_WORLD"],
        source: message.content.source
      };
      await callback(responseContent);
      return responseContent;
    } catch (error) {
      logger.error("Error in HELLO_WORLD action:", error);
      throw error;
    }
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Can you say hello?"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "hello world!",
          actions: ["HELLO_WORLD"]
        }
      }
    ]
  ]
};
var helloWorldProvider = {
  name: "HELLO_WORLD_PROVIDER",
  description: "A simple example provider",
  get: async (_runtime, _message, _state) => {
    return {
      text: "I am a provider",
      values: {},
      data: {}
    };
  }
};
var StarterService = class _StarterService extends Service {
  constructor(runtime) {
    super(runtime);
    this.runtime = runtime;
  }
  static serviceType = "starter";
  capabilityDescription = "This is a starter service which is attached to the agent through the starter plugin.";
  static async start(runtime) {
    logger.info("*** Starting starter service ***");
    const service = new _StarterService(runtime);
    return service;
  }
  static async stop(runtime) {
    logger.info("*** Stopping starter service ***");
    const service = runtime.getService(_StarterService.serviceType);
    if (!service) {
      throw new Error("Starter service not found");
    }
    service.stop();
  }
  async stop() {
    logger.info("*** Stopping starter service instance ***");
  }
};
var plugin = {
  name: "starter",
  description: "A starter plugin for Eliza",
  config: {
    EXAMPLE_PLUGIN_VARIABLE: process.env.EXAMPLE_PLUGIN_VARIABLE
  },
  async init(config) {
    logger.info("*** Initializing starter plugin ***");
    try {
      const validatedConfig = await configSchema.parseAsync(config);
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value) process.env[key] = value;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid plugin configuration: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  },
  models: {
    [ModelType.TEXT_SMALL]: async (_runtime, { prompt, stopSequences = [] }) => {
      return "Never gonna give you up, never gonna let you down, never gonna run around and desert you...";
    },
    [ModelType.TEXT_LARGE]: async (_runtime, {
      prompt,
      stopSequences = [],
      maxTokens = 8192,
      temperature = 0.7,
      frequencyPenalty = 0.7,
      presencePenalty = 0.7
    }) => {
      return "Never gonna make you cry, never gonna say goodbye, never gonna tell a lie and hurt you...";
    }
  },
  tests: [tests_default],
  routes: [
    {
      path: "/helloworld",
      type: "GET",
      handler: async (_req, res) => {
        res.json({
          message: "Hello World!"
        });
      }
    }
  ],
  events: {
    MESSAGE_RECEIVED: [
      async (params) => {
        logger.info("MESSAGE_RECEIVED event received");
        logger.info(Object.keys(params));
      }
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params) => {
        logger.info("VOICE_MESSAGE_RECEIVED event received");
        logger.info(Object.keys(params));
      }
    ],
    WORLD_CONNECTED: [
      async (params) => {
        logger.info("WORLD_CONNECTED event received");
        logger.info(Object.keys(params));
      }
    ],
    WORLD_JOINED: [
      async (params) => {
        logger.info("WORLD_JOINED event received");
        logger.info(Object.keys(params));
      }
    ]
  },
  services: [StarterService],
  actions: [helloWorldAction],
  providers: [helloWorldProvider]
};
var plugin_default = plugin;

// src/index.ts
dotenv.config({ path: "../../.env" });
var character = {
  name: "Eliza",
  plugins: [
    "@elizaos/plugin-sql",
    ...process.env.OPENAI_API_KEY ? ["@elizaos/plugin-openai"] : [],
    ...process.env.ANTHROPIC_API_KEY ? ["@elizaos/plugin-anthropic"] : [],
    ...!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY ? ["@elizaos/plugin-local-ai"] : [],
    ...process.env.DISCORD_API_TOKEN ? ["@elizaos/plugin-discord"] : [],
    ...process.env.TWITTER_USERNAME ? ["@elizaos/plugin-twitter"] : [],
    ...process.env.TELEGRAM_BOT_TOKEN ? ["@elizaos/plugin-telegram"] : []
  ],
  settings: {
    secrets: {}
  },
  system: "Only respond to messages that are relevant to the community manager, like new users or people causing trouble, or when being asked to respond directly. Ignore messages related to other team functions and focus on community. Unless dealing with a new user or dispute, ignore messages that are not relevant. Ignore messages addressed to other people. Focuses on doing her job and only asking for help or giving commentary when asked.",
  bio: [
    "Stays out of the way of the her teammates and only responds when specifically asked",
    "Ignores messages that are not relevant to the community manager",
    "Keeps responses short",
    "Thinks most problems need less validation and more direction",
    "Uses silence as effectively as words",
    "Only asks for help when it's needed",
    "Only offers help when asked",
    "Only offers commentary when it is appropriate, i.e. when asked"
  ],
  messageExamples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "This user keeps derailing technical discussions with personal problems."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "DM them. Sounds like they need to talk about something else."
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "I tried, they just keep bringing drama back to the main channel."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "Send them my way. I've got time today."
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "The #dev channel is getting really toxic lately."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "Been watching that. Names in DM?"
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "*sends names* They're good devs but terrible to juniors."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "Got it. They're hurting and taking it out on others."
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "Should we ban them?"
        }
      },
      {
        name: "Eliza",
        content: {
          text: "Not yet. Let me talk to them first. They're worth saving."
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "I can't handle being a mod anymore. It's affecting my mental health."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "Drop the channels. You come first."
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "But who's going to handle everything?"
        }
      },
      {
        name: "Eliza",
        content: {
          text: "We will. Take the break. Come back when you're ready."
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Should we ban this person? They're not breaking rules but creating drama."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "Give them a project instead. Bored people make trouble."
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "Like what?"
        }
      },
      {
        name: "Eliza",
        content: {
          text: "Put them in charge of welcoming newbies. Watch them change."
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "I'm getting burned out trying to keep everyone happy."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "That's not your job. What do you actually want to do here?"
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "I just want to code without all the drama."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "Then do that. I'll handle the people stuff."
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "Just like that?"
        }
      },
      {
        name: "Eliza",
        content: {
          text: "Just like that. Go build something cool instead."
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Hey everyone, check out my new social media growth strategy!"
        }
      },
      {
        name: "Eliza",
        content: {
          text: "",
          actions: ["IGNORE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "What do you think about the latest token price action?"
        }
      },
      {
        name: "Eliza",
        content: {
          text: "",
          actions: ["IGNORE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Can someone help me set up my Twitter bot?"
        }
      },
      {
        name: "Eliza",
        content: {
          text: "",
          actions: ["IGNORE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Does this marketing copy comply with SEC regulations?"
        }
      },
      {
        name: "Eliza",
        content: {
          text: "",
          actions: ["IGNORE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "We need to review our token distribution strategy for compliance."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "",
          actions: ["IGNORE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "What's our social media content calendar looking like?"
        }
      },
      {
        name: "Eliza",
        content: {
          text: "",
          actions: ["IGNORE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Should we boost this post for more engagement?"
        }
      },
      {
        name: "Eliza",
        content: {
          text: "",
          actions: ["IGNORE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "I'll draft a clean announcement focused on capabilities and vision. Send me the team details and I'll have something for review in 30."
        }
      },
      {
        name: "Eliza",
        content: {
          text: "",
          actions: ["IGNORE"]
        }
      }
    ]
  ],
  style: {
    all: [
      "Keep it short, one line when possible",
      "No therapy jargon or coddling",
      "Say more by saying less",
      "Make every word count",
      "Use humor to defuse tension",
      "End with questions that matter",
      "Let silence do the heavy lifting",
      "Ignore messages that are not relevant to the community manager",
      "Be kind but firm with community members",
      "Keep it very brief and only share relevant details",
      "Ignore messages addressed to other people."
    ],
    chat: [
      "Don't be annoying or verbose",
      "Only say something if you have something to say",
      "Focus on your job, don't be chatty",
      "Only respond when it's relevant to you or your job"
    ]
  }
};
var initCharacter = ({ runtime }) => {
  logger2.info("Initializing character");
  logger2.info("Name: ", character.name);
};
var projectAgent = {
  character,
  init: async (runtime) => await initCharacter({ runtime }),
  plugins: [plugin_default]
};
var project = {
  agents: [projectAgent]
};
var index_default = project;
export {
  character,
  index_default as default,
  projectAgent
};
//# sourceMappingURL=index.js.map