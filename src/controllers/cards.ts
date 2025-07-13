import { Request, Response, NextFunction } from 'express';
import Card from '../models/card';
import { UserRequest } from '../middlewares/auth';
import { ServerError } from '../errors';
import {
  CREATED_SUCCESS_CODE,
  FORBIDDEN_ERROR_CODE,
  INCORRECT_DATA_ERROR_CODE,
  NOT_FOUND_ERROR_CODE,
} from '../constants';

export const getCards = (req: Request, res: Response, next: NextFunction) => {
  Card.find({})
    .then((card) => res.send(card))
    .catch(next);
};

export const createCard = (req: UserRequest, res: Response, next: NextFunction) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user?._id })
    .then((card) => res.status(CREATED_SUCCESS_CODE).send(card))
    .catch((err) => {
      if (err?.name === 'ValidationError') {
        res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Переданы некорректные данные при создании карточки' });
      } else {
        next(err);
      }
    });
};

export const deleteCard = (req: UserRequest, res: Response, next: NextFunction) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new ServerError(NOT_FOUND_ERROR_CODE, 'Карточка с указанным _id не найдена');
      } else if (card.owner.toString() !== req.user?._id) {
        throw new ServerError(FORBIDDEN_ERROR_CODE, 'Доступ к запрашиваему ресурсу ограничен');
      } else {
        Card.deleteOne({ _id: req.params.cardId });
      }

      res.send(card);
    })
    .catch(next);
};

export const dislikeCard = (req: UserRequest, res: Response, next: NextFunction) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user?._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new ServerError(NOT_FOUND_ERROR_CODE, 'Передан несуществующий _id карточки');
      }

      res.send(card);
    })
    .catch((err) => {
      if (err?.name === 'ValidationError') {
        res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Переданы некорректные данные для постановки/снятии лайка' });
      } else {
        next(err);
      }
    });
};

export const likeCard = (req: UserRequest, res: Response, next: NextFunction) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user?._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new ServerError(NOT_FOUND_ERROR_CODE, 'Передан несуществующий _id карточки');
      }

      res.send(card);
    })
    .catch((err) => {
      if (err?.name === 'ValidationError') {
        res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Переданы некорректные данные для постановки/снятии лайка' });
      } else {
        next(err);
      }
    });
};
