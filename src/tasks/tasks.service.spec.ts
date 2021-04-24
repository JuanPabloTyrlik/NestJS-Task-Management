import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { User } from '../auth/user.entity';
import { NotFoundException } from '@nestjs/common';

const mockUser = {
  id: 1,
  username: 'Test User',
  password: '',
  salt: '',
};

const mockTask = {
  title: 'Task title',
  description: 'Task description',
};

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

describe('TasksService', () => {
  let tasksService: TasksService;
  let taskRepository: TaskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TaskRepository,
          useFactory: mockTaskRepository,
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    taskRepository = module.get<TaskRepository>(TaskRepository);
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should get all tasks from the repository', async () => {
      (<jest.Mock>taskRepository.getTasks).mockResolvedValue('SomeValue');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const filterDto: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some String',
      };
      const result = await tasksService.getTasks(filterDto, <User>mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalledWith(
        filterDto,
        <User>mockUser,
      );
      expect(result).toEqual('SomeValue');
    });
  });

  describe('getTaskById', () => {
    it('should call taskRepository.findOne and return the task', async () => {
      (<jest.Mock>taskRepository.findOne).mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById(1, <User>mockUser);
      expect(result).toEqual(mockTask);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, user: mockUser.id },
      });
    });
    it('should throw an Error if no task was found', () => {
      (<jest.Mock>taskRepository.findOne).mockResolvedValue(null);
      expect(tasksService.getTaskById(1, <User>mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('should create a new Task', async () => {
      (<jest.Mock>taskRepository.createTask).mockResolvedValue(mockTask);
      const result = await tasksService.createTask(mockTask, <User>mockUser);
      expect(taskRepository.createTask).toHaveBeenCalledWith(
        mockTask,
        mockUser,
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTaskById', () => {
    it('should delete a task', async () => {
      (<jest.Mock>taskRepository.delete).mockResolvedValue({
        affected: 1,
      });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      expect(
        tasksService.deleteTaskById(1, <User>mockUser),
      ).resolves.toBeUndefined();
      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: 1,
        user: mockUser,
      });
    });
    it('should throw an error', async () => {
      (<jest.Mock>taskRepository.delete).mockResolvedValue({
        affected: 0,
      });
      expect(tasksService.deleteTaskById(1, <User>mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  describe('updateTaskStatusById', () => {
    it('should update a task', async () => {
      const mockTask = {
        title: 'Test title',
        description: 'Test description',
        status: TaskStatus.OPEN,
        save: jest.fn(),
      };
      tasksService.getTaskById = jest.fn().mockResolvedValue(mockTask);
      expect(tasksService.getTaskById).not.toHaveBeenCalled();
      const result = await tasksService.updateTaskStatusById(
        1,
        TaskStatus.IN_PROGRESS,
        <User>mockUser,
      );
      expect(tasksService.getTaskById).toHaveBeenCalled();
      expect(mockTask.save).toHaveBeenCalled();
      expect(result.status).toMatch(TaskStatus.IN_PROGRESS);
    });
  });
});
