import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from './schemas/student.schema';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
    private readonly accountService: AccountsService,
  ) {}

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

    const total = await this.studentModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const docs = await this.studentModel
      .find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('maLop')
      .populate('maTaiKhoan')
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
    const doc = await this.studentModel
      .findById(id)
      .populate('maLop')
      .populate('maTaiKhoan');

    return { doc };
  }

  async created(body: any) {
    const { maSV, email, password, soDienThoai, hoTen, maLop, diaChi } = body;

    const maSVExited = await this.studentModel.findOne({ maSV });

    if (maSVExited) {
      return {
        error: 'Mã SV đã tồn tại !',
      };
    }

    const phoneExited = await this.studentModel.findOne({ soDienThoai });

    if (phoneExited) {
      return {
        error: 'Số điện thoại đã tồn tại !',
      };
    }

    const accountCreated = await this.accountService.createInStudentAdd(
      email,
      password,
    );

    // Nếu trả về là object có trường "error", trả về luôn
    if ('error' in accountCreated) {
      return accountCreated;
    }

    // Đến đây chắc chắn accountCreated là document MongoDB
    const data = {
      maSV,
      soDienThoai,
      hoTen,
      maLop,
      diaChi,
      maTaiKhoan: accountCreated._id, // OK
    };

    const created = await this.studentModel.create(data);
    return { created };
  }

  async edit(body: any, id: string) {
    const {
      email,
      password,
      hoTen,
      maLop,
      diaChi,
      soDienThoai,
      maSV,
      maTaiKhoan,
    } = body;

    const user = await this.studentModel.findById(id);
    if (!user) {
      return { error: 'Không tìm thấy người dùng.' };
    }

    const phoneExists = await this.studentModel.findOne({
      soDienThoai,
      _id: { $ne: id },
    });

    if (phoneExists) {
      return { error: 'Số điện thoại đã tồn tại!' };
    }

    const maSVExited = await this.studentModel.findOne({
      maSV,
      _id: { $ne: id },
    });

    if (maSVExited) {
      return { error: 'Mã SV đã tồn tại!' };
    }

    const emailExited = await this.accountService.editInStudentAdd(
      email,
      password,
      maTaiKhoan,
    );

    if (emailExited.error) {
      return { error: 'Email đã tồn tại!' };
    }

    const edited = await this.studentModel.findByIdAndUpdate(id, body);

    return { edited };
  }

  async delete(id: string) {
    const deleted = await this.studentModel
      .findByIdAndDelete({ _id: id })
      .populate('maTaiKhoan');

    if (deleted) {
      const deleteAccount = await this.accountService.deleteByEmail(
        deleted.maTaiKhoan.email,
      );
    }

    return { deleted };
  }

  // async edit(body: any, id: string) {
  //   const { phone_number } = body;

  //   const user = await this.userModel.findById(id);
  //   if (!user) {
  //     return { error: 'Không tìm thấy người dùng.' };
  //   }

  //   const phoneExists = await this.userModel.findOne({
  //     phone_number,
  //     _id: { $ne: id },
  //   });

  //   if (phoneExists) {
  //     return { error: 'Số điện thoại đã tồn tại!' };
  //   }

  //   const edited = await this.userModel.findByIdAndUpdate(id, body);

  //   return { edited };
  // }

  // async delete(id: string) {
  //   const deleted = await this.userModel.findByIdAndDelete({ _id: id });

  //   return { deleted };
  // }
  // for adminService END
}
