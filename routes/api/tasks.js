const { Router } = require('express');
const {
	getTasks,
	getTaskById,
	deleteTaskById,
	createTask,
	checkTask
} = require('../../controllers/tasks');

const withAuth = require('../../utils/withAuth');
const stuffRequired = require('../../utils/stuffRequired');

const router = Router();

// @route
// @public
// Get all tasks
router.get('/', getTasks);

// @route
// @public
// Get task by id
router.get('/:id', getTaskById);

// @route
// @protected stuff-only
// Delete task by id
router.delete('/:id', withAuth, stuffRequired, deleteTaskById);

// @route
// @private stuff-only
// Create new task
router.post('/', withAuth, stuffRequired, createTask);

// @route
// @private user-only
// Check task
router.post('/check', withAuth, checkTask);

module.exports = router;
