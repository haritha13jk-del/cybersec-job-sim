-- Fix 1: Create chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  scenario_id INT NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Fix 2: Add missing columns to user_progress
ALTER TABLE user_progress 
  ADD COLUMN completed TINYINT(1) DEFAULT 0,
  ADD COLUMN time_taken INT DEFAULT 0;