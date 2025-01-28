const mongoose = require('mongoose');

import { Product } from './product.js';

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        productId: { //should probably be renamed to product
            //type: mongoose.Schema.Types.ObjectId,
            type: Number, // Is there a reason Products use Numbers in _id instead of ObjectId?
            ref: 'Products',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        }
    }]
});

export const Cart = mongoose.models?.Cart || mongoose.model('Cart', cartSchema);

export const addToUserCart = async function (userId, productId, quantity) {
    let cart = await getCartByUserId(userId)
    let item = cart.items.find(i => i.productId._id == productId);
    if (item) {
        item.quantity += quantity;
    } else {
        cart.items.push({ productId: productId, quantity: quantity });
    }
    await cart.save();
    return cart;
}

export const emptyUserCart = async function (userId) {
    let cart = await getCartByUserId(userId);
    cart.items = [];
    await cart.save();
    return cart;
}

export const removeFromUserCart = async function (userId, productId, quantity) {
    let cart = await getCartByUserId(userId);
    let item = cart.items.find(i => i.productId._id == productId);
    if (item) {
        cart.items = cart.items.filter(i => i.productId._id != productId);
    }
    await cart.save();
    return cart;
}

export const getCartByUserId = async function (userId) {
    let cart = await Cart.findOne({ userId: userId }).populate('items.productId');
    if (!cart) {
        cart = await Cart.create({ userId: userId, items: [] });
    } 
    return cart;
}

export const getCartDataByUserId = async function (userId) {
    let cart = await Cart.findOne({ userId: userId }).populate('items.productId').lean();
    if (!cart) {
        cart = await Cart.create({ userId: userId, items: [] });
    }
    return cart;
}

export const setUserCartProductQuantity = async function (userId, productId, quantity) {
    let cart = await getCartByUserId(userId);
    let item = cart.items.find(i => i.productId._id.toString() == productId);
    if (item) {
        item.quantity = quantity
        console.log("item quantity: " + item.quantity);
        if (item.quantity <= 0) {
            cart.items = cart.items.filter(i => i.productId._id != productId);
        }
    }
    await cart.save();
    return cart;
}