ALTER TABLE user_progress 
  ADD COLUMN attempt_number INT DEFAULT 1,
  ADD COLUMN actions_taken JSON,
  ADD COLUMN hints_used INT DEFAULT 0;