# Introduction

The purpose of this project is to demonstrate my ability to build and deploy a REST API using Express.js which communicates with SQL databases using PostgreSQL. This API serves the front end of my social news site NC News, which can be found here https://github.com/NuclearEngineer1/fe-nc-news. The API will take requests to end points which will peform tasks such as getting all articles or posting comments to a specific article. 

# Project Set-Up

- Make sure you have node v19.0.0 or above installed on your computer
- Before starting you will need to add two env files called .env.dev and .env.test
- These files will set an environment variable which will be the name of the database you are working with

- In .env.test write:
`PGDATABASE=*NAME_OF_TEST_DATABASE*`

- In .env.dev write:
`PGDATABASE=*NAME_OF_DEV_DATABASE*`

- You will also need to run `npm install` in your terminal to install the relevant node modules

- To set the server to listen for requests, run the listen.js file with `node listen` in the terminal, it will automatically
listen on port 9090 but you can change this on line 2 in the listen.js file


# Hosted Version

This API is hosted at https://liams-nc-news.onrender.com and is live and available for requests, the SQL databases are hosted on ElephantSQL.


# End points

## /api/topics 

a **GET** request to this end point will return a list of all the topics currently in the database

Example response:

```
{
	"topics": [
		{
			"slug": "coding",
			"description": "Code is love, code is life"
		},
		{
			"slug": "football",
			"description": "FOOTIE!"
		},
		{
			"slug": "cooking",
			"description": "Hey good looking, what you got cooking?"
		}
	]
}
```

## /api/articles

a **GET** request to this end point will return a list of all the articles currently in the database

Example response:

```
{
	"articles": [
		{
			"article_id": 1,
			"title": "Running a Node App",
			"topic": "coding",
			"author": "jessjelly",
			"body": "This is part two of a series on how to get up and running with Systemd and Node.js. This part dives deeper into how to successfully run your app with systemd long-term, and how to set it up in a production environment.",
			"created_at": "2020-11-07T06:03:00.000Z",
			"votes": 2,
			"comment_count": 0
		},
		{
			"article_id": 11,
			"title": "Designing Better JavaScript APIs",
			"topic": "coding",
			"author": "tickle122",
			"body": "At some point or another, you will find yourself writing JavaScript code that exceeds the couple of lines from a jQuery plugin. Your code will do a whole lot of things; it will (ideally) be used by many people who will approach your code differently. They have different needs, knowledge and expectations.",
			"created_at": "2020-07-07T00:13:00.000Z",
			"votes": 0,
			"comment_count": 0
		}
	]
}
```
### Queries

|sort_by   |order|
|----------|-----|
|topic     |asc  |
|title     |desc |
|author    |
|body      |
|created_at|
|votes     |
|article_id|

To append a query add ?{query}={column} and to add multiple queries use & to join them

For example:

/api/articles?sort_by=topic&order=asc

## /api/articles/:article_id

This is a paramatric end point so you need to replace `:article_id` with the id of the article you are searching for. A **GET** request will send back the specific article.

Example response:
```
{
	"article_id": 11,
	"title": "Designing Better JavaScript APIs",
	"topic": "coding",
	"author": "tickle122",
	"body": "At some point or another, you will find yourself writing JavaScript code that exceeds the couple of lines from a jQuery plugin. Your code will do a whole lot of things; it will (ideally) be used by many people who will approach your code differently. They have different needs, knowledge and expectations.",
	"created_at": "2020-07-07T00:13:00.000Z",
	"votes": 0,
	"comment_count": "6"
}
```

A **PATCH** request to this end point with the request body taking the form 

```
{
    "inc_votes" = {number_to_increment_by}
}
```
will increment the number of votes by the given amount and will respond with the single article with the votes updated.


## /api/articles/:article_id/comments

This is a paramatric end point so you need to replace `:article_id` with the id of the article you are searching for. A **GET** request will send you back a list of comments.

Example response:

```
{
	"comments": [
		{
			"comment_id": 411,
			"body": "hello",
			"article_id": 11,
			"author": "tickle122",
			"votes": 0,
			"created_at": "2023-01-13T15:08:29.675Z"
		},
		{
			"comment_id": 82,
			"body": "Facilis ipsam illum aut voluptatibus. Repudiandae cupiditate quo fugiat earum est ut autem repudiandae excepturi. Fuga voluptatem iusto ut. Nulla sequi culpa qui eaque. Architecto non veniam distinctio.",
			"article_id": 11,
			"author": "happyamy2016",
			"votes": -4,
			"created_at": "2020-08-19T08:08:00.000Z"
		}
	]
}
```

A **POST** request to this end point will add a comment to the relevant article, the JSON body in the request must take the following form 

```
{
    "username": {username_string}
    "body": {comment_string}
}
```

## /api/users

a **GET** request to this end point will return a list of all users

Example response:

```
{
	"users": [
		{
			"username": "tickle122",
			"name": "Tom Tickle",
			"avatar_url": "https://vignette.wikia.nocookie.net/mrmen/images/d/d6/Mr-Tickle-9a.png/revision/latest?cb=20180127221953"
		},
		{
			"username": "grumpy19",
			"name": "Paul Grump",
			"avatar_url": "https://vignette.wikia.nocookie.net/mrmen/images/7/78/Mr-Grumpy-3A.PNG/revision/latest?cb=20170707233013"
		}
	]
}
```
## /api/comments/:comment_id

This is a parametric end point so replace `:comment_id` with the comment id you want.

A **DELETE** request to this end point will delete the comment with the corresponding id 

This method will not send a response back