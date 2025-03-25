// server.js
import express from "express";
import cors from "cors";
import connectDB from "./db/db.js";
import conversationRoutes from "./routes/conversations.js";
import messageRoutes from "./routes/messages.js";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import limiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: ["https://the-llm.vercel.app"],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json());

// Apply rate limiting to all requests
app.use(limiter);

// Routes
app.use("/api/conversations", conversationRoutes);
app.use("/api", messageRoutes);

// Groq API endpoint
app.post("/api/groq-completion", async (req, res) => {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const pretext = process.env.TEXT; // Include the full pretext here

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: pretext + req.body.message,
        },
      ],
      model: "llama3-70b-8192",
      temperature: 0.4,
      max_tokens: 1500,
    });

    res.json(chatCompletion.choices[0]?.message?.content || "");
  } catch (error) {
    console.error("Error fetching chat completion:", error);
    res.status(500).json({ error: "Failed to get chat completion" });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ error: "Invalid token" });
  }
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port number ${PORT}`)
);
