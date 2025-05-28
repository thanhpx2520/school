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
import { AccountsService } from './accounts.service';

@Controller('sliders')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}
}
