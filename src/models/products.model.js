// import mongoose from 'mongoose';
// const Schema = mongoose.Schema;

// const ProductSchema = new Schema({
//     chatId: {
//         type: Number,
//         required: true
//     },
//     orderId: {
//         type: Number,
//         required: true
//     },
//     nameProduct: {
//         type: String,
//         required: true
//     },
//     value: {
//         type: String,
//         required: true
//     }
// });

// mongoose.model('product', ProductSchema);

import {EntitySchema} from "typeorm";

const Product = new EntitySchema({
    name: "Product",
    tableName: "product",
    columns: {
        chatId: {
            primary: true,
            type: Number,
            required: true
        },
        orderId: {
            type: Number,
            required: true
        },
        nameProduct: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        }
    }
});

export default Product