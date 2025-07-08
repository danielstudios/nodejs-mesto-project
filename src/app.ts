import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
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

mongoose.connect('mongodb://localhost:27017/mestodb');

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
