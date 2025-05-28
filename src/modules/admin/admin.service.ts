import { Injectable } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CategoriesService } from '../collections/categories/categories.service';
import { SlidersService } from '../collections/sliders/sliders.service';
import { CommentsService } from '../collections/comments/comments.service';
import { ProductsService } from '../collections/products/products.service';
import { UsersService } from '../collections/users/users.service';
import { StudentsService } from '../collections/students/students.service';
import { ClassesService } from '../collections/classes/classes.service';
import { AccountsService } from '../collections/accounts/accounts.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly categoryService: CategoriesService,
    private readonly sliderService: SlidersService,
    private readonly commentService: CommentsService,
    private readonly productService: ProductsService,
    private readonly userService: UsersService,
    private readonly studentService: StudentsService,
    private readonly classService: ClassesService,
    private readonly accountService: AccountsService,
  ) {}

  getLogin() {
    return { docs: {} };
  }

  logout(res: FastifyReply) {
    res.clearCookie('manager-role', { path: '/admin' });
    res.clearCookie('manager-full_name', { path: '/admin' });
    res.clearCookie('manager-email', { path: '/admin' });
    return { url: '/admin/login' };
  }

  async postLogin(body: any, res: FastifyReply) {
    const data = await this.accountService.loginToAdmin(body);

    if (data.docs.err) {
      return res.view('admin/login', data);
    }

    if (data.docs.user) {
      res.setCookie('manager-role', data.docs.user.role);
      res.setCookie('manager-email', data.docs.user.email);
      return { url: '/admin/dashboard' };
    }
  }

  getDashboard() {
    return { docs: {} };
  }

  async getAllCategories(query: any) {
    const categories = await this.categoryService.getAll(query);

    return { categories };
  }

  async getAllComments(query: any) {
    const comments = await this.commentService.getAll(query);

    return { comments, query };
  }

  async getAllProducts(query: any) {
    const products = await this.productService.getAll(query);

    return { products, query };
  }

  async getAllSliders(query: any) {
    const sliders = await this.sliderService.getAll(query);

    return { sliders };
  }

  async getAllUsers(query: any) {
    const users = await this.userService.getAll(query);

    return { users };
  }

  async getAllAccounts(query: any) {
    const accounts = await this.accountService.getAll(query);

    return { accounts };
  }

  async getAllStudents(query: any) {
    const students = await this.studentService.getAll(query);

    return { students };
  }

  getAddCategory() {
    return { category: {} };
  }

  async getAddProduct() {
    const categories = await this.categoryService.getAll('');

    return { categories };
  }

  getAddSlider() {}

  getAddUser() {
    return { user: {} };
  }

  async getAddStudent() {
    const classes = await this.classService.getAll('');

    return { student: {}, classes };
  }

  async getCategoryById(id: string) {
    const category = await this.categoryService.findOneById(id);

    return { category, categoryAlert: {} };
  }

  async getClassById(id: string) {
    const classItem = await this.classService.findOneById(id);

    return { classItem, classAlert: {} };
  }

  async getCommentById(id: string) {
    const comment = await this.commentService.findOneById(id);

    return { comment };
  }

  async getProductById(id: string) {
    const product = await this.productService.findOneById(id);
    const categories = await this.categoryService.getAll('');

    return { product, categories };
  }

  async getSliderById(id: string) {
    const slider = await this.sliderService.findOneById(id);

    return { slider };
  }

  async getUserById(id: string) {
    const user = await this.userService.findOneById(id);

    return { user, userAlert: {} };
  }

  async getAccountById(id: string) {
    const account = await this.accountService.findOneById(id);

    return { account, accountAlert: {} };
  }

  async getStudentById(id: string) {
    const student = await this.studentService.findOneById(id);
    const classes = await this.classService.getAll('');

    return { student, classes, studentAlert: {} };
  }

  async postAddCategory(body: any, res: FastifyReply) {
    const category = await this.categoryService.created(body);

    if (category.error) {
      return res.view('admin/category/add-category', { category });
    }

    if (category.created) {
      return { url: '/admin/categories' };
    }
  }

  async postAddProduct(req: FastifyRequest, res: FastifyReply) {
    const product = await this.productService.created(req);

    if (product.created) {
      return { url: '/admin/products' };
    }
  }

  async postAddSlider(req: FastifyRequest, res: FastifyReply) {
    const slider = await this.sliderService.created(req);

    if (slider.created) {
      return { url: '/admin/sliders' };
    }
  }

  async postAddUser(body: any, res: FastifyReply) {
    const user = await this.userService.created(body);

    if (user.error) {
      return res.view('admin/user/add-user', { user });
    }

    if (user.created) {
      return { url: '/admin/users' };
    }
  }

  async postAddStudent(body: any, res: FastifyReply) {
    const student = await this.studentService.created(body);

    if (student.error) {
      const classes = await this.classService.getAll('');
      return res.view('admin/student/add-student', { student, classes });
    }

    if (student.created) {
      return { url: '/admin/students' };
    }
  }

  async postEditCategory(body: any, res: FastifyReply, id: string) {
    const categoryAlert = await this.categoryService.edit(body, id);
    const category = await this.categoryService.findOneById(id);

    if (categoryAlert.error) {
      return res.view('admin/category/edit-category', {
        categoryAlert,
        category,
      });
    }

    if (categoryAlert.edited) {
      return { url: '/admin/categories' };
    }
  }

  async postEditAccount(body: any, res: FastifyReply, id: string) {
    const accountAlert = await this.accountService.edit(body, id);
    const account = await this.accountService.findOneById(id);

    if (accountAlert.error) {
      return res.view('admin/account/edit-account', {
        accountAlert,
        account,
      });
    }

    if (accountAlert.edited) {
      return { url: '/admin/accounts' };
    }
  }

  async postEditStudent(body: any, res: FastifyReply, id: string) {
    const studentAlert = await this.studentService.edit(body, id);
    const student = await this.studentService.findOneById(id);
    const classes = await this.classService.getAll('');

    if (studentAlert.error) {
      return res.view('admin/student/edit-student', {
        studentAlert,
        student,
        classes,
      });
    }

    if (studentAlert.edited) {
      return { url: '/admin/students' };
    }
  }

  async postEditClass(body: any, res: FastifyReply, id: string) {
    const classAlert = await this.classService.edit(body, id);
    const classItem = await this.classService.findOneById(id);

    if (classAlert.error) {
      return res.view('admin/class/edit-class', {
        classAlert,
        classItem,
      });
    }

    if (classAlert.edited) {
      return { url: '/admin/classes' };
    }
  }

  async postEditComment(body: any, res: FastifyReply, id: string) {
    const comment = await this.commentService.edit(body, id);

    if (comment.edited) {
      return { url: '/admin/comments' };
    }
  }

  async postEditProduct(req: FastifyRequest, res: FastifyReply, id: string) {
    const product = await this.productService.edit(req, id);

    if (product.edited) {
      return { url: '/admin/products' };
    }
  }

  async postEditSlider(req: FastifyRequest, res: FastifyReply, id: string) {
    const slider = await this.sliderService.edit(req, id);

    if (slider.edited) {
      return { url: '/admin/sliders' };
    }
  }

  async postEditUser(body: any, res: FastifyReply, id: string) {
    const userAlert = await this.userService.edit(body, id);
    const user = await this.userService.findOneById(id);

    if (userAlert.error) {
      return res.view('admin/user/edit-user', { userAlert, user });
    }

    if (userAlert.edited) {
      return { url: '/admin/users' };
    }
  }

  async postDeleteCategory(res: FastifyReply, id: string) {
    const category = await this.categoryService.delete(id);

    if (category.deleted) {
      return { url: '/admin/categories' };
    }
  }

  async postDeleteComment(res: FastifyReply, id: string) {
    const comment = await this.commentService.delete(id);

    if (comment.deleted) {
      return { url: '/admin/comments' };
    }
  }

  async postDeleteProduct(res: FastifyReply, id: string) {
    const product = await this.productService.delete(id, res);

    if (product.deleted) {
      return { url: '/admin/products' };
    }
  }

  async postDeleteSlider(res: FastifyReply, id: string) {
    const sliders = await this.sliderService.delete(id, res);

    if (sliders.deleted) {
      return { url: '/admin/sliders' };
    }
  }

  async postDeleteUser(res: FastifyReply, id: string) {
    const user = await this.userService.delete(id);

    if (user.deleted) {
      return { url: '/admin/users' };
    }
  }

  getAddClass() {
    return { classItem: {} };
  }

  async getAllClasses(query: any) {
    const classes = await this.classService.getAll(query);

    return { classes };
  }

  async postAddClass(body: any, res: FastifyReply) {
    const classItem = await this.classService.created(body);

    if (classItem.error) {
      return res.view('admin/class/add-class', { classItem });
    }

    if (classItem.created) {
      return { url: '/admin/classes' };
    }
  }

  async postDeleteClass(res: FastifyReply, id: string) {
    const category = await this.classService.delete(id);

    if (category.deleted) {
      return { url: '/admin/classes' };
    }
  }

  async postDeleteAccount(res: FastifyReply, id: string) {
    const category = await this.accountService.delete(id);

    if (category.deleted) {
      return { url: '/admin/accounts' };
    }
  }

  async postDeleteStudent(res: FastifyReply, id: string) {
    const category = await this.studentService.delete(id);

    if (category.deleted) {
      return { url: '/admin/students' };
    }
  }
}
