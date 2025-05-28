import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { createFolderAndSaveFile, deleteImageFile } from 'src/helpers/util';
import { Account } from './schemas/account.schema';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) {}

  // for adminService START
  async loginToAdmin(body: any) {
    const user = await this.accountModel.findOne({ email: body?.email });
    if (!user) {
      return {
        docs: { err: 'Email không tồn tại !' },
      };
    }

    if (body.password && user.password !== body.password) {
      return {
        docs: { err: 'Mật khẩu không chính xác !' },
      };
    }

    if (user.role !== 'admin') {
      return {
        docs: { err: 'Bạn không có quyền đăng nhập vào quản trị !' },
      };
    }

    return {
      docs: { user },
    };
  }

  async getAll(query: any) {
    const limit = query.limit ? parseInt(query.limit) : 10;
    const page = query.page ? parseInt(query.page) : 1;

    const total = await this.accountModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const docs = await this.accountModel
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

  async createInStudentAdd(email: string, password: string) {
    const emailExited = await this.accountModel.findOne({ email });

    if (emailExited) {
      return {
        error: 'Email đã tồn tại !',
      };
    }

    const data = {
      email,
      password,
    };
    const accountCreated = await this.accountModel.create(data);
    return accountCreated;
  }

  async editInStudentAdd(email: string, password: string, maTaiKhoan: string) {
    const emailExited = await this.accountModel.findOne({
      email,
      _id: { $ne: new Types.ObjectId(maTaiKhoan) },
    });

    if (emailExited) {
      console.log('>> Email trùng tài khoản khác');
      return { error: 'Email đã tồn tại!' };
    }

    const updated = await this.accountModel.findByIdAndUpdate(
      maTaiKhoan,
      { email, password },
      { new: true },
    );

    return { updated };
  }

  async findOneById(id: string) {
    const doc = await this.accountModel.findById(id);

    return { doc };
  }

  // async created(req: any) {
  //   const file = await req.file();

  //   const fileSaved = await createFolderAndSaveFile('', file);
  //   const data = {
  //     image: fileSaved.filename,
  //     public: fileSaved.fields.public.value,
  //   };

  //   const created = await this.sliderModel.create(data);

  //   return { created };
  // }

  async edit(body: any, id: string) {
    const { email } = body;

    const category = await this.accountModel.findById(id);
    if (!category) {
      return { error: 'Không tìm thấy tài khoản' };
    }

    const emailExists = await this.accountModel.findOne({
      email,
      _id: { $ne: id },
    });

    if (emailExists) {
      return { error: 'Email đã tồn tại!' };
    }

    const edited = await this.accountModel.findByIdAndUpdate(id, body);

    return { edited };
  }

  async delete(id: string) {
    const deleted = await this.accountModel.findByIdAndDelete({ _id: id });

    return { deleted };
  }

  async deleteByEmail(email: string) {
    const deleted = await this.accountModel.findOneAndDelete({ email });

    return { deleted };
  }

  // async delete(id: string, res: any) {
  //   const deleted = await this.sliderModel.findByIdAndDelete({ _id: id });

  //   if (deleted) {
  //     deleteImageFile('', deleted?.image);
  //   }

  //   return { deleted };
  // }
  // for adminService END
}
