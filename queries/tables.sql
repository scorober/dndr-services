DROP TABLE IF EXISTS logins;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS user_thread;
DROP TABLE IF EXISTS message_thread;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS dms;
DROP TABLE IF EXISTS user_group;
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS threads CASCADE;
DROP TABLE IF EXISTS users CASCADE; 
DROP TABLE IF EXISTS groups CASCADE;

CREATE TABLE users (id SERIAL PRIMARY KEY,
                    username VARCHAR(255)  NOT NULL UNIQUE,
                    is_active BOOLEAN NOT NULL DEFAULT FALSE,
                    create_date DATE NOT NULL DEFAULT CURRENT_DATE,
                    short_desc VARCHAR(255) DEFAULT 'Hello world',
                    long_desc VARCHAR(255) DEFAULT 'Hello world!',
                    player_level INTEGER DEFAULT 1 CHECK (player_level BETWEEN 1 AND 3));

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
                     short_desc VARCHAR(255),
                     is_active BOOLEAN NOT NULL DEFAULT FALSE);

CREATE TABLE user_group (id SERIAL PRIMARY KEY,
                         user_id INTEGER REFERENCES users(id),
                         group_id INTEGER REFERENCES groups(id));

/* TODO: Is this table necessary? 
Campaign could  have a reference to user_id that is the dm */
-- CREATE TABLE dms (id SERIAL PRIMARY KEY,
--                   user_id INTEGER REFERENCES users(id))
--                   campaign_id INTEGER REFERENCES campaigns(id);

CREATE TABLE campaigns (id SERIAL PRIMARY KEY, 
                       group_id INTEGER REFERENCES groups(id),
                       is_active BOOLEAN NOT NULL DEFAULT FALSE,
                       title VARCHAR(255),
                       dm_id INTEGER REFERENCES users(id));

/*
    Added a constraint so that user1_id must be lower than user2_id.  Always query the database as [min, max].
    Also prevents friending self.
*/
CREATE TABLE friends (id SERIAL,
                      user1_id INTEGER REFERENCES users(id),
                      user2_id INTEGER REFERENCES users(id) CHECK (user1_id < user2_id),
                      create_date TIMESTAMP DEFAULT CURRENT_DATE,
                      pending BOOLEAN DEFAULT TRUE,
                      PRIMARY KEY (user1_id, user2_id)); 

CREATE TABLE reviews (id SERIAL,
                      reviewed_id INTEGER REFERENCES users(id),
                      reviewer_id INTEGER REFERENCES users(id),
                      body VARCHAR(150),
                      rating INTEGER CHECK (rating BETWEEN 0 AND 5),
                      PRIMARY KEY (reviewed_id, reviewer_id));