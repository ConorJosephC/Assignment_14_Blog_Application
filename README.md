# Assignment_14_User_Information_Application

This README contains the following information:

- **About the app**
- **Dependencies and Quick setup guide**
- **Tables and Table Relationships**
- **Routes**

## About the app

A functioning blog application that allows users to:
- register an account
- login
- logout

Important security and validation features (on both the client and server side):
- User will be required to confirm their passwords
- Passwords will be encrypted upon registration
- The username must be unique
- The password must be a minimum of 8 characters
- The passwords will be hidden (during registration and logging in)


Once logged in, a user is able to:
- create a post
- view a list of their own posts
- view a list of everyone's posts
- view a specific post, including the comments people have made about it
- leave a comment on a post

## Dependencies and Quick setup guide

To get this application working you will need to clone or download the repository and run the following in the command line:

    npm install express ejs express-session body-parser sequelize connect-session-sequelize bcrypt

otherwise download the package.json and in the command line run:

    npm i

## Tables

My application will have three tables in total: **User**, **Post** and **Comment**.

The relationship between the 'User' table and the 'Post' table is a One-To-Many relationship, as one user can have many posts. Therefore the table 'Post' will have the userId as a Foreign Key.

The relationship between the comments and the posts will be a Many-To-Many relationship, as each post can have many comments from many different users.

Therefore the table 'Comment' will have both the postId and the userId as Foreign Keys.

    Table "User"

The columns will be:

- User Id (integer) (each user will be assigned a unique Id with a serial primary key)
- Username (string)
- FirstName (string)
- LastName (string)
- Email (string)
- Password (string) (the passwords will also be encrypted)


| User ID (PK) |  username     | firstname   | lastname     | email    |  password |
|--------------|---------------|-------------|--------------|----------|-----------|
|              |               |             |              |          |           ||

    Table "Post"

The columns will be:

- Post Id (integer) (each post will be assigned a unique Id with a serial primary key)
- Title (string)
- Body (string)
- UserID (integer) (Foreign Key)

| Post ID (PK) | title         |  body       | userId (FK)  |
|--------------|---------------|-------------|--------------|
|              |               |             |              ||

    Table "Comment"

The columns will be:

- Comment Id (integer) (each comment will be assigned a unique Id with a serial primary key)
- Body (string)
- PostId (integer) (Foreign Key)
- CommentID (integer) (Foreign Key)

| Comment Id (PK) | body     |  postId (FK) | userId (FK) |
|-----------------|----------|--------------|-------------|
|                 |          |              |             ||

- (PK) = Primary Key
- (FK) = Foreign Key

## ROUTES

My application will have the following routes:

#### HOME PAGE ('/') then render ('home')

This is the default page that users will arrive at.
Here users have the option to sign in to their profile (if they have one) or can create a profile.

#### LOG OUT ('/logout')

Users can log out which will end their session.

#### SIGN UP ('/signup') then redirect to ('/profile')

Users can create an account and have to enter certain information about themselves.
Once they sign up they will be redirected to their profile page.

#### PROFILE ('/profile')

Users have the option to post to their own blog and also view their own messages (including any comments).

#### CREATE A POST ('/createapost') then redirected to ('/yourposts')

User is able to create a post with a title and a body. Once they create a message they will be redirected to a list of all of their posts.

#### DELETE ('/delete/:id') then redirected to ('/yourposts')

This will delete the currently selected message.

#### ALL OF ONE USER'S POSTS ('/yourposts')

This will show all of the messages created by one user.

#### ONE OF THE CURRENT USERS SPECIFIC POSTS ('/yourspecificpost/:postId') then render ('yourspecificpost')

This will show one specific post created by the currently logged in user (where it is possible to view all comments or leave a comment).

#### DISPLAY ALL POSTS ('/posts').

This will show all of the messages from all users (with options to be redirected to leave a comment or view all comments).

#### SPECIFIC POST OF ANOTHER USER ('/post/:postId') then render ('specificpost')

This will show a specific post for a specific user.

#### LEAVE COMMENTS ('/comment/:postId') then redirect to ('/post')

This allows us to leave comments on messages.
