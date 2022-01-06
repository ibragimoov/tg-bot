import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    chatId: {
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
});

mongoose.model('user', UserSchema);