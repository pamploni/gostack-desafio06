import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const findTransactions = await this.find();
    // console.log(findTransactions);

    const totalIncome = findTransactions
      .filter(fil => fil.type === 'income')
      .reduce((total, trans) => {
        return total + trans.value;
      }, 0);

    const totalOutcome = findTransactions
      .filter(fil => fil.type === 'outcome')
      .reduce((total, trans) => {
        return total + trans.value;
      }, 0);

    const balance = {
      income: totalIncome,
      outcome: totalOutcome,
      total: totalIncome - totalOutcome,
    };

    return balance;
  }

  public async getTransactions(): Promise<Transaction[]> {
    const findTransactions = await this.find({ relations: ['category'] });

    return findTransactions;
  }
}

export default TransactionsRepository;
