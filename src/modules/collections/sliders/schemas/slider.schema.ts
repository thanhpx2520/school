import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SliderDocument = HydratedDocument<Slider>;

@Schema({ timestamps: true, collection: 'sliders' })
export class Slider {
  @Prop({ required: true })
  image: string;

  @Prop({ required: true, type: Number })
  position: number;

  @Prop({ required: true, default: true })
  public: boolean;
}

export const SliderSchema = SchemaFactory.createForClass(Slider);
