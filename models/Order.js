const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const orderDetailSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, require: true, min: 0 },
    price: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, min: 0, max: 75, default: 0 },
});

// Virtual with Populate
orderDetailSchema.virtual('product', {
    ref: 'Product',
    localField: 'productId',
    foreignField: '_id',
    justOne: true,
});

orderDetailSchema.set('toObject', { virtuals: true });

orderDetailSchema.set('toJSON', { virtuals: true });

// ------------------------------------------------------------------------------------------------

const orderSchema = new Schema({
    description: { type: String },

    createdDate: {
        type: Date,
        default: Date.now,
    },

    shippedDate: {
        type: Date,
        validate: {
            validator: function (value) {
                if (!value) return true;

                if (value < this.createdDate) {
                    return false;
                }
                return true;
            },
            message: `Shipped date: {VALUE} is invalid!`,
        },
    },

    emailOrder: {
        type: String,
        validate: {
            validator: function (value) {
                const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
                return emailRegex.test(value);
            },
            message: `{VALUE} is not a valid email!`,
        },
        required: [true, 'email is required'],
    },

    phoneNumberOrder: {
        type: String,
        validate: {
            validator: function (value) {
                const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
                return phoneRegex.test(value);
            },
            message: `{VALUE} is not a valid phone!`,
        },
    },

    paymentType: {
        type: String,
        required: true,
        default: 'CASH',
        validate: {
            validator: (value) => {
                if (['CASH', 'CREDIT CARD'].includes(value.toUpperCase())) {
                    return true;
                }
                return false;
            },
            message: `Payment type: {VALUE} is invalid!`,
        },
    },

    status: {
        type: String,
        required: true,
        default: 'WAITING',
        validate: {
            validator: (value) => {
                if (['WAITING', 'COMPLETED', 'CANCELED'].includes(value)) {
                    return true;
                }
                return false;
            },
            message: `Status: {VALUE} is invalid!`,
        },
    },

    shippingAddressId: { type: Schema.Types.ObjectId, ref: 'ShippingAddress', required: false },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: false },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },

    orderDetails: [orderDetailSchema],
}
    , {
        versionKey: false,
        timestamps: true
    }
);

orderSchema.virtual('customer', {
    ref: 'Customer',
    localField: 'customerId',
    foreignField: '_id',
    justOne: true,
});

orderSchema.virtual('shippingAddress', {
    ref: 'ShippingAddress',
    localField: 'shippingAddressId',
    foreignField: '_id',
    justOne: true,
});

orderSchema.virtual('employee', {
    ref: 'Employee',
    localField: 'employeeId',
    foreignField: '_id',
    justOne: true,
});

orderSchema.set('toObject', { virtuals: true });
orderSchema.set('toJSON', { virtuals: true });

const Order = model('Order', orderSchema);
module.exports = Order;
