const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: { type: String, required: true },
    steps: { type: String, required: true },
    image: { type: String },
    comments: [
        {
            content: { type: String, required: true },
            author: { type: String, required: true },
            date: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('Recipe', RecipeSchema);
