Project Set-Up

Before starting you will need to add two env files called .env.dev and .env.test

These files will set an environment variable which will be the name of the database you are working with

In .env.test write:
PGDATABASE=*NAME_OF_TEST_DATABASE*

In .env.dev write:
PGDATABASE=*NAME_OF_DEV_DATABASE*