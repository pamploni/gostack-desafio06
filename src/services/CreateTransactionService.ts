import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

// import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getRepository(Transaction);

    // pegar ou cadastrar a categoria
    const categoryRepository = getRepository(Category);

    const checkCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    // console.log(checkCategory);

    let idCategory;

    if (!checkCategory) {
      const newCategory = categoryRepository.create({
        title: category,

        /*   const newCategory = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Category)
        .values([{ title: category }])
        .execute(); */
      });

      await categoryRepository.save(newCategory);

      // console.log(newCategory);
      idCategory = newCategory.id;
    } else {
      idCategory = checkCategory.id;
    }

    const newTransaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: idCategory,
    });

    await transactionRepository.save(newTransaction);

    // console.log(result);

    return Promise.resolve(newTransaction);
  }
}

export default CreateTransactionService;
