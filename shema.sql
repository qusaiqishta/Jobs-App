DROP TABLE IF EXISTS jobs;
CREATE TABLE jobs(
    id SERIAL PRIMARY KEY ,
    title VARCHAR(200),
    company VARCHAR(200),
    location VARCHAR(200),
    url VARCHAR(200),
    description VARCHAR(200)
)