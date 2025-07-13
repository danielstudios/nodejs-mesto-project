import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import usersRouter from './routes/users';
import cardsRouter from './routes/cards';
import limiter from './middlewares/rateLimiter';
import errorBoundary from './middlewares/errorBoundary';
import auth from './middlewares/auth';
import { requestLogger, errorLogger } from './middlewares/logger';
import { createUser, login } from './controllers/users';
import { NOT_FOUND_ERROR_CODE } from './constants';

const { PORT = 3000 } = process.env;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(limiter);
app.use(requestLogger);
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
}));
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).send();
  }
  next();
});

mongoose.connect('mongodb://localhost:27017/mestodb');

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
app.post('/signin', login);
app.post('/signup', createUser);

app.use(auth);

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);
app.use('*', (req: Request, res: Response) => {
  res.status(NOT_FOUND_ERROR_CODE).send({ message: 'Запрашиваемый ресурс не найден' });
});

app.use(errorLogger);

app.use(errorBoundary);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
