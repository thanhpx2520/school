import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Class } from './schemas/class.schema';

@Injectable()
export class ClassesService {
  constructor(@InjectModel(Class.name) private classModel: Model<Class>) {}

  // for adminService START
  // async loginToAdmin(body: any) {
  //   const user = await this.userModel.findOne({ email: body?.email });
  //   if (!user) {
  //     return {
  //       docs: { err: 'Email không tồn tại !' },
  //     };
  //   }

  //   if (body.password && user.password !== body.password) {
  //     return {
  //       docs: { err: 'Mật khẩu không chính xác !' },
  //     };
  //   }

  //   if (user.role !== 'admin') {
  //     return {
  //       docs: { err: 'Bạn không có quyền đăng nhập vào quản trị !' },
  //     };
  //   }

  //   return {
  //     docs: { user },
  //   };
  // }

  async getAll(query: any) {
    const limit = query.limit ? parseInt(query.limit) : 10;
    const page = query.page ? parseInt(query.page) : 1;

    const total = await this.classModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const docs = await this.classModel
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
    const doc = await this.classModel.findById(id);

    return { doc };
  }

  async created(body: any) {
    const { tenLop } = body;

    const emailExited = await this.classModel.findOne({ tenLop });

    if (emailExited) {
      return {
        error: 'Ten lop đã tồn tại !',
      };
    }

    const created = await this.classModel.create(body);

    return { created };
  }

  async edit(body: any, id: string) {
    const { tenLop } = body;

    const classItem = await this.classModel.findById(id);
    if (!classItem) {
      return { error: 'Không tìm thấy lớp học.' };
    }

    const nameExists = await this.classModel.findOne({
      tenLop,
      _id: { $ne: id },
    });

    if (nameExists) {
      return { error: 'Tên lớp học đã tồn tại!' };
    }

    const edited = await this.classModel.findByIdAndUpdate(id, body);

    return { edited };
  }

  async delete(id: string) {
    const deleted = await this.classModel.findByIdAndDelete({ _id: id });

    return { deleted };
  }
  // for adminService END
}
