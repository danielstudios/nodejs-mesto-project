import { Router } from 'express';
import {
  getCards,
  createCard,
  deleteCard,
  dislikeCard,
  likeCard,
} from '../controllers/cards';

const router = Router();

router.get('/', getCards);

router.post('/', createCard);

router.delete('/:cardId', deleteCard);
router.delete('/:cardId/likes', dislikeCard);

router.put('/:cardId/likes', likeCard);

export default router;
