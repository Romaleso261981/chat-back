import mongoose from 'mongoose';


MONGODB_CONNECTION='mongodb+srv://admin:leso261981@cluster0.zmmicqd.mongodb.net/our-chat5'

export const dbConnect = () => {
  mongoose.set('strictQuery', false);
  mongoose.connect(MONGODB_CONNECTION, () => console.log('Connected to DB'));
};