import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SlidersService } from './sliders.service';

@Controller('sliders')
export class SlidersController {
  constructor(private readonly slidersService: SlidersService) {}
}
