-- Fix notifications table - Add missing columns if they don't exist
ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS link VARCHAR(500) NULL;

-- Verify the table structure
DESCRIBE notifications;

