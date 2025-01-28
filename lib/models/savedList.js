import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Should have a name option
let savedSchema = new Schema({
  userId: String,
  savedRecc: { type: Array, default: undefined },
});

export const SavedRecc = mongoose.models?.SavedList || mongoose.model('SavedList', savedSchema);

export const addToSaved = async function(id, products) {
  try {
    const savedR = new SavedRecc({ userId: id, savedRecc: products });
    await savedR.save();


    console.log("Recommendation list  successfully added.");
  } catch(err) {
    console.log(err);
    //throw new Error("Unable to add saved list.");
  }
}

export const getSavedList = async function(id) {
  try {
    const loadList = await SavedRecc.find({ userId: id });
    return loadList;

  } catch(err) {
    console.log(err);
    //throw new Error("load saved list.");
  }
}

export const delSavedList = async function(id) {
  try {
    await SavedRecc.deleteMany({ userId: id });
    console.log("All saved list have been deleted.");

  } catch(err) {
    console.log(err);
    //throw new Error("Unable to delete all saved list.");
  }
}
