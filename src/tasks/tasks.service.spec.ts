import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { User } from '../auth/user.entity';

const mockUser = {
    id: 1,
    username: 'Test User',
    password: '',
    salt: '',
};

const mockTaskRepository = () => ({
    getTasks: jest.fn(),
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

        tasksService = await module.get<TasksService>(TasksService);
        taskRepository = await module.get<TaskRepository>(TaskRepository);
    });

    describe('getTasks', () => {
        it('should get all tasks from the repository', async () => {
            (<jest.Mock>taskRepository.getTasks).mockResolvedValue('SomeValue');

            expect(taskRepository.getTasks).not.toHaveBeenCalled();
            const filterDto: GetTasksFilterDto = {
                status: TaskStatus.IN_PROGRESS,
                search: 'Some String',
            };
            const result = await tasksService.getTasks(
                filterDto,
                <User>mockUser,
            );
            expect(taskRepository.getTasks).toHaveBeenCalledWith(
                filterDto,
                <User>mockUser,
            );
            expect(result).toEqual('SomeValue');
        });
    });
});
