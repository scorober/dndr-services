INSERT INTO users (username) VALUES('scorober-test');
INSERT INTO users (username) VALUES('other-test');


INSERT INTO logins (user_id, email, password) 
    VALUES((SELECT id FROM users WHERE username = 'scorober-test'), 
            'scorober@test.com',
            '123456');

INSERT INTO logins (user_id, email, password) 
    VALUES((SELECT id FROM users WHERE username = 'other-test'), 
            'other@test.com',
            'qwerty');

INSERT INTO threads (title) VALUES ('TEST');

INSERT INTO user_thread (user_id, thread_id) 
    VALUES((SELECT id FROM users WHERE username = 'scorober-test'),
           (SELECT id FROM threads WHERE title = 'TEST'));


INSERT INTO messages(sender_id, message_body) 
    VALUES((SELECT id FROM users WHERE username = 'scorober-test'),
            'Hello, how are you?');

INSERT INTO messages(sender_id, message_body) 
    VALUES((SELECT id FROM users WHERE username = 'other-test'),
            'Im well how are you?');