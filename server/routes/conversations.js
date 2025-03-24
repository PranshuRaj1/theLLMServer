import express from "express";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Get all conversations for a user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      userId: req.user.sub,
    }).sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Create a new conversation
router.post("/", authMiddleware, async (req, res) => {
  try {
    const newConversation = new Conversation({
      userId: req.user.sub,
      title: req.body.title || "New Conversation",
    });

    const savedConversation = await newConversation.save();
    res.status(201).json({
      conversationId: savedConversation._id,
      message: "Conversation created successfully",
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// Update conversation title
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.sub,
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    conversation.title = req.body.title;
    conversation.updatedAt = Date.now();
    await conversation.save();

    res.json({ message: "Conversation updated successfully" });
  } catch (error) {
    console.error("Error updating conversation:", error);
    res.status(500).json({ error: "Failed to update conversation" });
  }
});

// Delete a conversation
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.sub,
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId: req.params.id });

    // Delete the conversation
    await Conversation.deleteOne({ _id: req.params.id });

    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

export default router;
