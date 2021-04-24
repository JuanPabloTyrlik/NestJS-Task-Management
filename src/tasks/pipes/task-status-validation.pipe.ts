import { BadRequestException, PipeTransform } from '@nestjs/common';
import { TaskStatus } from '../task-status.enum';

export class TaskStatusValidationPipe implements PipeTransform {
  readonly allowedStatuses: string[] = [
    TaskStatus.OPEN,
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
  ];

  transform(value: string) {
    if (!value) {
      throw new BadRequestException('status should not be empty');
    }
    if (!this.isValidStatus(value.toUpperCase())) {
      throw new BadRequestException(`${value} is not a valid status.`);
    }
    return value;
  }

  private isValidStatus(status: string) {
    return this.allowedStatuses.includes(status);
  }
}
