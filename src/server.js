import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import routes from './routes/index.js';
import './config/database.js';
import socketManager from './socket/socket.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ message: 'Termo Backend API' });
});

socketManager.initialize(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

