import { getRepository, DeleteResult } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<DeleteResult> {
    const deleteRepository = getRepository(Transaction);

    const result = await deleteRepository.delete(id);

    return result;
  }
}

export default DeleteTransactionService;
