import { Router } from 'express';
import multer from 'multer';
import path from 'path';

import { getCustomRepository } from 'typeorm';
import { Request } from 'express-serve-static-core';
import uploadConfig from '../config/upload';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
// import CategoriesRepository from '../repositories/CategoriesRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface Response {
  title: string;
  type: 'income' | 'outcome';
}

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  try {
    const transactionRepository = await getCustomRepository(
      TransactionsRepository,
    );

    const transactions = await transactionRepository.getTransactions();
    const balance = await transactionRepository.getBalance();

    const dados = {
      transactions,
      balance,
    };

    return response.json(dados);
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

transactionsRouter.post('/', async (request, response) => {
  try {
    const { title, value, type, category } = request.body;

    const transactionsRepository = await getCustomRepository(
      TransactionsRepository,
    );

    // verifica se tem fundos
    const bal = await transactionsRepository.getBalance();

    if (bal.total < value && type === 'outcome') {
      throw new AppError('Not enough funds!', 400);
    }

    const createTransaction = new CreateTransactionService();

    const transaction = await createTransaction.execute({
      title,
      value,
      type,
      category,
    });

    /*  const result: Response = {
      title: transaction.title,
      type: transaction.type,
    }; */

    return response.json(transaction);
  } catch (err) {
    return response.status(400).json({ message: err.message, status: 'error' });
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const deleteRepository = new DeleteTransactionService();

    const result = await deleteRepository.execute({
      id,
    });

    return response.json(result);
  } catch (err) {
    return response.status(400).json({ message: err.message, status: 'error' });
  }
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    // console.log(req.file);
    try {
      const importTransaction = new ImportTransactionsService();

      const transaction = await importTransaction.execute({
        csvFilename: path.join(uploadConfig.directory, request.file.filename),
      });

      return response.json(transaction);
    } catch (err) {
      return response.status(400).json({ error: err.message });
    }
  },
);

export default transactionsRouter;
