import { getConnection } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

import loadCSV from '../config/importCSV';

import TransactionsRepository from '../repositories/TransactionsRepository';
// import CategoriesRepository from '../repositories/CategoriesRepository';
import CreateTransactionService from './CreateTransactionService';
import CategoriesRepository from '../repositories/CategoriesRepository';
import transactionsRouter from '../routes/transactions.routes';

interface Request {
  csvFilename: string;
}

interface ReqCateg {
  id: string;
  title: string;
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

interface TipoCTO {
  type: 'income' | 'outcome';
}

class ImportTransactionsService {
  public async execute({ csvFilename }: Request): Promise<Transaction[]> {
    const data = await loadCSV(csvFilename);
    // const categMatriz: Array<Category> = [];

    async function insertTrans(item: string): Promise<Transaction> {
      const transRepo = getConnection().getCustomRepository(
        TransactionsRepository,
      );
      const categRepo = getConnection().getRepository(Category);

      const checkCategory = await categRepo.findOne({
        where: { title: item[3] },
      });

      console.log(`Verificando categoria <${item[3]}> ${checkCategory}`);

      let idCategory;

      if (!checkCategory) {
        /*   const newCategory = categoryRepository.create({
        title: category,
 */
        const newCategory = await getConnection()
          .createQueryBuilder()
          .insert()
          .into(Category)
          .values([{ title: item[3] }])
          .execute();
        //  });

        // await categoryRepository.save(newCategory);

        console.log(`Cadastrada nova categoria ${newCategory}`);
        idCategory = newCategory.raw.id;
      } else {
        idCategory = checkCategory.id;
        console.log(`Encontrada categoria ${checkCategory}`);
      }
      const newTrans = transRepo.create({
        title: item[0],
        type: item[1] === 'income' ? 'income' : 'outcome',
        value: Number(item[2]),
        category_id: idCategory,
      });

      await transRepo.save(newTrans);

      return newTrans;
    }

    const transaction: Transaction[] = [];
    // async function funcDados(dataCSV: string[]): Promise<Transaction[]> {

    let sequence = Promise.resolve();

    data.forEach(item => {
      sequence = sequence
        .then(() => insertTrans(item))
        .then(element => {
          // console.log(`Iterei com o MAP ${element}`);
          transaction.push(element);
        });

      return sequence;
    });

    console.log(await Promise.resolve(sequence));

    return transaction;

    /*  return Promise.all(dados); */
  }
}
export default ImportTransactionsService;
