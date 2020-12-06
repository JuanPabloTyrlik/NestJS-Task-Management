import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(TaskRepository)
        private taskRepository: TaskRepository,
    ) {}

    async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
        return this.taskRepository.getTasks(filterDto);
    }

    async getTaskById(id: number): Promise<Task> {
        const task: Task = await this.taskRepository.findOne(id);
        if (!task) {
            throw new NotFoundException(`Task with id: ${id} not found`);
        }
        return task;
    }
    async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
        return this.taskRepository.createTask(createTaskDto);
    }
    async updateTaskStatusById(id: number, status: TaskStatus): Promise<Task> {
        const task: Task = await this.getTaskById(id);
        task.status = status;
        await task.save();
        return task;
    }
    async deleteTaskById(id: number): Promise<void> {
        const { affected } = await this.taskRepository.delete(id);
        if (affected < 1) {
            throw new NotFoundException(`Task with id: ${id} not found`);
        }
    }
}
