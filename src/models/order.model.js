import {EntitySchema} from "typeorm";

const Order = new EntitySchema({
    name: "Order",
    tableName: "order",
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
        status: {
            type: String,
            required: true
        },
        amount: {
            type: Number
        }
    }
});

export default Order