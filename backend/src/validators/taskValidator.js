const { z } = require('zod');

const taskPriorityEnum = z.enum(['Low', 'Medium', 'High']);
const taskStatusEnum = z.enum(['Pending', 'In Progress', 'Completed']);

const createTaskSchema = z.object({
  body: z.object({
    project_id: z.string().uuid('Invalid project ID format'),
    name: z.string().min(1, 'Task name is required'),
    description: z.string().optional(),
    priority: taskPriorityEnum.optional(),
    status: taskStatusEnum.optional(),
    due_date: z.string().date().optional().or(z.literal(''))
  })
});

const updateTaskSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid task ID format') }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    priority: taskPriorityEnum.optional(),
    status: taskStatusEnum.optional(),
    due_date: z.string().date().optional().or(z.literal(''))
  })
});

const getOrDeleteTaskSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid task ID format') })
});

module.exports = { createTaskSchema, updateTaskSchema, getOrDeleteTaskSchema };
