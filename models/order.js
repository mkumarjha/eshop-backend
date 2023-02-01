const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orderItems: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required: true
    }],
    shippingAddress1: {
        type: String,
        required: true
    },
    shippingAddress2: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        required: true,
        default: 0
    }, 
    totalPrice: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dateOrdered: {
        type: Date,
        default: Date.now
    }
})

orderSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

orderSchema.set('toJSON',{
    virtuals: true,
});

exports.Order = mongoose.model('Order', orderSchema);
/**
 
    Order Example

    {
        "orderItems":[
            {
                "quantity": 3,
                "product": "61ae2dedcf6b8f662a751276"
            },
            {
                "quantity": 5,
                "product": "61ae302231aa95ead42d1dcc"
            }
        ],
        "shippingAddress1": "Flowers street, 45 ",
        "shippingAddress2": "1-B",
        "city": "Prague",
        "zip": "800023",
        "country": "Czech Reputlic",
        "phone": "+4585454545",
        "user": "61b0ca8c45fff12475d9745b"
    }
 */
