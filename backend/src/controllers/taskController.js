const db = require('../config/db');

const getTasks = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.* FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.user_id = $1 ORDER BY t.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.* FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.id = $1 AND p.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createTask = async (req, res) => {
  try {
    const { project_id, name, description, priority, status, due_date } = req.body;
    const projectCheck = await db.query('SELECT id FROM projects WHERE id = $1 AND user_id = $2', [project_id, req.user.id]);
    if (projectCheck.rows.length === 0) return res.status(404).json({ error: 'Project not found or not authorized' });

    const result = await db.query(
      `INSERT INTO tasks (project_id, name, description, priority, status, due_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [project_id, name, description || null, priority || 'Medium', status || 'Pending', due_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { name, description, priority, status, due_date } = req.body;
    const taskCheck = await db.query(
      `SELECT t.id FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.id = $1 AND p.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (taskCheck.rows.length === 0) return res.status(404).json({ error: 'Task not found or not authorized' });
    
    const result = await db.query(
      `UPDATE tasks SET name = COALESCE($1, name), description = COALESCE($2, description), priority = COALESCE($3, priority), status = COALESCE($4, status), due_date = COALESCE($5, due_date) WHERE id = $6 RETURNING *`,
      [name, description, priority, status, due_date, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskCheck = await db.query(
      `SELECT t.id FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.id = $1 AND p.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (taskCheck.rows.length === 0) return res.status(404).json({ error: 'Task not found or not authorized' });

    await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
