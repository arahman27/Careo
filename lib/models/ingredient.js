// Ingredient model

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let ingredientSchema = new Schema({
  name: {
    type: String,
    unique: true,
  },
  description: String,
});

export const Ingredient = mongoose.models?.Ingredients || mongoose.model('Ingredients', ingredientSchema);

// Accepts a ingredient id
export const getIngredientById = async function(id) {
  try {
    const ingredient = await Ingredient.findById(id).lean();
    return ingredient;
  } catch(err) {
    throw new Error("Could not find product ID.");
  }
}

export const getAllIngredients = async function() {
  try {
    const ingredients = await Ingredient.find({}).lean();
    return ingredients;
  } catch(err) {
    throw new Error("Error retrieving all ingredients.");
  }
}