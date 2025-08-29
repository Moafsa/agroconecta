const mongoose = require('mongoose');

const profissionalSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  senha: {
    type: String,
    required: true
  },
  contato: {
    type: String,
    required: true,
    trim: true
  },
  foto: {
    type: String,
    default: ''
  },
  especialidades: [{
    type: String,
    trim: true
  }],
  regiao_atuacao: {
    type: String,
    required: true,
    trim: true
  },
  agenda_disponibilidade: [{
    dia: {
      type: String,
      required: true
    },
    horarios: [{
      type: String,
      required: true
    }]
  }],
  avaliacoes: [{
    produtor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produtor'
    },
    nota: {
      type: Number,
      min: 1,
      max: 5
    },
    comentario: {
      type: String,
      trim: true
    },
    data: {
      type: Date,
      default: Date.now
    }
  }],
  status_assinatura: {
    type: String,
    enum: ['ativo', 'inativo', 'pendente'],
    default: 'pendente'
  },
  data_cadastro: {
    type: Date,
    default: Date.now
  },
  data_atualizacao: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar data_atualizacao antes de salvar
profissionalSchema.pre('save', function(next) {
  this.data_atualizacao = Date.now();
  next();
});

module.exports = mongoose.model('Profissional', profissionalSchema);

