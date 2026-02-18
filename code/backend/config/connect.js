const mongoose = require('mongoose');

const connectionOfDb = () => {
  mongoose
    .connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
      console.log('Warning: App will continue running, but database operations will fail');
      console.log('Please ensure MongoDB is installed and running');
      console.log('MongoDB connection string:', process.env.MONGO_DB);
    });
};

module.exports = connectionOfDb;