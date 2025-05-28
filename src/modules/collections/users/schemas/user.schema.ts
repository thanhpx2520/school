import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true })
  full_name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phone_number: string;

  @Prop()
  address: string;

  @Prop({ required: true, enum: [0, 1], type: Number, default: 1 })
  active: number;

  @Prop({ required: true, enum: ['admin', 'member'], default: 'member' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
