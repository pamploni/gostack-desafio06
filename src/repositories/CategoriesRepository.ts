import { EntityRepository, Repository } from 'typeorm';

import Category from '../models/Category';

@EntityRepository(Category)
class CategoriesRepository extends Repository<Category> {
  public async getAll(): Promise<Category[]> {
    const findCategories = await this.find();
    // console.log(findTransactions);

    return findCategories;
  }
}

export default CategoriesRepository;
