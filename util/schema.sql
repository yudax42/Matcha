CREATE DATABASE matcha;
use matcha;
CREATE TABLE IF NOT EXISTS users(
	id			INT AUTO_INCREMENT NOT NULL UNIQUE PRIMARY KEY,
	userName 	varchar(15) NOT NULL UNIQUE,
	firstName 	varchar(15) NOT NULL,
	lastName 	varchar(15) NOT NULL,
	email 		varchar(50) NOT NULL,
	password 	varchar(222) NOT NULL,
	gender 		ENUM('male', 'female'),
	sexPref 	SET('male', 'female','both'),
	birthDate	DATE,
	age		INT,
	bio		varchar(500),
	accStat 	ENUM('active', 'not active'),
	emailToken varchar(200),
	resetPassToken varchar(200),
	fameRating TINYINT,
	is_online BOOLEAN default 0,
	last_logine datetime
);


CREATE TABLE interest(
	id			INT AUTO_INCREMENT NOT NULL UNIQUE PRIMARY KEY,
	user_id		INT,
	topic		varchar(30),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE profilePictures(
	id			INT AUTO_INCREMENT NOT NULL UNIQUE PRIMARY KEY,
	user_id		INT,
	imgPath		varchar(250),
	imgIndex	varchar(22),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE userLocation(
	id				INT AUTO_INCREMENT NOT NULL UNIQUE PRIMARY KEY,
	userName	varchar(15) UNIQUE,
	geoLong		FLOAT,
	geoLat    FLOAT,
	ipLong		FLOAT,
	ipLat 		FLOAT,
	FOREIGN KEY (userName) REFERENCES users(userName) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE actions(
	id		INT AUTO_INCREMENT NOT NULL UNIQUE PRIMARY KEY,
	userIdF	INT ,
	userIdT INT ,
	block	BOOLEAN DEFAULT 0,
	love	BOOLEAN DEFAULT 0,
	report	BOOLEAN DEFAULT 0	
);

CREATE TABLE matches(
	id		INT AUTO_INCREMENT NOT NULL UNIQUE PRIMARY KEY,
	userIdF	INT ,
	userIdT INT 
);

CREATE TABLE messages(
	id	INT AUTO_INCREMENT NOT NULL UNIQUE PRIMARY KEY,
	userIdF INT,
	userIdT INT,
	message varchar(1000),
	msgDate datetime NOT NULL
);

CREATE TABLE notifications(
	id	INT AUTO_INCREMENT NOT NULL UNIQUE PRIMARY KEY,
	userIdF INT,
	userIdT INT,
	notifications varchar(100),
	notifDate datetime NOT NULL
);
CREATE TABLE visitHistory(
	id	INT AUTO_INCREMENT NOT NULL UNIQUE PRIMARY KEY,
	userId INT,
	visited INT,
	visitDate datetime NOT NULL
);