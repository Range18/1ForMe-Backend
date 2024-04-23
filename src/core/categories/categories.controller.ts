import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CategoriesService } from '#src/core/categories/categories.service';
import { Category } from '#src/core/categories/entity/categories.entity';
import { UpdateCategoryDto } from '#src/core/categories/dto/update-category.dto';
import { CreateCategoryDto } from '#src/core/categories/dto/create-category.dto';

@ApiTags('Trainer Categories')
@Controller('api/users/trainers/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiCreatedResponse({ type: Category })
  @Post()
  async create(@Body() body: CreateCategoryDto) {
    return await this.categoriesService.save(body);
  }

  @ApiOkResponse({ type: [Category] })
  @Get()
  async getAll() {
    return await this.categoriesService.find({});
  }

  @ApiOkResponse({ type: Category })
  @Get(':id')
  async get(@Param('id') id: number) {
    return await this.categoriesService.findOne({ where: { id } });
  }

  // TODO PERMS
  @ApiOkResponse({ type: Category })
  @ApiBody({ type: UpdateCategoryDto })
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoriesService.updateOne(
      { where: { id } },
      updateCategoryDto,
    );
  }
}
