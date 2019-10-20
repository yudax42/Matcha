CREATE DATABASE matcha;
use matcha;
CREATE TABLE IF NOT EXISTS users(
	id			INT AUTO_INCREMENT NOT NULL UNIQUE PRIMARY KEY,
	userName 	varchar(15) NOT NULL UNIQUE,
	firstName 	varchar(15) NOT NULL,
	lastName 	varchar(15) NOT NULL,
	email 		varchar(30) NOT NULL,
	password 	varchar(222) NOT NULL,
	gender 		ENUM('male', 'female'),
	sexPref 	SET('male', 'female','both'),
	birthDate	DATE,
	age		INT,
	bio		varchar(200),
	accStat 	ENUM('active', 'not active')
);


CREATE TABLE interest(
	id			INT AUTO_INCREMENT NOT NULL UNIQUE PRIMARY KEY,
	user_id		INT,
	topic		varchar(15),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)