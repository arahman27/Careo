import mongoose from 'mongoose';

export const db = mongoose.connection;

// disconnects the mongodb connection
export const disconnect = () => mongoose.connection.close();

// Creates the mongodb connection
const connectDB = async function(req, res, next) {
  if (mongoose.connections[0].readyState) {
    return next();
  }

  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB Server");
  } catch (err) {
    console.error("MONGODB ERROR: " + err);
  }

  mongoose.connection.on('error', (err) => {
    console.error("MONGODB ERROR: " + err);
  });

  next();
}

export default connectDB;