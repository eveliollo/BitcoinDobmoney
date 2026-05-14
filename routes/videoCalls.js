const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const VideoCall = require('../models/VideoCall');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const appId = process.env.AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;

// Generate Agora token
const generateAgoraToken = (channelName, uid, role = RtcRole.PUBLISHER, expirationTimeInSeconds = 3600) => {
  return RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    expirationTimeInSeconds
  );
};

// Initiate video call
router.post('/initiate', auth, async (req, res) => {
  try {
    const { recipientId, transactionId } = req.body;

    const channelName = `${req.user.id}-${recipientId}-${Date.now()}`;
    const uid = Math.random() * 2147483647 | 0; // Random UID

    const videoCall = new VideoCall({
      initiator: req.user.id,
      recipient: recipientId,
      channelName,
      initiatorUid: uid,
      transactionId,
      status: 'pending',
      startedAt: new Date()
    });

    await videoCall.save();

    // Generate token for initiator
    const token = generateAgoraToken(channelName, uid);

    res.status(201).json({
      success: true,
      videoCall,
      token,
      channelName,
      uid,
      appId
    });
  } catch (error) {
    console.error('Error initiating video call:', error);
    res.status(500).json({ error: 'Error iniciando videollamada' });
  }
});

// Accept video call
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const videoCall = await VideoCall.findById(req.params.id);

    if (!videoCall) {
      return res.status(404).json({ error: 'Videollamada no encontrada' });
    }

    if (videoCall.recipient.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    videoCall.status = 'accepted';
    videoCall.recipientUid = Math.random() * 2147483647 | 0;
    await videoCall.save();

    // Generate token for recipient
    const token = generateAgoraToken(videoCall.channelName, videoCall.recipientUid);

    res.json({
      success: true,
      token,
      channelName: videoCall.channelName,
      uid: videoCall.recipientUid,
      appId
    });
  } catch (error) {
    console.error('Error accepting video call:', error);
    res.status(500).json({ error: 'Error aceptando videollamada' });
  }
});

// Reject video call
router.post('/:id/reject', auth, async (req, res) => {
  try {
    const videoCall = await VideoCall.findById(req.params.id);

    if (!videoCall) {
      return res.status(404).json({ error: 'Videollamada no encontrada' });
    }

    if (videoCall.recipient.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    videoCall.status = 'rejected';
    videoCall.endedAt = new Date();
    await videoCall.save();

    res.json({
      success: true,
      message: 'Videollamada rechazada'
    });
  } catch (error) {
    console.error('Error rejecting video call:', error);
    res.status(500).json({ error: 'Error rechazando videollamada' });
  }
});

// End video call
router.post('/:id/end', auth, async (req, res) => {
  try {
    const { duration, quality } = req.body;
    const videoCall = await VideoCall.findById(req.params.id);

    if (!videoCall) {
      return res.status(404).json({ error: 'Videollamada no encontrada' });
    }

    videoCall.status = 'ended';
    videoCall.endedAt = new Date();
    videoCall.duration = duration;
    videoCall.quality = quality;
    await videoCall.save();

    res.json({
      success: true,
      message: 'Videollamada finalizada',
      videoCall
    });
  } catch (error) {
    console.error('Error ending video call:', error);
    res.status(500).json({ error: 'Error finalizando videollamada' });
  }
});

// Get video call history
router.get('/history', auth, async (req, res) => {
  try {
    const videoCalls = await VideoCall.find({
      $or: [
        { initiator: req.user.id },
        { recipient: req.user.id }
      ]
    })
    .populate('initiator', 'name email avatar')
    .populate('recipient', 'name email avatar')
    .sort('-createdAt')
    .limit(50);

    res.json(videoCalls);
  } catch (error) {
    console.error('Error fetching video call history:', error);
    res.status(500).json({ error: 'Error obteniendo historial de videollamadas' });
  }
});

module.exports = router;