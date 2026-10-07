const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createProjectSchema, updateProjectSchema, getOrDeleteProjectSchema } = require('../validators/projectValidator');

router.use(protect);

router.get('/', getProjects);
router.get('/:id', validate(getOrDeleteProjectSchema), getProjectById);
router.post('/', validate(createProjectSchema), createProject);
router.put('/:id', validate(updateProjectSchema), updateProject);
router.delete('/:id', validate(getOrDeleteProjectSchema), deleteProject);

module.exports = router;
