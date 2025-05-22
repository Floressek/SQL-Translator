# SQL Translator

A web application for the management board of GABON company that simplifies retrieval of key information from the internal database. The application provides a natural language interface for database queries, translating human language questions into SQL and presenting results in an easy-to-understand format.

## 🌟 Features

- **Natural Language Query Interface**: Ask questions in plain language (Polish)
- **AI-Powered SQL Generation**: Automatic translation of natural language to optimized SQL
- **Instant Visualization**: See both the raw data and a human-friendly answer
- **Dark/Light Mode Support**: Comfortable viewing in any environment
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

The SQL Translator follows a client-server architecture:

```mermaid
graph TD
    User[User] -->|Natural Language Query| Frontend[Angular Frontend]
    Frontend -->|HTTP POST| Backend[Node.js Backend]
    Backend -->|Query| GPT[OpenAI GPT-4o]
    GPT -->|SQL Query| Backend
    Backend -->|Execute SQL| Database[MSSQL Database]
    Database -->|Results| Backend
    Backend -->|Format Results| GPT
    GPT -->|Formatted Answer| Backend
    Backend -->|API Response| Frontend
    Frontend -->|Display Results| User
    
    classDef blue fill:#2374ab,stroke:#2374ab,color:white;
    classDef green fill:#457b9d,stroke:#457b9d,color:white;
    classDef yellow fill:#96c7d5,stroke:#96c7d5,color:black;
    classDef red fill:#e63946,stroke:#e63946,color:white;
    
    class User yellow
    class Frontend blue
    class Backend green
    class GPT red
    class Database red
```

### Request Flow Sequence

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant OpenAI
    participant Database
    
    User->>Frontend: Enter natural language query
    Frontend->>Backend: POST /language-to-sql
    Backend->>OpenAI: Generate SQL from query
    OpenAI->>Backend: Return SQL statement
    Backend->>Database: Execute SQL query
    Database->>Backend: Return query results
    Backend->>OpenAI: Format results into natural language
    OpenAI->>Backend: Return formatted answer
    Backend->>Frontend: Return complete response
    Frontend->>User: Display SQL, data grid, and answer
```

## 🔧 Technology Stack

- **Frontend**: 
  - Angular 17 (Standalone Components)
  - Angular Material & Custom Design System
  - AG Grid for data visualization
  - SCSS for styling

- **Backend**:
  - Node.js with Express
  - OpenAI API (GPT-4o)
  - MongoDB for schema storage
  - MSSQL for database connectivity

## 💻 Local Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance
- MSSQL Server instance
- OpenAI API Key

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/ardium-pl/SQL-translator.git

# Navigate to client directory
cd ./client

# Install dependencies
npm install

# Start development server
ng serve
```

### Backend Setup

```bash
# Navigate to server directory
cd ./server

# Install dependencies
npm install

# Create .env file (see env.example for required variables)
cp env.example .env
# Edit .env with your specific configuration

# Start server
node ./index.js
```

### Environment Variables

Create a `.env` file in the `/server` directory with the following variables:

```
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# MSSQL Database
MSSQL_SERVER=your_mssql_server
MSSQL_PORT=1433
MSSQL_USER=your_mssql_user
MSSQL_PASSWORD=your_mssql_password
MSSQL_DATABASE=your_mssql_database

# MongoDB
MONGO_CONNECTION_STRING=mongodb://username:password@localhost:27017
MONGO_DATABASE=gabon_db
MONGO_COLLECTION_EXAMPLES=examples
MONGO_COLLECTION_SCHEMAS=schema
```

## 🧠 How It Works

1. **Query Input**: User submits a natural language query
2. **AI Translation**: The system uses OpenAI's GPT-4o to translate the query into SQL
3. **Database Execution**: The SQL query is executed against the MSSQL database
4. **Result Formatting**: The raw results are transformed into a human-readable format by GPT-4o
5. **Visualization**: The application displays:
   - The original query
   - The generated SQL code
   - The raw data in a table
   - A natural language explanation of the results

## 📝 Example Queries

- "Pokaż mi kontrahentów obsługiwanych przez Jana Kowalskiego"
- "Znajdź kontrahentów, którzy mają zgodę na e-faktury"
- "Wyświetl aktywnych kontrahentów, którzy są podatnikami VAT" 
- "Lista kontrahentów, którzy wyrazili zgodę na marketing"
- "Pokaż kontrahentów z ustawionymi komunikatami"

## 🔄 Development Workflow

```mermaid
graph LR
    Dev[Development] -->|git push| Repo[GitHub Repository]
    Repo -->|CI/CD Pipeline| Build[Build & Test]
    Build -->|Deploy| Prod[Production Environment]
    
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:1px;
    classDef active fill:#4CAF50,color:white,stroke:#333,stroke-width:1px;
    class Prod active
```

## 🔐 Security Considerations

- The application validates all user inputs
- SQL injection is prevented by the architecture design
- Only SELECT queries are permitted - data modification is disallowed
- API access requires authentication
- Database access is restricted by permissions

## 📊 Database Schema

The application connects to a MSSQL database with a focus on customer and contractor management. The main tables include:

- `kh__Kontrahent`: Contains customer/contractor data
- `pd_Uzytkownik`: User information
- `sl_Rabat`: Discount information 
- `sl_FormaPlatnosci`: Payment methods
- `kh_WeryfikacjaNIP`: Tax ID verification data

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run end-to-end tests
npm run e2e
```

## 📚 Documentation

Additional documentation:
- [API Documentation](docs/api.md)
- [SQL Schema Details](docs/schema.md)
- [Frontend Components](docs/components.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👥 Credits
- Ardium Development Team
