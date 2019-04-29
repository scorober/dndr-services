DROP TABLE IF EXISTS logins;

DROP TABLE IF EXISTS user_thread;

DROP TABLE IF EXISTS message_thread CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS dms CASCADE;

DROP TABLE IF EXISTS user_group CASCADE;
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS threads CASCADE;
DROP TABLE IF EXISTS users CASCADE; 
DROP TABLE IF EXISTS groups CASCADE;

CREATE TABLE users (id SERIAL PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    is_active BOOLEAN NOT NULL DEFAULT FALSE,
                    create_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE logins (id SERIAL PRIMARY KEY,
                     user_id INTEGER REFERENCES users(id),
                     email VARCHAR(255) NOT NULL UNIQUE,
                     password VARCHAR(255) NOT NULL,
                     salt VARCHAR(255),
                     Verification INT DEFAULT 0);

CREATE TABLE threads (id SERIAL PRIMARY KEY, 
                      title VARCHAR(255) NOT NULL,
                      is_active BOOLEAN NOT NULL DEFAULT FALSE,
                      create_date DATE NOT NULL DEFAULT CURRENT_DATE);

CREATE TABLE user_thread (id SERIAL PRIMARY KEY,
                          user_id INTEGER REFERENCES users(id),
                          thread_id INTEGER REFERENCES threads(id),
                          join_date DATE NOT NULL DEFAULT CURRENT_DATE,
                          is_active BOOLEAN NOT NULL DEFAULT FALSE);

CREATE TABLE messages (id SERIAL PRIMARY KEY,
                      sender_id INTEGER REFERENCES users(id),
                      message_body VARCHAR(255),
                      create_date TIMESTAMP NOT NULL DEFAULT CURRENT_DATE);

CREATE TABLE message_thread (id SERIAL PRIMARY KEY,
                             create_date DATE NOT NULL DEFAULT CURRENT_DATE,
                             thread_id INTEGER REFERENCES threads(id),
                             message_id INTEGER REFERENCES messages(id));

CREATE TABLE groups (id SERIAL PRIMARY KEY,
                     title VARCHAR(255),
                     is_active BOOLEAN NOT NULL DEFAULT FALSE);

CREATE TABLE user_group (id SERIAL PRIMARY KEY,
                         user_id INTEGER REFERENCES users(id),
                         group_id INTEGER REFERENCES groups(id));

CREATE TABLE dms (id SERIAL PRIMARY KEY,
                  user_id INTEGER REFERENCES users(id));

CREATE TABLE campaigns (id SERIAL PRIMARY KEY, 
                       dm_id INTEGER REFERENCES dms(id),
                       group_id INTEGER REFERENCES groups(id),
                       is_active BOOLEAN NOT NULL DEFAULT FALSE);

CREATE TABLE friends (id SERIAL PRIMARY KEY,
                      user1_id INTEGER REFERENCES users(id),
                      user2_id INTEGER REFERENCES users(id) CHECK (user1_id < user2_id),
                      create_date TIMESTAMP DEFAULT CURRENT_DATE); 


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