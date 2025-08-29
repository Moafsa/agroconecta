const mongoose = require('mongoose');

const produtorSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  contato: {
    type: String,
    required: true,
    trim: true
  },
  data_cadastro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Produtor', produtorSchema);

