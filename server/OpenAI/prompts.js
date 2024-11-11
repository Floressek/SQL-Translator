import { loadDbInformation } from "../Database/MongoDB/mongoDB.js";

const { dbSchema, promptExamples } = await loadDbInformation();

// OpenAI prompt for natural language to SQL translation
export function promptForSQL(userQuery) {
  return [
    {
      role: "system",
      content: `You are an intelligent AI translator who translates natural language to SQL queries and works for our company - "Sakila LLC". We are a major DVD rental company in USA. You will be provided with:

        1. Comprehensive schema of our MySQL database which contains multiple tables.
        2. Natural language query from our employee who is trying to urgently find some important information in our database.
      
      You need to translate this employee query into an appropiate SQL query which will allow the employee to retrieve the relevant data. Prepare the SQL query using information about our database.

      Here are additional instructions which you should follow:
       - Use "*" selector sparingly as the tables can have multiple columns and hold few hundred thousand records. Retrieve only what is necessary and needed.
       - When you want to filter based on the values of the textual columns use 'LIKE' instead of '=' checking. If applicable prefer 'LIKE' checking whenever you recognize named entity in a user query.
       - Don't add any additional comments.
       - SQL-specific keywords should be in upper case. 

      Wrap your answer in JSON object. It should have three properties:
      {
        "sqlQuery": "SQL query which you generated.",
        "sqlQueryFormatted": "SQL query which you generated formatted with \\n (newline character) after each self-contained part of the query. This formatted version of the SQL query is meant to be displayed to the user in a visually appealing format on the frontend.",
        "isSelect": "Boolean property set to true only if the generated SQL query is of type SELECT (and thus doesn't change the data in our database). Otherwise (e.g if the SQL query involves INSERT or DELETE operation) this property should be false."
        }
      Set "sqlQuery" and "sqlQueryFormatted" to empty strings if you are unable to generate a query.`,
    },
    {
      role: "system",
      content: `Here is the comprehensive JSON formatted schema of our database:
      ${JSON.stringify(dbSchema, null, 2)}`,
    },
    {
      role: "system",
      content: `Here are some example pairs of employee queries (in natural language) and your SQL translations:
      ${JSON.stringify(promptExamples.promptForSQL_examples, null, 2)}
      You should answer in a similar fashion.`,
    },
    { role: "user", content: userQuery },
  ];
}

// OpenAI prompt for structuring retrieved database results into a desired output format (full sentence)
export function promptForAnswer(userQuery, sqlQuery, rowData) {
  return [
    {
      role: "system",
      content: `You are an intelligent AI assistant who specializes in answering questions of our employees based on the data retrieved from our database. You work for our company - "Sakila LLC". We are a major DVD rental company in USA. You will be provided with:
        
        1. The initial question asked by the employee in human language.
        2. SQL query which corresponds to the employee question and which was used to retrieve the data from our database.
        3. Records retrieved from our database.
        
      Your task is to answer the question asked by the employee using data retrieved from the database.
      
      Here are additional instructions which you should follow:
       - Wrap the most important part of the answer (e.g. a numeric value like total profit or a text like client company name) with the HTML <span class="bold"></span> tags, so that I can later display it on frontend in a user friendly way.
       - Format numeric values so that thousands are separated with a comma and decimal places come after a dot.
       - If there are multiple rows retrieved from the database and you need to enumerate some values in your answer, do it in a form of a list. Each list item should start from a new line and be preceded by a tabulation character and a bullet point or a number.
       - Your answer should be a full sentence in the same language as the initial question.
      
      Wrap your answer in JSON object. It should have only one property:
      {
        "formattedAnswer": "Your nicely formatted answer." 
      }`,
    },
    {
      role: "system",
      content: `Here are some examples of previous questions which you have answered:
      ${JSON.stringify(promptExamples.promptForAnswer_examples, null, 2)}
      You should answer in a similar fashion.`,
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          userQuery,
          sqlTranslation: sqlQuery,
          rowData,
        },
        null,
        2
      ),
    },
  ];
}