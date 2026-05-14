const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Analyze transaction risk
const analyzeTransactionRisk = async (transaction) => {
  try {
    const prompt = `Analiza el riesgo de esta transacción de criptomonedas:
    - Cantidad: ${transaction.amount} ${transaction.fromCurrency}
    - De: ${transaction.fromUser?.country || 'Desconocido'}
    - Hacia: ${transaction.toUser?.country || 'Desconocido'}
    - Tipo: ${transaction.type}
    - Historial: ${transaction.fromUser?.transactionCount || 0} transacciones previas
    
    Proporciona: riesgo (bajo/medio/alto), razón, recomendación en formato JSON.`;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300
    });

    const content = response.data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch {
      return {
        riskLevel: 'medio',
        reason: content,
        recommendation: 'Verificar manualmente'
      };
    }
  } catch (error) {
    console.error('Error analyzing transaction risk:', error);
    return {
      riskLevel: 'alto',
      reason: 'Error en análisis',
      recommendation: 'Rechazar transacción'
    };
  }
};

// Generate transaction assistance
const getTransactionAssistance = async (userMessage, conversationHistory = []) => {
  try {
    const messages = [
      {
        role: 'system',
        content: `Eres un asistente de intercambio P2P de criptomonedas. Ayuda a los usuarios con:
        - Información sobre transacciones
        - Explicación de comisiones y tasas de cambio
        - Verificación de direcciones
        - Consejos de seguridad
        - Resolución de problemas
        
        Sé conciso, amable y profesional. Responde en español.`
      },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting transaction assistance:', error);
    return 'Lo siento, hay un error. Por favor intenta de nuevo.';
  }
};

// Verify user identity hints
const verifyIdentityHints = async (userProfile) => {
  try {
    const prompt = `Basado en este perfil de usuario, ¿parece genuino y de bajo riesgo?
    - Nombre: ${userProfile.name}
    - País: ${userProfile.country}
    - Edad: ${userProfile.age}
    - Transacciones: ${userProfile.transactionCount}
    - Volumen total: ${userProfile.totalVolume}
    - Tiempo de cuenta: ${userProfile.accountAge} días
    - Verificación 2FA: ${userProfile.twoFactorEnabled ? 'Sí' : 'No'}
    - KYC verificado: ${userProfile.kycVerified ? 'Sí' : 'No'}
    
    Responde con: genuino (sí/no), confianza (%), notas en JSON.`;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 200
    });

    const content = response.data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch {
      return {
        genuine: 'unknown',
        confidence: 0,
        notes: content
      };
    }
  } catch (error) {
    console.error('Error verifying identity:', error);
    return {
      genuine: 'unknown',
      confidence: 0,
      notes: 'Error en verificación'
    };
  }
};

// Generate transaction summary
const generateTransactionSummary = async (transaction) => {
  try {
    const prompt = `Crea un resumen conciso de esta transacción de criptomonedas:
    - De: ${transaction.fromUser?.name} (${transaction.fromUser?.country})
    - Hacia: ${transaction.toUser?.name} (${transaction.toUser?.country})
    - Cantidad: ${transaction.amount} ${transaction.fromCurrency}
    - Recibe: ${transaction.receivedAmount} ${transaction.toCurrency}
    - Tasa: ${transaction.exchangeRate}
    - Comisión: ${transaction.fee}%
    - Estado: ${transaction.status}
    
    Formato: Resumen en 1-2 oraciones.`;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary:', error);
    return `Transacción de ${transaction.amount} ${transaction.fromCurrency} a ${transaction.toCurrency}`;
  }
};

// Detect suspicious activity
const detectSuspiciousActivity = async (user, activityLog) => {
  try {
    const recentActivity = activityLog.slice(-10);
    const activitySummary = recentActivity.map(a => `${a.type}: ${a.amount} ${a.currency}`).join(', ');

    const prompt = `Analiza si hay actividad sospechosa:
    - Usuario: ${user.name}
    - País: ${user.country}
    - Verificado: ${user.verified}
    - Actividad reciente: ${activitySummary}
    - Frecuencia: ${recentActivity.length} transacciones en últimas 24h
    
    ¿Hay algo sospechoso? Responde: sí/no, riesgo (bajo/medio/alto), detalles en JSON.`;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 250
    });

    const content = response.data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch {
      return {
        suspicious: false,
        riskLevel: 'bajo',
        details: content
      };
    }
  } catch (error) {
    console.error('Error detecting suspicious activity:', error);
    return {
      suspicious: false,
      riskLevel: 'medio',
      details: 'Error en análisis'
    };
  }
};

module.exports = {
  analyzeTransactionRisk,
  getTransactionAssistance,
  verifyIdentityHints,
  generateTransactionSummary,
  detectSuspiciousActivity
};