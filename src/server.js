const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const ticketRoutes = require('./routes/tickets');
const inventoryRoutes = require('./routes/inventory');
const repositoryRoutes = require('./routes/repository');
const documentRoutes = require('./routes/documents');
const credentialRoutes = require('./routes/credentials');
const messageRoutes = require('./routes/messages');
const { initSocket } = require('./socket');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO
initSocket(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/repository', repositoryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/messages', messageRoutes);

// Sync database
sequelize.sync({ force: false }).then(() => {
  console.log('Database connected and synced');
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database connection failed:', err);
});