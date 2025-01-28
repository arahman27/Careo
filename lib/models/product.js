// Product model

import mongoose from 'mongoose';
import { db } from '../middleware/mongodb';

const Schema = mongoose.Schema;

// TODO: should we add arrays of conditions that are recommended and not recommended for faster searching?
let productSchema = new Schema({
  _id: Number, // not ideal but this is how the data is stored. Should be changed.
  name: {
    type: String,
    unique: true,
  },
  brand: String,
  type: String,
  is_cruelty_free: Boolean,
  is_vegan: Boolean,
  price: Number,
  image: String,
  ingredients: [Number],
});

export const Product = mongoose.models?.Products || mongoose.model('Products', productSchema, "Products");

// Accepts a product id
export const getProduct = async function(id) {
  try {
    const product = await Product.findById(id).lean();
    return product;
  } catch(err) {
    throw new Error("Could not find product with id " + id);
  }
}

export const getAllProducts = async function() {
  try {
    // lean returns the objects as simple POJOs
    const products = await Product.find({}).lean();
    return products;
  } catch(err) {
    console.log(err);
    throw new Error("Could not retrieve products.");
  }
}

export const getAllProductsVegan = async function() {
  try {
    const products = await Product.find({is_vegan: true}).lean();
    return products;
  } catch(err) {
    console.log(err);
    throw new Error("Could not retrieve list of vegan products");
  }
}

export const getAllProductsCrueltyFree = async function() {
  try {
    const products = await Product.find({is_cruelty_free: true}).lean();
    return products;
  } catch(err) {
    console.log(err);
    throw new Error("Could not retrieve list of cruelty free products");
  }
}

export const getAllProductsVeganAndCrueltyFree = async function() {
  try {
    const products = await Product.find({is_vegan: true, is_cruelty_free: true}).lean();
    return products;
  } catch(err) {
    console.log(err);
    throw new Error("Could not retrieve list of all vegan and cruelty free products");
  }
}