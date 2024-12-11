const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Recipe = require('../models/Recipe');
const multer = require('multer');
const path = require('path');

// Configurar multer para la subida de imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Obtener todas las recetas
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener una receta por ID
router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        res.json(recipe);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear receta
router.post(
  "/",
  upload.single("image"),
  [
    check("title", "Title is required").not().isEmpty(),
    check("description", "Description is required").not().isEmpty(),
    check("ingredients", "Ingredients are required").not().isEmpty(),
    check("steps", "Steps are required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, description, ingredients, steps } = req.body;
    const image = req.file ? req.file.path : null;
    try {
      const recipe = new Recipe({
        title,
        description,
        ingredients,
        steps,
        image,
      });
      await recipe.save();
      res.status(201).json(recipe);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Eliminar receta
router.delete("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    await recipe.remove();
    res.json({ message: "Recipe deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener comentarios de una receta
router.get('/:id/comments', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id).populate('comments');
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        res.json(recipe.comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear comentario en una receta
router.post('/:id/comments', [
    check('content', 'Content is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

        const comment = { content: req.body.content, author: req.user.name, date: new Date() };
        recipe.comments.push(comment);
        await recipe.save();
        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
