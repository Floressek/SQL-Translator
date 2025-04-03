Teraz musisz uruchomić skrypt dwa razy, aby załadować oba schematy:

# Ładowanie schematu widoków
```bash
SCHEMA_FILE=gabon_schema_money.json SCHEMA_VERSION=views_schema_v1 node server/scripts/load_schema_to_mongodb.js
```
# Ładowanie schematu tabel
```bash
SCHEMA_FILE=gabon_schema.json SCHEMA_VERSION=gabon_customer_tables node server/scripts/load_schema_t
```