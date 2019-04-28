DROP TABLE IF EXISTS Courses;

CREATE TABLE Courses
(id VARCHAR(15) PRIMARY KEY,
shortDesc VARCHAR(255) NOT NULL,
longDesc VARCHAR(255) NOT NULL,
prereqs VARCHAR(255) NOT NULL);


INSERT INTO Courses VALUES('TCSS343', 'Algorithms', 'A very hard class', 'TCSS342');
INSERT INTO Courses VALUES('TCSS450', 'Algorithms', 'A very hard class', 'TCSS342');
INSERT INTO Courses VALUES('TCSS342', 'Algorithms', 'A very hard class', 'TCSS342');
INSERT INTO Courses VALUES('TCSS360', 'Algorithms', 'A very hard class', 'TCSS342');