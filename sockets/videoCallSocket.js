module.exports = (io) => {
  io.on('connection', (socket) => {
    // Initiate video call
    socket.on('call_initiate', (data) => {
      const { callId, callerId, calleeId, channelName } = data;
      
      io.to(`user_${calleeId}`).emit('incoming_call', {
        callId,
        callerId,
        channelName,
        timestamp: new Date()
      });

      console.log(`📞 ${callerId} está llamando a ${calleeId}`);
    });

    // Accept call
    socket.on('call_accept', (data) => {
      const { callId, callerId, calleeId } = data;
      
      io.to(`user_${callerId}`).emit('call_accepted', {
        callId,
        calleeId
      });

      console.log(`✅ ${calleeId} aceptó la llamada`);
    });

    // Reject call
    socket.on('call_reject', (data) => {
      const { callId, callerId } = data;
      
      io.to(`user_${callerId}`).emit('call_rejected', {
        callId
      });

      console.log(`❌ Llamada ${callId} rechazada`);
    });

    // End call
    socket.on('call_end', (data) => {
      const { callId, participantIds } = data;
      
      participantIds.forEach(userId => {
        io.to(`user_${userId}`).emit('call_ended', {
          callId
        });
      });

      console.log(`🏁 Llamada ${callId} finalizada`);
    });

    // Call error
    socket.on('call_error', (data) => {
      const { callId, error } = data;
      console.error(`⚠️ Error en llamada ${callId}:`, error);
    });

    // Join video room
    socket.on('join_video_call', (data) => {
      const { callId, userId } = data;
      socket.join(`call_${callId}`);
      
      io.to(`call_${callId}`).emit('participant_joined', {
        userId,
        participantCount: io.sockets.adapter.rooms.get(`call_${callId}`)?.size || 1
      });

      console.log(`🎥 ${userId} se unió a la llamada ${callId}`);
    });

    // Leave video room
    socket.on('leave_video_call', (data) => {
      const { callId, userId } = data;
      socket.leave(`call_${callId}`);
      
      io.to(`call_${callId}`).emit('participant_left', {
        userId,
        participantCount: io.sockets.adapter.rooms.get(`call_${callId}`)?.size || 0
      });

      console.log(`👋 ${userId} salió de la llamada ${callId}`);
    });

    // Update call stats
    socket.on('call_stats', (data) => {
      const { callId, stats } = data;
      
      io.to(`call_${callId}`).emit('stats_update', {
        userId: socket.userId,
        stats
      });
    });
  });
};
