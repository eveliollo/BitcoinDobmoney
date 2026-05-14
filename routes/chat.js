const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const ChatMessage = require('../models/ChatMessage');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// Middleware de autenticación
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Get Conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.userId
    })
      .populate('user1', 'username firstName lastName profilePicture')
      .populate('user2', 'username firstName lastName profilePicture')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener conversaciones' });
  }
});

// Get or Create Conversation
router.post('/conversation', auth, async (req, res) => {
  try {
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ error: 'ID de usuario requerido' });
    }

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.userId, otherUserId] }
    })
      .populate('user1', 'username firstName lastName profilePicture')
      .populate('user2', 'username firstName lastName profilePicture');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [req.user.userId, otherUserId],
        user1: req.user.userId,
        user2: otherUserId
      });
      await conversation.save();
      await conversation.populate('user1', 'username firstName lastName profilePicture');
      await conversation.populate('user2', 'username firstName lastName profilePicture');
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear conversación' });
  }
});

// Get Messages
router.get('/messages/:conversationId', auth, async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = 30;
    const skip = (page - 1) * limit;

    const messages = await ChatMessage.find({
      conversationId: req.params.conversationId
    })
      .populate('sender', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ChatMessage.countDocuments({
      conversationId: req.params.conversationId
    });

    res.json({
      messages: messages.reverse(),
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

// Send Message
router.post('/send', auth, async (req, res) => {
  try {
    const { conversationId, content, messageType = 'text', mediaUrl, proposal } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ error: 'Conversación y contenido requeridos' });
    }

    // Find conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversación no encontrada' });
    }

    // Verify user is part of conversation
    if (!conversation.participants.includes(req.user.userId)) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Determine receiver
    const receiver = conversation.user1.toString() === req.user.userId 
      ? conversation.user2 
      : conversation.user1;

    // Create message
    const message = new ChatMessage({
      conversationId,
      sender: req.user.userId,
      receiver,
      content,
      messageType,
      mediaUrl,
      proposal
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    conversation.messageCount += 1;
    await conversation.save();

    await message.populate('sender', 'username firstName lastName profilePicture');

    res.status(201).json(message);
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
});

// Mark as Read
router.post('/mark-read/:messageId', auth, async (req, res) => {
  try {
    const message = await ChatMessage.findByIdAndUpdate(
      req.params.messageId,
      {
        read: true,
        readAt: new Date()
      },
      { new: true }
    );

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar como leído' });
  }
});

// Get Unread Count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = await ChatMessage.countDocuments({
      receiver: req.user.userId,
      read: false
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener no leídos' });
  }
});

module.exports = router;
