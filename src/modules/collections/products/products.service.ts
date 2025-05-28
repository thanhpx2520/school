import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Product } from './schemas/product.schema';
import { createFolderAndSaveFile, deleteImageFile } from 'src/helpers/util';
import { Category } from '../categories/schemas/category.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  // for clientService START
  async findAll(query: any) {
    const limit = query.limit ? parseInt(query.limit) : 10;
    const page = query.page ? parseInt(query.page) : 1;
    const keyword = query.keyword;

    let dataFilter = {};
    let dataSort = {};

    if (Array.isArray(query?.filters)) {
      query?.filters?.map((filter) => {
        if (filter == 'featured') {
          dataFilter = { ...dataFilter, is_feature: true };
        }
        if (filter == 'discount') {
          dataFilter = { ...dataFilter, discount_percent: { $ne: null } };
        }
      });
    } else {
      if (query?.filters == 'featured') {
        dataFilter = { ...dataFilter, is_feature: true };
      }
      if (query?.filters == 'discount') {
        dataFilter = { ...dataFilter, discount_percent: { $ne: null } };
      }
    }

    if (query?.priceSort == 'price_asc') {
      dataSort = { ...dataSort, price_origin: 1 };
    }

    if (query?.priceSort == 'price_desc') {
      dataSort = { ...dataSort, price_origin: -1 };
    }

    if (keyword) {
      dataFilter = { ...dataFilter, name: { $regex: keyword, $options: 'i' } };
    }

    const total = await this.productModel.countDocuments({
      is_stock: true,
      ...dataFilter,
    });
    const totalPages = Math.ceil(total / limit);

    const activeCategories = await this.categoryModel
      .find({ active: 1 }, '_id')
      .lean();

    const activeCategoryIds = activeCategories.map((c) => c._id);

    const docs = await this.productModel
      .find({
        is_stock: true,
        ...dataFilter,
        category_id: { $in: activeCategoryIds },
      })
      .sort({ createdAt: -1, ...dataSort })
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

  async findAllProductsByCategoryId(categoryId: string, query: any) {
    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;

    if (!isValidObjectId(categoryId)) {
      throw new BadRequestException(
        'Invalid categoryId: must be a valid ObjectId',
      );
    }

    let dataFilter = {};
    let dataSort = {};

    if (Array.isArray(query?.filters)) {
      query?.filters?.map((filter) => {
        if (filter == 'featured') {
          dataFilter = { ...dataFilter, is_feature: true };
        }
        if (filter == 'discount') {
          dataFilter = { ...dataFilter, discount_percent: { $ne: null } };
        }
      });
    } else {
      if (query?.filters == 'featured') {
        dataFilter = { ...dataFilter, is_feature: true };
      }
      if (query?.filters == 'discount') {
        dataFilter = { ...dataFilter, discount_percent: { $ne: null } };
      }
    }

    if (query?.priceSort == 'price_asc') {
      dataSort = { ...dataSort, price_origin: 1 };
    }

    if (query?.priceSort == 'price_desc') {
      dataSort = { ...dataSort, price_origin: -1 };
    }

    const filter: any = {
      is_stock: true,
      category_id: new Types.ObjectId(categoryId),
      ...dataFilter,
    };

    const total = await this.productModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const docs = await this.productModel
      .find(filter)
      .sort({ createdAt: -1, ...dataSort })
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

  async findOne(id: string) {
    const product1 = await this.productModel
      .findById(id)
      .populate('category_id');
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const related = await this.productModel.aggregate([
      {
        $match: {
          category_id: product.category_id,
          _id: { $ne: product._id },
        },
      },
      {
        $sample: { size: 4 },
      },
    ]);

    return {
      doc: {
        product1,
        related,
      },
    };
  }
  // for clientService END

  // for adminService START
  async getAll(query: any) {
    const limit = query.limit ? parseInt(query.limit) : 10;
    const page = query.page ? parseInt(query.page) : 1;
    const search = query.search?.trim();

    // eslint-disable-next-line prefer-const
    let filter: any = {};
    let sort: any = { createdAt: -1 }; // mặc định: sắp xếp theo ngày tạo mới nhất

    if (search) {
      const searchNumber = parseFloat(search);

      // Nếu là số: tìm theo giá sản phẩm >= search
      if (!isNaN(searchNumber)) {
        filter.price_origin = { $gte: searchNumber };
        sort = { price_origin: 1 }; // sắp xếp tăng dần theo giá
      } else {
        // Nếu là chuỗi: tìm theo tên danh mục
        const category = await this.categoryModel.findOne({
          name: { $regex: search, $options: 'i' },
        });

        if (category) {
          filter.category_id = category._id;
        } else {
          // Không tìm thấy danh mục => trả về trống
          return {
            docs: [],
            pages: {
              total: 0,
              limit,
              totalPages: 0,
              currentPage: page,
              hasNext: false,
              hasPrev: false,
              next: null,
              prev: null,
            },
          };
        }
      }
    }

    const total = await this.productModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const docs = await this.productModel
      .find(filter)
      .sort(sort)
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
    const doc = await this.productModel.findById(id).populate('category_id');

    return { doc };
  }

  async created(req: any) {
    const file = await req.file();

    const fileSaved = await createFolderAndSaveFile('products', file);
    const data = {
      image: fileSaved.filename,
      name: fileSaved.fields.name.value,
      category_id: fileSaved.fields.category_id.value,
      price_origin: fileSaved.fields.price_origin.value,
      promotion: fileSaved.fields.promotion.value,
      description: fileSaved.fields.description.value,
      discount_percent: fileSaved.fields.discount_percent.value,
      is_stock: fileSaved.fields.is_stock.value,
      is_feature: fileSaved.fields.is_feature.value,
    };

    const created = await this.productModel.create(data);

    return { created };
  }

  async edit(req: any, id: string) {
    const product = await this.productModel.findById({ _id: id });
    const file = await req.file();
    let data = {};

    if (product) {
      if (file.filename === '') {
        data = {
          name: file.fields.name.value,
          category_id: file.fields.category_id.value,
          price_origin: file.fields.price_origin.value,
          promotion: file.fields.promotion.value,
          description: file.fields.description.value,
          discount_percent: file.fields.discount_percent.value,
          is_stock: file.fields.is_stock.value,
          is_feature: file.fields.is_feature.value,
        };
      } else {
        const fileSaved = await createFolderAndSaveFile('products', file);
        await deleteImageFile('products', product?.image);
        data = {
          image: fileSaved.filename,
          name: fileSaved.fields.name.value,
          category_id: fileSaved.fields.category_id.value,
          price_origin: fileSaved.fields.price_origin.value,
          promotion: fileSaved.fields.promotion.value,
          description: fileSaved.fields.description.value,
          discount_percent: fileSaved.fields.discount_percent.value,
          is_stock: fileSaved.fields.is_stock.value,
          is_feature: fileSaved.fields.is_feature.value,
        };
      }
    }

    const edited = await this.productModel.findByIdAndUpdate(id, data);

    return { edited };
  }

  async delete(id: string, res: any) {
    const deleted = await this.productModel.findByIdAndDelete({ _id: id });

    if (deleted) {
      deleteImageFile('products', deleted?.image);
    }

    return { deleted };
  }
  // for adminService END
}
