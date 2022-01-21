import {EntitySchema} from "typeorm";

const Users = new EntitySchema({
    name: "Users",
    tableName: "users",
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

export default Users