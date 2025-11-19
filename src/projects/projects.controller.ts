import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { ProjectForPrinter } from './dto/project-for-printer';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Get('projectsforprinter')
  getProjectsForPrinter(): Promise<ProjectForPrinter[]> {
    return this.projectsService.getProjectsForPrinter();
  }

  @Get('stats/top')
  getTopProjects() {
    return this.projectsService.getTopProjects();
  }

  @Get('stats/by-duration')
  getProjectsByDuration() {
    return this.projectsService.getProjectsByDuration();
  }

  @Get('stats/by-print-time')
  getProjectsByPrintTime() {
    return this.projectsService.getProjectsByPrintTime();
  }

  @Get('stats/most-complex')
  getMostComplexProjects() {
    return this.projectsService.getMostComplexProjects();
  }

  @Get('stats/completion-trends')
  getProjectCompletionTrends() {
    return this.projectsService.getProjectCompletionTrends();
  }

  @Post()
  create(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Project> {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    console.log(updateProjectDto);
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.projectsService.remove(id);
  }
}
