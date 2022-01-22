import {EntitySchema} from "typeorm";
import UpdateDateColumn from 'typeorm'

const Order = new EntitySchema({
    name: "Order",
    tableName: "orders",
    columns: {
        chatId: {
            primary: true,
            type: Number,
            required: true
        },
        orderId: {
            type: 'number',
            required: true
        },
        status: {
            type: String,
            required: true
        },
        amount: {
            type: Number
        },
        createdAt: {
            type: Date,
            createDate: true
        },
        updatedAt: {
            type: new Date(),
            updateDate: true,
            update: true
        }
    }
});

export default Order