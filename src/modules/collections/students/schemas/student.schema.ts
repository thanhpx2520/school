import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Class } from '../../classes/schemas/class.schema';
import { Account } from '../../accounts/schemas/account.schema';

export type StudentDocument = HydratedDocument<Student>;

@Schema({ timestamps: true, collection: 'students' })
export class Student {
  @Prop({ required: true })
  maSV: string;

  @Prop({ required: true })
  hoTen: string;

  @Prop({ required: true })
  soDienThoai: string;

  @Prop({ required: true })
  diaChi: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Class' })
  maLop: Class;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
  maTaiKhoan: Account;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
