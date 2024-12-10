const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { checkAuth } = require('../middlewares/auth');

// Crear una nueva receta
router.post('/', checkAuth, async (req, res) => {
    const { title, description, image, ingredients, steps } = req.body;
    try {
        const recipe = new Recipe({ title, description, image, ingredients, steps, userId: req.user.userId });
        await recipe.save();
        res.status(201).json(recipe);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
