ALTER TABLE user_thread
ADD CHECK (user_id < recipient_id);