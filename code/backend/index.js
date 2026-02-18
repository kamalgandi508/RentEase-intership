const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectionofDb = require("./config/connect.js");
const path = require("path");

const app = express();

//////dotenv config/////////////////////
console.log('Current directory:', __dirname);
console.log('Loading .env from:', path.join(__dirname, '.env'));
dotenv.config({ path: path.join(__dirname, '.env') });
console.log('MONGO_DB after dotenv:', process.env.MONGO_DB);

//////connection to DB/////////////////
connectionofDb();


const PORT = process.env.PORT || 8001;


app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:55150'],
  methods:['GET','POST','DELETE','PATCH','PUT'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use('/api/user', require('./routes/userRoutes.js'))
app.use('/api/admin', require('./routes/adminRoutes'))
app.use('/api/owner', require('./routes/ownerRoutes'))
app.use('/api/notifications', require('./routes/notificationRoutes'))
app.use('/api/payment', require('./routes/paymentRoutes'))
app.use('/api/chat', require('./routes/chatRoutes'))
app.use('/api/recent-views', require('./routes/recentViewRoutes'))



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});