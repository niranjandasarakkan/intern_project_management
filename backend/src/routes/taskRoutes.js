const express = require('express');
const router = express.Router();
const { getTasks, getTaskById, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createTaskSchema, updateTaskSchema, getOrDeleteTaskSchema } = require('../validators/taskValidator');

router.use(protect);

router.get('/', getTasks);
router.get('/:id', validate(getOrDeleteTaskSchema), getTaskById);
router.post('/', validate(createTaskSchema), createTask);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', validate(getOrDeleteTaskSchema), deleteTask);

module.exports = router;
