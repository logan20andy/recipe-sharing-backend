const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Comment = require('../models/Comment'); // Asegúrate de que el modelo Comment exista y esté correctamente importado

// Definir rutas para comentarios

// Ruta para agregar un comentario
router.post('/', [
    check('text', 'Text is required').not().isEmpty(),
    check('user', 'User ID is required').not().isEmpty(),
    check('recipe', 'Recipe ID is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { text, user, recipe } = req.body;
    try {
        const comment = new Comment({ text, user, recipe });
        await comment.save();
        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Otras rutas como GET, PUT, DELETE para comentarios...

module.exports = router;
