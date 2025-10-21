import { Controller, Get, Post, Patch, Param, Body, BadRequestException, NotFoundException, Query } from '@nestjs/common';
import { UsersService } from '../../users/service/users.service';
import { TasksService } from '../../tasks/service/tasks.service';
import * as dotenv from "dotenv";
import { ObjectId } from 'mongodb';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';

dotenv.config();                  // Load environment variables
const db = 'users';               // Database route for this controller

@Controller(db)
export class TasksController {
  constructor(private readonly tasksService: TasksService, private readonly usersService: UsersService) {}

//************************** TASKS *************************************/
  // Service: Add a Task to a user
  @UseGuards(JwtAuthGuard)
  @Post(':id/tasks')
  async addTaskToUser(@Param('id') id: string, @Body() taskDto: CreateTaskDto) {
    this.ensureValidObjectId(id);

    if (!taskDto.name || !taskDto.time || !taskDto.date) {
      throw new BadRequestException('The task must have a name, date and time');
    }

    const updatedUser = await this.tasksService.addTask(id, taskDto);

    if (!updatedUser) {
      throw new NotFoundException(`No user with id found ${id}`);
    }

    console.log(`New task added to user ${id}:`, JSON.stringify(taskDto, null, 2));

    return updatedUser;
  }

  // Service: Get all Tasks from a user (with pagination & filter)
  @UseGuards(JwtAuthGuard)
  @Get(':userId/tasks')
  async getAllTasks(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
  ) {
    this.ensureValidObjectId(userId);

    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const result = await this.tasksService.getTasks(userId, pageNum, limitNum, name);

    if (!result.data || result.data.length === 0) {
      throw new NotFoundException(`No tasks found for user ${userId} with the given filter`);
    }

    return result;
  }

  // Service: Get a Task from a user by id
  @UseGuards(JwtAuthGuard)
  @Get(':userId/tasks/:taskId')
  async getTaskById(@Param('userId') userId: string, @Param('taskId') taskId: string) {
    this.ensureValidObjectId(userId);

    const user = await this.usersService.getById(userId);
    if (!user) {
      throw new NotFoundException(`No user with id found ${userId}`);
    }

    const task = user.user.tasks.find((t: any) => t.id === taskId);
    if (!task) {
      throw new NotFoundException(`No task with id found ${taskId} for user ${userId}`);
    }

    return task;
  }


  // Helper privado para validar ObjectId
  private ensureValidObjectId(id: string) {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException(`The provided id is not a valid ObjectId: ${id}`);
    }
  }
}
