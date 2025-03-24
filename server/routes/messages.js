import express from "express";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Get all messages for a conversation
router.get(
  "/conversations/:conversationId/messages",
  authMiddleware,
  async (req, res) => {
    try {
      // Verify the conversation belongs to the user
      const conversation = await Conversation.findOne({
        _id: req.params.conversationId,
        userId: req.user.sub,
      });

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const messages = await Message.find({
        conversationId: req.params.conversationId,
      }).sort({ timestamp: 1 });

      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  }
);

// Add a message to a conversation
router.post(
  "/conversations/:conversationId/messages",
  authMiddleware,
  async (req, res) => {
    try {
      // Verify the conversation belongs to the user
      const conversation = await Conversation.findOne({
        _id: req.params.conversationId,
        userId: req.user.sub,
      });

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const newMessage = new Message({
        conversationId: req.params.conversationId,
        role: req.body.role,
        content: req.body.content,
        model: req.body.model || "groq",
      });

      await newMessage.save();

      // Update conversation's updatedAt field
      conversation.updatedAt = Date.now();

      // If this is the first user message and there's no title, set the title
      if (
        req.body.role === "user" &&
        conversation.title === "New Conversation"
      ) {
        // Truncate the message if it's too long for a title
        const title =
          req.body.content.length > 50
            ? req.body.content.substring(0, 47) + "..."
            : req.body.content;
        conversation.title = title;
      }

      await conversation.save();

      res.status(201).json({ message: "Message added successfully" });
    } catch (error) {
      console.error("Error adding message:", error);
      res.status(500).json({ error: "Failed to add message" });
    }
  }
);

export default router;
