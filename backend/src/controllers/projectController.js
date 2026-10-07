const db = require('../config/db');

const getProjects = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, status, start_date, end_date } = req.body;
    const result = await db.query(
      `INSERT INTO projects (user_id, name, description, status, start_date, end_date) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        req.user.id, 
        name, 
        description || null, 
        status || 'Not Started', 
        start_date || null, 
        end_date || null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { name, description, status, start_date, end_date } = req.body;
    
    const result = await db.query(
      `UPDATE projects 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           status = COALESCE($3, status), 
           start_date = COALESCE($4, start_date), 
           end_date = COALESCE($5, end_date)
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [name, description, status, start_date, end_date, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };
