import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  // for clientService START
  async findAll(query: any) {
    const docs = await this.categoryModel
      .find({ active: 1 })
      .sort({ createdAt: -1 })
      .exec();

    return {
      docs,
    };
  }

  // for clientService END

  // for adminService START
  async getAll(query: any) {
    const limit = query.limit ? parseInt(query.limit) : 10;
    const page = query.page ? parseInt(query.page) : 1;

    const total = await this.categoryModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const docs = await this.categoryModel
      .find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      docs,
      pages: {
        total,
        limit,
        totalPages,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        next: page < totalPages ? page + 1 : null,
        prev: page > 1 ? page - 1 : null,
      },
    };
  }

  async findOneById(id: string) {
    const doc = await this.categoryModel.findById(id);

    return { doc };
  }

  async created(body: any) {
    const { name, active } = body;

    const nameExited = await this.categoryModel.findOne({ name });

    if (nameExited) {
      return {
        error: 'Danh mục đã tồn tại !',
      };
    }

    const created = await this.categoryModel.create({
      name,
      active,
    });

    return { created };
  }

  async edit(body: any, id: string) {
    const { name } = body;

    const category = await this.categoryModel.findById(id);
    if (!category) {
      return { error: 'Không tìm thấy danh mục.' };
    }

    const nameExists = await this.categoryModel.findOne({
      name,
      _id: { $ne: id },
    });

    if (nameExists) {
      return { error: 'Tên danh mục đã tồn tại!' };
    }

    const edited = await this.categoryModel.findByIdAndUpdate(id, body);

    return { edited };
  }

  async delete(id: string) {
    const deleted = await this.categoryModel.findByIdAndDelete({ _id: id });

    return { deleted };
  }
  // for adminService END
}
