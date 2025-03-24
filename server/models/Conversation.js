import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: "New Conversation",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Conversation", ConversationSchema);
