// Condition model

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let conditionSchema = new Schema({
  name: {
    type: String,
    unique: true,
  },
  description: String,
  bad_ingredient_id: [Number],
  good_ingredient_id: [Number],
});

export const Condition = mongoose.models?.Conditions || mongoose.model('Conditions', conditionSchema, 'Conditions');

// Accepts a condition id
export const getConditionById = async function(id) {
  try {
    const condition = await Condition.findById(id).lean();
    return condition;
  } catch(err) {
    throw new Error("Could not find product ID.");
  }
}

export const getConditionByName = async function(name) {
  try {
    const condition = await Condition.findOne({name: name}).lean();
    return condition;
  } catch(err) {
    throw new Error("Could not find condition by name.");
  }
}

export const getAllConditions = async function() {
  try {
    const conditions = await Condition.find({}).lean();
    return conditions;
  } catch(err) {
    throw new Error("Error retrieving all conditions.");
  }
}