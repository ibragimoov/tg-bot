import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const OrderSchema = new Schema ({
    chatId: {
        type: Number,
        required: true
    },
    orderId: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    amount: {
        type: Number
    }},
    {
        timestamps: true,
    }
)

mongoose.model('order', OrderSchema)