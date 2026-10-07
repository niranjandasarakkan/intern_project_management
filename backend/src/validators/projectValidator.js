const { z } = require('zod');

const projectStatusEnum = z.enum(['Not Started', 'In Progress', 'Completed']);

const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().optional(),
    status: projectStatusEnum.optional(),
    start_date: z.string().date().optional().or(z.literal('')),
    end_date: z.string().date().optional().or(z.literal(''))
  })
});

const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format')
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    status: projectStatusEnum.optional(),
    start_date: z.string().date().optional().or(z.literal('')),
    end_date: z.string().date().optional().or(z.literal(''))
  })
});

const getOrDeleteProjectSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format')
  })
});

module.exports = { createProjectSchema, updateProjectSchema, getOrDeleteProjectSchema };
