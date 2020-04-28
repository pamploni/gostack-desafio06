import { getRepository, getConnection } from 'typeorm';
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
    // pegar ou cadastrar a categoria
    // const categoryRepository = getRepository(Category);
    const categRepo = getConnection().getRepository(Category);
    const checkCategory = await categRepo.findOne({
      where: { title: category },
    });

    let category_id;

    if (!checkCategory) {
      /*   const newCategory = categoryRepository.create({
      title: category,
*/
      const newCategory = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Category)
        .values([{ title: category }])
        .execute()
        .then(element => {
          console.log(`Cadastrada nova categoria ${element.raw[0].id}`);
          console.log(element);
          category_id = element.raw[0].id;
        });
      //  });

      // await categoryRepository.save(newCategory);
    } else {
      category_id = checkCategory.id;
      console.log(`Encontrada categoria ${checkCategory}`);
    }

    const transactionRepository = getConnection().getRepository(Transaction);

    const newTransaction = transactionRepository.create({
      title,
      type,
      value,
      category_id,
    });

    await transactionRepository.save(newTransaction);

    console.log(`executado o service do registro ${title}`);

    return Promise.resolve(newTransaction);
  }
}

export default CreateTransactionService;
