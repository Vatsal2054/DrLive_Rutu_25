import Chat from "../models/chat.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const chat = await Chat.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: 1 }); 

    return res
      .status(200)
      .json(new ApiResponse(200, chat, "Chat fetched successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err.message));
  }
};

const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { receiverId, message } = req.body;
    const chat = new Chat({
      senderId: userId,
      receiverId: receiverId,
      message,
    });
    await chat.save();
    return res
      .status(200)
      .json(new ApiResponse(200, chat, "Message sent successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err.message));
  }
};

const deleteMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const chatId = req.params.id;
    const chat = await Chat.findByIdAndDelete({
      _id: chatId,
      $or: [{ senderId: userId }, { receiverId: userId }],
    });
    return res
      .status(200)
      .json(new ApiResponse(200, chat, "Message deleted successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err.message));
  }
};

export { getChat, sendMessage, deleteMessage };
