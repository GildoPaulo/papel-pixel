const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple } = require('../utils/upload');
const { authenticate, isAdmin } = require('../middleware/auth');
const path = require('path');

// Upload de imagem única (também aceita /upload sem /image)
router.post('/', authenticate, isAdmin, uploadSingle, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }

    // URL pública da imagem
    const imageUrl = `/uploads/products/${req.file.filename}`;
    const fullUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}${imageUrl}`;

    console.log('✅ [UPLOAD] Imagem enviada:', req.file.filename);

    res.json({
      success: true,
      message: 'Imagem enviada com sucesso',
      url: imageUrl,
      imageUrl: imageUrl,
      fullUrl: fullUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('❌ [UPLOAD] Erro:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

// Upload de imagem única (rota alternativa)
router.post('/image', authenticate, isAdmin, uploadSingle, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }

    // URL pública da imagem
    const imageUrl = `/uploads/products/${req.file.filename}`;
    const fullUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}${imageUrl}`;

    console.log('✅ [UPLOAD] Imagem enviada:', req.file.filename);

    res.json({
      success: true,
      message: 'Imagem enviada com sucesso',
      imageUrl: imageUrl,
      fullUrl: fullUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('❌ [UPLOAD] Erro:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

// Upload de múltiplas imagens
router.post('/images', authenticate, isAdmin, uploadMultiple, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }

    const imageUrls = req.files.map(file => ({
      url: `/uploads/products/${file.filename}`,
      fullUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/uploads/products/${file.filename}`,
      filename: file.filename
    }));

    console.log('✅ [UPLOAD]', req.files.length, 'imagem(ns) enviada(s)');

    res.json({
      success: true,
      message: `${req.files.length} imagem(ns) enviada(s) com sucesso`,
      images: imageUrls
    });
  } catch (error) {
    console.error('❌ [UPLOAD] Erro:', error);
    res.status(500).json({ error: 'Erro ao fazer upload das imagens' });
  }
});

module.exports = router;

