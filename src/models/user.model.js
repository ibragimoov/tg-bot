import {EntitySchema} from "typeorm";

const Product = new EntitySchema({
    name: "User",
    tableName: "user",
    columns: {
        chatId: {
            primary: true,
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
            required: true
        },
    }
});

export default User