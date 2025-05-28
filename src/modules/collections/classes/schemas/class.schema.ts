import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ClassDocument = HydratedDocument<Class>;

@Schema({ timestamps: true, collection: 'classes' })
export class Class {
  @Prop({ required: true })
  tenLop: string;
}

export const ClassSchema = SchemaFactory.createForClass(Class);
