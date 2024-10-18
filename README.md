## SQL Translator
Simple web application created for the management board of BUDMAT company in order to alleviate the retrieval of key information from the internal database.

The app has a simple interface which (after successful authorization) allows the user to enter the query in naturul language and get an accurate answer from AI assitant based on the results retrieved from the database.

### Local setup instructions:
1. Clone the repository:
   ```
   git clone https://github.com/ardium-pl/SQL-translator.git
   ```

2. Frontend setup (console 1):
   ```
   cd ./client
   npm install
   ng serve
   ```

2. Backend setup (console 2):
   ```
   cd ./server
   npm install
   node ./index.js
   ```

Before running the project make sure that you have the ```.env``` file with the proper environment variable declarations inside your ```/server``` directory. You can look up which variables you need to declare in ```env.example```.