const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  analyzeTransactionRisk,
  getTransactionAssistance,
  verifyIdentityHints,
  generateTransactionSummary,
  detectSuspiciousActivity
} = require('../services/aiAssistantService');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get transaction assistance
router.post('/assistance', auth, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    const assistance = await getTransactionAssistance(message, conversationHistory);

    res.json({
      success: true,
      response: assistance
    });
  } catch (error) {
    console.error('Error getting assistance:', error);
    res.status(500).json({ error: 'Error obteniendo asistencia' });
  }
});

// Analyze transaction risk
router.post('/analyze-risk', auth, async (req, res) => {
  try {
    const { transactionId } = req.body;

    const transaction = await Transaction.findById(transactionId)
      .populate('fromUser')
      .populate('toUser');

    if (!transaction) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    const riskAnalysis = await analyzeTransactionRisk(transaction);

    res.json({
      success: true,
      riskAnalysis
    });
  } catch (error) {
    console.error('Error analyzing risk:', error);
    res.status(500).json({ error: 'Error analizando riesgo' });
  }
});

// Verify identity
router.post('/verify-identity', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userProfile = {
      name: user.name,
      country: user.country,
      age: user.age,
      transactionCount: user.transactionCount || 0,
      totalVolume: user.totalVolume || 0,
      accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)),
      twoFactorEnabled: user.twoFactorEnabled || false,
      kycVerified: user.kycVerified || false
    };

    const verification = await verifyIdentityHints(userProfile);

    res.json({
      success: true,
      verification
    });
  } catch (error) {
    console.error('Error verifying identity:', error);
    res.status(500).json({ error: 'Error verificando identidad' });
  }
});

// Generate transaction summary
router.post('/summary', auth, async (req, res) => {
  try {
    const { transactionId } = req.body;

    const transaction = await Transaction.findById(transactionId)
      .populate('fromUser')
      .populate('toUser');

    if (!transaction) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    const summary = await generateTransactionSummary(transaction);

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Error generando resumen' });
  }
});

// Detect suspicious activity
router.get('/suspicious-activity', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const activities = await Transaction.find({
      $or: [{ fromUser: req.user.id }, { toUser: req.user.id }]
    })
    .sort('-createdAt')
    .limit(10);

    const activityLog = activities.map(a => ({
      type: a.fromUser.toString() === req.user.id ? 'sent' : 'received',
      amount: a.amount,
      currency: a.fromCurrency,
      createdAt: a.createdAt
    }));

    const suspicious = await detectSuspiciousActivity(user, activityLog);

    res.json({
      success: true,
      suspicious
    });
  } catch (error) {
    console.error('Error detecting suspicious activity:', error);
    res.status(500).json({ error: 'Error detectando actividad sospechosa' });
  }
});

module.exports = router;