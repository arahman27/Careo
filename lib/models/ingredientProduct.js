// IngredientProductModel

import mongoose from 'mongoose';
import { Ingredient } from './ingredient';

const Schema = mongoose.Schema;

let ingredientProductSchema = new Schema({
  product_id: Number,
  ingredient_id: Number,
});

export const IngredientProduct = mongoose.models?.Products_Ingredients || mongoose.model('Products_Ingredients', ingredientProductSchema, 'Products_Ingredients');

// export const getIngredientsByProductId = async function(id) {
//   try {
//     const ingredientProducts = await IngredientProduct.find({product_id: id}).lean();
//     let ingredients = [];
//     for (let i = 0; i < ingredientProducts.length; i++) {
//       ingredients.push(ingredientProducts[i]._id);
//     }
//     return ingredients;
//   } catch (err){
//     console.error(err.message);
//     throw new Error("Error retrieving ingredients by product id");
//   }
// }

// export const getIngredientIdsByProductId = async function(id) {
//   try {
//     const ingredientProducts = await IngredientProduct.find({product_id: id}).lean();
//     let ids = [];
//     for (let i = 0; i < ingredientProducts.length; i++) {
//       ids.push(ingredientProducts[i].ingredient_id);
//     }
//     return ids;
//   } catch(err) {
//     throw new Error("Error retrieving ingredient ids by product id");
//   }
// }