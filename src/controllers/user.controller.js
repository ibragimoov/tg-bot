import '../models/user.model.js';
import  mongoose  from 'mongoose';
import * as yup from 'yup';

const User = mongoose.model('user');

export const phoneSchema = yup.string().matches(/^\+[0-9]{3}(\d+)\d{3}\d{2}\d{2}/g).required().max(12);