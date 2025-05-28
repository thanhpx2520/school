import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Slider } from './schemas/slider.schema';
import { createFolderAndSaveFile, deleteImageFile } from 'src/helpers/util';

@Injectable()
export class SlidersService {
  constructor(@InjectModel(Slider.name) private sliderModel: Model<Slider>) {}

  // for clientService START
  async findAll(query: any) {
    const docs = await this.sliderModel
      .find({ public: true })
      .sort({ createdAt: -1 })
      .exec();

    return {
      docs,
    };
  }
  // for clientService END

  // for adminService START
  async getAll(query: any) {
    const limit = query.limit ? parseInt(query.limit) : 10;
    const page = query.page ? parseInt(query.page) : 1;

    const total = await this.sliderModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const docs = await this.sliderModel
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
    const doc = await this.sliderModel.findById(id);

    return { doc };
  }

  async created(req: any) {
    const file = await req.file();

    const maxSlider = await this.sliderModel
      .findOne()
      .sort({ position: -1 })
      .exec();

    const nextPosition = maxSlider ? maxSlider.position + 1 : 1;

    const fileSaved = await createFolderAndSaveFile('', file);
    const data = {
      image: fileSaved.filename,
      position: nextPosition,
      public: fileSaved.fields.public.value,
    };

    const created = await this.sliderModel.create(data);

    return { created };
  }

  async edit(req: any, id: string) {
    const slider = await this.sliderModel.findById({ _id: id });
    const file = await req.file();
    let data = {};

    if (slider) {
      if (file.filename === '') {
        data = {
          public: file.fields.public.value,
        };
      } else {
        const fileSaved = await createFolderAndSaveFile('', file);
        await deleteImageFile('', slider?.image);
        data = {
          image: fileSaved.filename,
          public: fileSaved.fields.public.value,
        };
      }
    }

    const edited = await this.sliderModel.findByIdAndUpdate(id, data);

    return { edited };
  }

  async delete(id: string, res: any) {
    const deleted = await this.sliderModel.findByIdAndDelete({ _id: id });

    if (deleted) {
      deleteImageFile('', deleted?.image);
    }

    return { deleted };
  }
  // for adminService END
}
