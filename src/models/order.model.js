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
        createAt: {
            type: Date,
            update: true,
            updateDate: true,
            UpdateDateColumn: true
        },
        updatedAt: {
            type: Date,
            update: true
        }
    }
});

export default Order