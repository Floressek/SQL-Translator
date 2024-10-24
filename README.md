# SQL Translator

A simple web application designed for the company management board to streamline the retrieval of key information from its internal database. The application showcases how natural language queries can be translated into SQL with a help of a LLM and executed against the relational database, allowing for intuitive information retrieval without requiring knowledge of SQL syntax. 


Currently, the application is implemented for the fictitious "Sakila LLC" company, using the **[Sakila Database](https://dev.mysql.com/doc/sakila/en/sakila-introduction.html "Go to official Sakila db description page")** as a sample dataset.

Previous version of the app was **[successfully commercially deployed](https://github.com/ardium-pl/SQL-translator "Go to deployment repo")** for the management board of the BUDMAT company, back when I worked for [Ardium](https://github.com/ardium-pl "Go to Ardium GitHub").

The app can be easily tailored to operate on Your company's database. For more information feel free to reach me via email: [szymonskowronnn@gmail.com](mailto:szymonskowronnn@gmail.com "Reach me via email").

# Interface

The app operates in a browser and    has a simple interface which (after successful authorization) allows the user to enter the query in natural language and get an accurate answer from AI assistant based on the results retrieved from the database.

# About the Sakila Database

The **[Sakila Database](https://dev.mysql.com/doc/sakila/en/sakila-introduction.html "Go to official Sakila db description page")** is a multi-table, relational database originally developed by the MySQL team as a learning resource. It simulates a video rental store, containing tables for films, actors, staff, rentals, payments, customers, and others. Sakila database is commonly used to demonstrate SQL querying, complex joins, and database management techniques in educational environments.

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

3. Backend setup (console 2):
   ```
   cd ./server
   npm install
   node ./index.js
   ```

Before running the project make sure that you have the `.env` file with the proper environment variable declarations inside your `/server` directory. You can look up which variables you need to declare in `env.example`.
