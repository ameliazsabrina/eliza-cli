import express from "express";
import { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const agents: { id: string; characterPath: string; characterJson: any }[] = [];

app.post("/api/agents", (req: Request, res: Response) => {
  const { characterPath, characterJson } = req.body;

  if (!characterPath) {
    return res.status(400).json({ error: "characterPath is required" });
  }

  const id = Date.now().toString();
  const newAgent = { id, characterPath, characterJson: characterJson || {} };
  agents.push(newAgent);

  res.status(201).json(newAgent);
});

app.get("/api/agents", (req: Request, res: Response) => {
  res.json(agents);
});

app.get("/api/agents/:agentId", (req: Request, res: Response) => {
  const { agentId } = req.params;
  const agent = agents.find((a) => a.id === agentId);

  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }

  res.json(agent);
});

app.post("/api/agents/:agentId", (req: Request, res: Response) => {
  const { agentId } = req.params;
  const { characterPath, characterJson } = req.body;

  const agentIndex = agents.findIndex((a) => a.id === agentId);

  if (agentIndex === -1) {
    return res.status(404).json({ error: "Agent not found" });
  }

  const updatedAgent = {
    id: agentId,
    characterPath: characterPath || agents[agentIndex].characterPath,
    characterJson: characterJson || agents[agentIndex].characterJson,
  };

  agents[agentIndex] = updatedAgent;

  res.json(updatedAgent);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
