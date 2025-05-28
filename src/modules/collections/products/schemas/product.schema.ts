import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  category_id: Category;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  price_origin: number;

  @Prop({ default: null })
  promotion: string;

  @Prop({ default: null })
  discount_percent: number;

  @Prop({ required: true, default: true })
  is_stock: boolean;

  @Prop({ required: true, default: true })
  is_feature: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
