import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // for clientService START
  async login(body: any) {
    const user = await this.userModel.findOne({ email: body.email });

    if (user && user?.password === body.password) {
      return {
        data: {
          user,
        },
      };
    }

    return {
      data: {
        err: 'Sai tai khoan hoac mat khau',
      },
    };
  }

  async register(body: any) {
    const userEmail = await this.userModel.findOne({ email: body.email });

    if (userEmail) {
      return {
        data: {
          err: 'Email đã tồn tại',
        },
      };
    }

    const userPhone = await this.userModel.findOne({
      phone_number: body.phone_number,
    });

    if (userPhone) {
      return {
        data: {
          err: 'Số điện thoại đã tồn tại',
        },
      };
    }

    const createdUser = await this.userModel.create({
      full_name: body.full_name,
      email: body.email,
      password: body.password,
      phone_number: body.phone_number,
      address: '',
    });

    return {
      data: {
        createdUser,
      },
    };
  }
  // for clientService END

  // for adminService START
  async loginToAdmin(body: any) {
    const user = await this.userModel.findOne({ email: body?.email });
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

    const total = await this.userModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const docs = await this.userModel
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
    const doc = await this.userModel.findById(id);

    return { doc };
  }

  async created(body: any) {
    const { email, phone_number } = body;

    const emailExited = await this.userModel.findOne({ email });

    if (emailExited) {
      return {
        error: 'Email đã tồn tại !',
      };
    }

    const phoneExited = await this.userModel.findOne({ phone_number });

    if (phoneExited) {
      return {
        error: 'Số điện thoại đã tồn tại !',
      };
    }

    const created = await this.userModel.create(body);

    return { created };
  }

  async edit(body: any, id: string) {
    const { phone_number } = body;

    const user = await this.userModel.findById(id);
    if (!user) {
      return { error: 'Không tìm thấy người dùng.' };
    }

    const phoneExists = await this.userModel.findOne({
      phone_number,
      _id: { $ne: id },
    });

    if (phoneExists) {
      return { error: 'Số điện thoại đã tồn tại!' };
    }

    const edited = await this.userModel.findByIdAndUpdate(id, body);

    return { edited };
  }

  async delete(id: string) {
    const deleted = await this.userModel.findByIdAndDelete({ _id: id });

    return { deleted };
  }
  // for adminService END
}
