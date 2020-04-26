import { getRepository, getCustomRepository, getConnection } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

import loadCSV from '../config/importCSV';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  csvFilename: string;
}

interface RequestItem {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

interface Trans {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category_id: string;
}

class ImportTransactionsService {
  public async execute({ csvFilename }: Request): Promise<Transaction[]> {
    // const categoryRepository = getCustomRepository(CategoriesRepository);

    const transaction: Promise<Transaction>[] = [];
    // const itens: Array<RequestItem> = [];

    const data = await loadCSV(csvFilename);

    async function transFunc(dado: RequestItem): Promise<Transaction> {
      const transactionService = new CreateTransactionService();
      const result = transactionService.execute(dado);

      return result;
    }

    Promise.all(
      data.map(item => {
        const obj: RequestItem = {
          title: item[0],
          type: item[1] === 'income' ? 'income' : 'outcome',
          value: Number(item[2]),
          category: item[3],
        };

        const res = transFunc(obj);

        transaction.push(res);
      }),
    );

    return Promise.all(transaction);
  }
}

export default ImportTransactionsService;
