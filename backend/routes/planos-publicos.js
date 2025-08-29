const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Listar planos públicos (sem autenticação)
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query;

    const where = {
      ativo: true
    };

    if (categoria) {
      where.categoria = categoria;
    }

    const planos = await prisma.plano.findMany({
      where,
      select: {
        id: true,
        nome: true,
        descricao: true,
        tipo_plano: true,
        categoria: true,
        valor: true,
        periodo: true,
        recursos: true,
        limite_consultas: true,
        limite_profissionais: true
      },
      orderBy: [
        { categoria: 'asc' },
        { valor: 'asc' }
      ]
    });

    res.json(planos);
  } catch (error) {
    console.error('Erro ao buscar planos públicos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar plano por ID (público)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const plano = await prisma.plano.findUnique({
      where: { 
        id,
        ativo: true
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        tipo_plano: true,
        categoria: true,
        valor: true,
        periodo: true,
        recursos: true,
        limite_consultas: true,
        limite_profissionais: true
      }
    });

    if (!plano) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }

    res.json(plano);
  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
