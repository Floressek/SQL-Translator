export function appendLimitClause(sqlQuery, sqlQueryFormatted, rowLimit) {
  let sqlQueryLimited;
  let sqlQueryLimitedFormatted;

  const pattern = /\s?LIMIT\s(\d+);/i;
  const queryMatches = sqlQuery.match(pattern);
  const limitedQueryMatches = sqlQueryFormatted.match(pattern);

  if (!queryMatches) {
    sqlQueryLimited = `${sqlQuery.split(";")[0]} LIMIT ${rowLimit};`;
  } else {
    const extractedRowLimit = parseInt(queryMatches[1]);
    sqlQueryLimited =
      extractedRowLimit > rowLimit
        ? `${sqlQuery.split(pattern)[0]} LIMIT ${rowLimit};`
        : sqlQuery;
  }

  if (!limitedQueryMatches) {
    sqlQueryLimitedFormatted = `${
      sqlQueryFormatted.split(";")[0]
    } \n LIMIT ${rowLimit};`;
  } else {
    const extractedRowLimit = parseInt(limitedQueryMatches[1]);
    sqlQueryLimitedFormatted =
      extractedRowLimit > rowLimit
        ? `${sqlQueryFormatted.split(pattern)[0]} LIMIT ${rowLimit};`
        : sqlQueryFormatted;
  }

  return { sqlQueryLimited, sqlQueryLimitedFormatted };
}