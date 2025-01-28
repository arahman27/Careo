// Order model

import mongoose from 'mongoose';
import { Address, addressSchema } from './address.js';

const Schema = mongoose.Schema;

let orderSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        productId: {
            type: Number,
            ref: 'Products',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        }
    }],
    shipping_address: {
        type: addressSchema,
        required: true
    },
    billing_address: {
        type: addressSchema,
        required: false
    },
    order_date: {
        type: Date,
        default: Date.now
    },
    payment_method: {
        type: String,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "processing"
    }
});

export const Order = mongoose.models?.Order || mongoose.model('Order', orderSchema, 'Orders');

// Accepts an order id
export const getOrderById = async function(id) {
  try {
    const order = await Order.findById(id).lean();
    return order;
  } catch(err) {
    throw new Error("Could not find order ID.");
  }
}

// Accepts a user id
export const getOrdersByUserId = async function(userId) {
    try {
        const orders = await Order.find({user_id: userId})
            .populate('items.productId')
            .populate('shipping_address')
            .populate('billing_address')
            .lean();
        return orders;
    } catch(err) {
        throw new Error("Could not find orders for user.");
    }
}

// Accepts an order JSON object
export const createOrder = async function(order) {
  try {
    order.shipping_address = new Address(order.shipping_address);
    order.billing_address = new Address(order.billing_address);
    const newOrder = await Order.create(order);
    return newOrder;
  } catch(err) {
    console.log(err);
    throw new Error("Could not create order.");
  }
}