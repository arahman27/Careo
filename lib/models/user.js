// User Model

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const Schema = mongoose.Schema;

// Cart is an array of product ids as integers
// TODO: Routine is still WIP, not sure what type it should be or how to handle it.
let userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  emailVerified: {type: Boolean, default: false},
  verificationToken: String, // Holds token created when the verification email is sent to the user
  cart: [Number],
  routine: [String],
  conditions: [String],
  age: Number,
  vegan: Boolean,
  crueltyFree: Boolean,
  budget: Number,
  useBudget: Boolean,
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);

export const registerUser = async function(userData) {
  if (!userData.password || !userData.email || !userData.verificationToken) {
    console.error("ERROR: Missing information in Register request.");
    throw new Error('Error: Missing information in request');
  } else {
    try {
      const hash = await bcrypt.hash(userData.password, 10);
      let newUser = new User({email: userData.email, password: hash, verificationToken: userData.verificationToken});
      
      await newUser.save();
      console.log("User: " + userData.email + " successfully registered.");
    } catch(err) {
      throw new Error(err);
      console.log("Error: " + err);
      if (err.code == 11000) {
        throw new Error("email already used.");
      } else {
        throw new Error("Unknown error has occurred.");
      }
    }
  }
}

export const checkUser = async function(userData) {
  try {
    const user = await User.findOne({email: userData.email}).exec();
    
    // Compare passwords
    try {
      await bcrypt.compare(userData.password, user.password);
      return user;
    } catch(err){
      throw new Error("Incorrect password for user " + userData.email);
    }
    
  } catch(err) {
    throw new Error("Unable to find user " + userData.email);
  }
}

export const setProfile = async function(id, profile) {
  try {
    try {
      const user = await User.findById(id).exec();
      user.vegan = profile.vegan;
      user.useBudget = profile.useBudget;
      user.budget = profile.budget;
      user.crueltyFree = profile.crueltyFree;
      user.age = profile.age;
      user.conditions = profile.conditions;
      user.save();
    } catch(err) {
      throw new Error("Unknown error has occurred.")
    }
  } catch(err) {
    throw new Error("Unable to find user " + id);
  }
}

export const findUserById = async function(id) {
  try {
    const user = await User.findById(id).exec();

    if (user) {
      return user;
    } else {
      throw new Error("Error");
    }
  } catch(err){
    throw new Error('Unable to find user ' + id);
  }
}

export const findAndValidateUserByToken = async function(token){
  try {
    const user = await User.findOne({ verificationToken : token.verificationToken }).exec();
    if (!user) {
      throw new Error("User not found");
    }
    else{
      
      // Set the token value to undefined, which will allow us to have another token with the same value in the future
      user.emailVerified = true;
      user.verificationToken = undefined;
      await user.save();
      
      return true;
    }
  } 
  catch(err) {
    console.error("Error finding and validating user: ", err);
    throw new Error("Unable to find user");
  }
}

export const findUserWithEmail = async function(userEmail){
  try{
    const user = await User.findOne({email : userEmail.email});
    if(!user){
      console.error("User not found");
      return;
    }
    else{
      return user._id.toString();
    }
  }
  catch(err){
    console.error("Error finding user: ", err);
    throw err;
  }
}

// This function is used when the user is not logged in and trying to reset their password
export const updateUsersPassword = async function(id, password){
  try{
    // Finding user by their id
    const user = await User.findById(id.user_id);

    if(user){
      // Encrypt password, update it and then save it
      const hash = await bcrypt.hash(password, 10);
      user.password = hash;
      await user.save();
      return true;
    }

  }
  catch(err){
    console.error("An error occurred: ", err);
    throw err;
  }
}

export const deleteUserAccount = async function(email, password){
  try{
    // findOneAndDelete finds the first document that matches the search and removes it. Should work fine if we're using both email and password
    const isDeleted = await User.findOneAndDelete({email: email}, {password: password});

    if (isDeleted){
      return true;
    }
  }
  catch(err){
    console.error("An error occurred: ", err);
    throw err;
  }
}

// This function is used when the user is logged in and trying to update their password
export const updateLoggedInUsersPassword = async function(email, password){
  try{
    const user = await User.findOne({email : email});
    if(!user){
      console.error("User not found");
      return false;
    }
    else{
      // Encrypt password, update it and then save it
      const hash = await bcrypt.hash(password, 10);
      user.password = hash;

      await user.save();
      
      return true;
    }
  }
  catch(err){
    console.error("Error finding user: ", err);
    throw err;
  }
}

// TODO: Retrieve cart, profile, recommendations