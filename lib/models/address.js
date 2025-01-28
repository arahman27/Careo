const mongoose = require('mongoose');

export const addressSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    }, 
    address: {
        type: String,
        required: true
    },
    apartment: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: true
    },
    province: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    postal_code: {
        type: String,
        required: true
    },
});

export const Address = mongoose.models?.Address || mongoose.model('Address', addressSchema);