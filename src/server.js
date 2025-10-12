import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { dbType } from './config/database.js';

dotenv.config();

if (dbType === 'sqlite') {
  await import('./config/sqlite.js');
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Termo Backend API',
    database: dbType
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database type: ${dbType}`);
});

export default app;

