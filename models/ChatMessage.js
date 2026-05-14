const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    unique: true,
    required: true
  },
  
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  content: {
    type: String,
    required: true
  },
  
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'transaction', 'aiMessage', 'notification'],
    default: 'text'
  },
  
  // Media attachment
  media: {
    type: String,
    url: String,
    mimeType: String,
    size: Number
  },
  
  // Transaction proposal within chat
  transactionProposal: {
    amount: Number,
    currency: String,
    type: {
      type: String,
      enum: ['send', 'receive', 'swap'],
      default: 'send'
    },
    status: {
      type: String,
      enum: ['proposed', 'accepted', 'rejected', 'completed'],
      default: 'proposed'
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }
  },
  
  // AI Message
  aiMessage: {
    isAI: Boolean,
    aiModel: String,
    confidence: Number,
    suggestion: String
  },
  
  // Message status
  read: { type: Boolean, default: false },
  readAt: Date,
  edited: { type: Boolean, default: false },
  editedAt: Date,
  
  // Reactions/Interactions
  reactions: [{
    emoji: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  replies: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage'
  },
  
  // Video call reference
  videoCallReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoCall'
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for conversation query
chatMessageSchema.index({ conversation: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
