import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from './schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  // for clientService START
  async create(userId: string, productId: string, data: string) {
    const comment = await this.commentModel.create({
      user_id: userId,
      product_id: productId,
      content: data,
    });
    return comment;
  }

  async findByProductId(id: string, query: any) {
    const limit = query.limit ? parseInt(query.limit) : 5;
    const page = query.page ? parseInt(query.page) : 1;

    const total = await this.commentModel.countDocuments({ product_id: id });
    const totalPages = Math.ceil(total / limit);

    const docs = await this.commentModel
      .find({ product_id: id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user_id')
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
  // for clientService END

  async getAll(query: any) {
    const limit = query.limit ? parseInt(query.limit) : 10;
    const page = query.page ? parseInt(query.page) : 1;
    const keyword = query.search?.trim(); // Lấy từ khóa tìm kiếm

    // Khởi tạo bộ lọc
    const filter: any = {};

    // Nếu có từ khóa, lọc theo content
    if (keyword) {
      filter.content = { $regex: keyword, $options: 'i' }; // không phân biệt hoa thường
    }

    const total = await this.commentModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const docs = await this.commentModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('product_id')
      .populate('user_id')
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
    const doc = await this.commentModel
      .findById(id)
      .populate('product_id')
      .populate('user_id');

    return { doc };
  }

  async edit(body: any, id: string) {
    const { content } = body;

    const edited = await this.commentModel.findByIdAndUpdate(id, { content });

    return { edited };
  }

  async delete(id: string) {
    const deleted = await this.commentModel.findByIdAndDelete({ _id: id });

    return { deleted };
  }
  // for adminService END
}
