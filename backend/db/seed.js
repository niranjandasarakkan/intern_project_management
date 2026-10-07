const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  try {
    console.log('Seeding database...');
    
    // Clear existing data to start fresh 
    await pool.query('DELETE FROM users'); 

    // 1. Create a demo user
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash('Demo@1234', salt);
    const userRes = await pool.query(
      `INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id`,
      ['Demo User', 'demo@example.com', hash]
    );
    const userId = userRes.rows[0].id;

    // 2. Create projects
    const projRes = await pool.query(
      `INSERT INTO projects (user_id, name, description, status) VALUES 
       ($1, 'Website Redesign', 'Overhaul the corporate website', 'In Progress'),
       ($1, 'Mobile App Launch', 'Prepare for app store submission', 'Not Started')
       RETURNING id`,
      [userId]
    );
    
    // 3. Create tasks
    await pool.query(
      `INSERT INTO tasks (project_id, name, priority, status) VALUES 
       ($1, 'Design Homepage', 'High', 'Completed'),
       ($1, 'Implement JWT Auth', 'High', 'In Progress'),
       ($2, 'Create App Icons', 'Medium', 'Pending')`,
      [projRes.rows[0].id, projRes.rows[1].id] // FIXED: Exactly 2 parameters passed
    );

    console.log('✅ Database seeded successfully!');
    console.log('Demo account: demo@example.com');
    console.log('Demo password: Demo@1234');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
