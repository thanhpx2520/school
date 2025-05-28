import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CategoriesService } from '../collections/categories/categories.service';
import { SlidersService } from '../collections/sliders/sliders.service';
import { ProductsService } from '../collections/products/products.service';
import { CommentsService } from '../collections/comments/comments.service';
import { UsersService } from '../collections/users/users.service';
import { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class ClientService {
  constructor(
    private readonly categoryService: CategoriesService,
    private readonly sliderService: SlidersService,
    private readonly commentService: CommentsService,
    private readonly productService: ProductsService,
    private readonly userService: UsersService,
  ) {}

  async getHome(query: any) {
    const categories = await this.categoryService.findAll('');
    const sliders = await this.sliderService.findAll('');
    const products = await this.productService.findAll(query);
    const data = { categories, sliders, products, query };

    return { result: data };
  }

  async postLogin(body: any, res: FastifyReply) {
    const user = await this.userService.login(body);

    const categories = await this.categoryService.findAll('');

    const data = {
      categories,
      err: 'Tài khoản hoặc mật khẩu không chính xác !',
    };

    if (user?.data?.user) {
      res.setCookie('guest-full_name', user?.data?.user.full_name);
      res.setCookie('guest-email', user?.data?.user.email);
      res.setCookie('guest-id', user?.data?.user._id.toString());
      return { url: '/' };
    }

    return res.view('client/login', { result: data });
  }

  async postRegister(body: any, res: FastifyReply) {
    const user = await this.userService.register(body);

    const categories = await this.categoryService.findAll('');

    const data = {
      categories,
      err: user?.data?.err,
    };

    if (user?.data?.err) {
      return res.view('client/register', { result: data });
    }

    return { url: '/login' };
  }

  logout(res: FastifyReply) {
    res.clearCookie('guest-full_name');
    res.clearCookie('guest-email');
    res.clearCookie('guest-id');
    return { url: '/' };
  }

  async getProductsByCategoryId(catId: string, query: any) {
    const categories = await this.categoryService.findAll('');
    const sliders = await this.sliderService.findAll('');
    const products = await this.productService.findAllProductsByCategoryId(
      catId,
      query,
    );
    const data = {
      categories,
      sliders,
      products,
      query,
      catIdCurrent: catId,
    };

    return { result: data };
  }

  async getProductDetailById(id: string, query: any) {
    const categories = await this.categoryService.findAll('');
    const comments = await this.commentService.findByProductId(id, query);

    const doc = await this.productService.findOne(id);

    const data = {
      categories,
      comments,
      doc,
      query,
    };

    return { result: data };
  }

  async getProductsBySearch(query: any) {
    const categories = await this.categoryService.findAll('');
    const sliders = await this.sliderService.findAll('');
    const products = await this.productService.findAll(query);

    const data = {
      categories,
      sliders,
      products,
      query,
    };

    return { result: data };
  }

  async postCommentByProductId(id: string, body: any, req: FastifyRequest) {
    const userId = req.cookies['guest-id'];
    if (!userId) {
      throw new UnauthorizedException('Bạn cần đăng nhập để bình luận.');
    }

    const product = await this.productService.findOne(id);
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    const createdComment = await this.commentService.create(
      userId,
      id,
      body.content,
    );

    if (createdComment) {
      return { url: `/prd_id/${id}` };
    }
  }
}
