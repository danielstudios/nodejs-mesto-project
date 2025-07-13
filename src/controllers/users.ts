import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  CREATED_SUCCESS_CODE,
  CONFLICT_ERROR_CODE,
  INCORRECT_DATA_ERROR_CODE,
  NOT_FOUND_ERROR_CODE,
  FORBIDDEN_ERROR_CODE,
  UNAUTHORIZED_ERROR_CODE,
} from '../constants';
import User from '../models/user';
import { ServerError } from '../errors';
import { UserRequest } from '../middlewares/auth';

export const getUsers = (req: Request, res: Response, next: NextFunction) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

export const getUserById = (req: Request, res: Response, next: NextFunction) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new ServerError(NOT_FOUND_ERROR_CODE, 'Пользователь по указанному _id не найден');
      }

      res.send(user);
    })
    .catch(next);
};

export const createUser = (req: Request, res: Response, next: NextFunction) => {
  const {
    email, password, name, about, avatar,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
      about,
      avatar,
    }))
    .then((user) => res.status(CREATED_SUCCESS_CODE).send({ data: user }))
    .catch((err) => {
      if (err?.name === 'ValidationError') {
        res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Переданы некорректные данные при создании пользователя' });
      } else if (err?.code === 11000) {
        res.status(CONFLICT_ERROR_CODE).send({ message: 'Пользователь с такой почтой уже существует' });
      } else {
        next(err);
      }
    });
};

export const updateUserProfile = (req: UserRequest, res: Response, next: NextFunction) => {
  const { name, about } = req.body;

  User.findById(req.user?._id)
    .then((user) => {
      if (!user) {
        throw new ServerError(NOT_FOUND_ERROR_CODE, 'Пользователь с указанным _id не найден');
      } else if (user._id.toString() !== req.user?._id) {
        throw new ServerError(FORBIDDEN_ERROR_CODE, 'Доступ к запрашиваему ресурсу ограничен');
      }

        User.findOneAndUpdate(
          { _id: user._id },
          { name, about },
          { new: true, runValidators: true }
        )
          .then((updatedUser) => {
            if (!updatedUser) {
              return res.status(404).send({ message: 'Пользователь не найден' });
            }
            res.send(updatedUser);
          })
    })
    .catch((err) => {
      if (err?.name === 'ValidationError') {
        res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Переданы некорректные данные при обновлении профиля' });
      } else {
        next(err);
      }
    });
};

export const updateUserAvatar = (req: UserRequest, res: Response, next: NextFunction) => {
  User.findById(req.user?._id)
    .then((user) => {
      if (!user) {
        throw new ServerError(NOT_FOUND_ERROR_CODE, 'Пользователь с указанным _id не найден');
      } else if (user._id !== req.user?._id) {
        throw new ServerError(FORBIDDEN_ERROR_CODE, 'Доступ к запрашиваему ресурсу ограничен');
      }

      User.updateOne(
        { _id: user._id },
        { avatar: req.body.avatar },
        { new: true, runValidators: true },
      )
        .then((updatedUser) => res.send(updatedUser));
    })
    .catch((err) => {
      if (err?.name === 'ValidationError') {
        res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Переданы некорректные данные при обновлении аватара' });
      } else {
        next(err);
      }
    });
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new ServerError(UNAUTHORIZED_ERROR_CODE, 'Неправильные почта или пароль');
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new ServerError(UNAUTHORIZED_ERROR_CODE, 'Неправильные почта или пароль');
          }

          const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
          res
            .cookie('token', token, {
              maxAge: 3600000 * 24 * 7,
              httpOnly: true,
            })
            .send({ token })
        });
    })
    .catch(next);
};

export const getUserInfo = (req: UserRequest, res: Response, next: NextFunction) => {
  User.findById(req.user?._id)
    .then((user) => {
      if (!user) {
        throw new ServerError(NOT_FOUND_ERROR_CODE, 'Пользователь с таким id не найден');
      }

      res.send(user);
    })
    .catch(next);
};
