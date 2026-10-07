const db = require('../config/db');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      totalProjects,
      projectsInProgress,
      totalTasks,
      completedTasks,
      pendingTasks
    ] = await Promise.all([
      db.query('SELECT COUNT(*) FROM projects WHERE user_id = $1', [userId]),
      db.query("SELECT COUNT(*) FROM projects WHERE user_id = $1 AND status = 'In Progress'", [userId]),
      db.query('SELECT COUNT(t.id) FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.user_id = $1', [userId]),
      db.query("SELECT COUNT(t.id) FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.user_id = $1 AND t.status = 'Completed'", [userId]),
      db.query("SELECT COUNT(t.id) FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.user_id = $1 AND t.status = 'Pending'", [userId])
    ]);

    res.json({
      totalProjects: parseInt(totalProjects.rows[0].count, 10),
      projectsInProgress: parseInt(projectsInProgress.rows[0].count, 10),
      totalTasks: parseInt(totalTasks.rows[0].count, 10),
      completedTasks: parseInt(completedTasks.rows[0].count, 10),
      pendingTasks: parseInt(pendingTasks.rows[0].count, 10)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving dashboard stats' });
  }
};

module.exports = { getDashboard };
