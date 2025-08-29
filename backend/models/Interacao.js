const mongoose = require('mongoose');

const interacaoSchema = new mongoose.Schema({
  produtor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produtor',
    required: true
  },
  profissional_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profissional',
    default: null
  },
  mensagem_inicial: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['agendado', 'concluido', 'em_andamento', 'cancelado'],
    default: 'em_andamento'
  },
  dor_cliente: {
    type: String,
    trim: true,
    default: ''
  },
  data_interacao: {
    type: Date,
    default: Date.now
  },
  historico_mensagens: [{
    remetente: {
      type: String,
      enum: ['produtor', 'profissional', 'sistema'],
      required: true
    },
    mensagem: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
});

module.exports = mongoose.model('Interacao', interacaoSchema);

