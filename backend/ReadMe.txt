In the server the mongodb database in inside the container, so you need to connect to the container and then connect to the database.
+docker start mongodb
+mongosh
+inside chefleys database
+The client is connected with backend
+The backend is connected with mongodb

## How to run the project
go to backend folder and run
+ npm install
+ npm start

if you want to run the client go to client folder and run
and add env file to change firebase settings
also add SERVER_URL=url of the server

+ npm install
+ npm run build

make sure to run the server first
server contain .env file that contain credentials for firebase and mongodb and google mailapi

## how to get google api credentials
go to google cloud console and create new project
go to credentials and create new credentials
choose OAuth client ID
choose web application
add name
add https://developers.google.com/oauthplayground to authorized javascript origins


Done by
+ Sanjay Santhosh

All the Best
