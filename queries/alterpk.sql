ALTER TABLE user_thread
DROP CONSTRAINT user_thread_user_id_recipient_id_key;

ALTER TABLE user_thread
ADD UNIQUE (user1_id, user2_id, id);