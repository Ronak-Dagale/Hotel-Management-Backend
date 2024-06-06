// const express = require("express");
// const { Server } = require("socket.io");
// const { createServer } = require("http");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");

// // Initialize dotenv to load environment variables
// dotenv.config();

// const port = process.env.PORT || 5000;
// const app = express();
// const server = createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: process.env.CLIENT_URL || "http://localhost:3000",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // Middleware
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "http://localhost:3000",
//     methods: ["GET", "POST"],
//     credentials: true,
//   })
// );
// app.use(express.json());
// app.use(cookieParser());

// // Error handling middleware for JSON parsing
// app.use((err, req, res, next) => {
//   if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
//     console.error('Bad JSON');
//     return res.status(400).json({ error: 'Invalid JSON' });
//   }
//   next();
// });

// // Connect to MongoDB
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Hotel';
// mongoose.connect(MONGODB_URI)
//   .then(() => console.log('MongoDB connection established successfully'))
//   .catch((err) => console.error('MongoDB connection error:', err));

// // Import and use routes
// const createUserRouter = require('./Routes/CreateUser');
// const foodCategoryRouter = require('./Routes/FoodCategory');

// app.use('/api', createUserRouter);
// app.use('/api/foodcategory', foodCategoryRouter);
// app.use('/api/fooditems', require('./Routes/FoodItems'));
// app.use('/api/tables', require('./Routes/Tables'));
// // Root route
// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// // Socket.IO
// io.on('connection', (socket) => {
//   console.log(`Socket ${socket.id} connected`);

//   // Handle Socket.IO events
//   socket.on('sendMessage', (message) => {
//     console.log(message);
//   });

//   socket.on('disconnect', () => {
//     console.log(`Socket ${socket.id} disconnected`);
//   });
// });

// // Start server
// server.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

const express = require('express')
const { Server } = require('socket.io')
const { createServer } = require('http')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const port = process.env.PORT
const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    //origin: process.env.CLIENT_URL || 'http://localhost:3000',
     origins: "*:*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
})

app.use(
  cors({
    // origin: process.env.CLIENT_URL || 'http://localhost:3000',
     origins: "*:*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON')
    return res.status(400).json({ error: 'Invalid JSON' })
  }
  next()
})

const MONGODB_URI = 'mongodb://localhost:27017/Hotel'
// process.env.MONGODB_URI
//  ||
// 'mongodb+srv://ronakhotel:hotel%40123@atlascluster.lcfwosy.mongodb.net/Hotel?retryWrites=true&w=majority&appName=AtlasCluster'
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB connection established successfully'))
  .catch((err) => console.error('MongoDB connection error:', err))

const createUserRouter = require('./Routes/CreateUser')
const foodCategoryRouter = require('./Routes/FoodCategory')
const tablesRouter = require('./Routes/Tables')(io)
const historyRouter = require('./Routes/History')

app.use('/api', createUserRouter)
app.use('/api/foodcategory', foodCategoryRouter)
app.use('/api/fooditems', require('./Routes/FoodItems'))
app.use('/api/tables', tablesRouter)
app.use('/api/history', historyRouter)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

io.on('connection', (socket) => {
  //console.log(`Socket  connected`)
  // console.log(socket)
  socket.on('sendMessage', (message) => {
    // console.log(message)
  })

  socket.on('disconnect', () => {
    // console.log(`Socket ${socket.id} disconnected`)
  })
})

server.listen(port, () => {
  //  console.log(`Server is running on port ${port}`)
})
