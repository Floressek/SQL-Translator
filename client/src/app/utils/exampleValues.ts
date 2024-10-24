export const EXAMPLE_USER_QUERY = `Which customers have not rented a film in the last 6 months? List 3.`;

export const EXAMPLE_FORMATTED_ANSWER = `Here are 3 customers who have not rented a film in the last 6 months: \n\t- <span class=\"bold\">MARY SMITH</span> (email: MARY.SMITH@sakilacustomer.org) \n\t- <span class=\"bold\">PATRICIA JOHNSON</span> (email: PATRICIA.JOHNSON@sakilacustomer.org) \n\t- <span class=\"bold\">LINDA WILLIAMS</span> (email: LINDA.WILLIAMS@sakilacustomer.org)`;

export const EXAMPLE_SQL_STATEMENT = `SELECT customer.first_name, customer.last_name, customer.email \nFROM customer \nLEFT JOIN rental ON customer.customer_id = rental.customer_id \nWHERE rental.rental_date IS NULL \nOR rental.rental_date < DATE_SUB(CURDATE(), INTERVAL 6 MONTH) \nGROUP BY customer.customer_id \nLIMIT 3;`;

export const EXAMPLE_ROW_DATA_SINGLE = [
  {
    'SUM(ilosc)': '45989.00',
  },
];

export const EXAMPLE_ROW_DATA_ARRAY = [
  {
    first_name: 'MARY',
    last_name: 'SMITH',
    email: 'MARY.SMITH@sakilacustomer.org',
  },
  {
    first_name: 'PATRICIA',
    last_name: 'JOHNSON',
    email: 'PATRICIA.JOHNSON@sakilacustomer.org',
  },
  {
    first_name: 'LINDA',
    last_name: 'WILLIAMS',
    email: 'LINDA.WILLIAMS@sakilacustomer.org',
  },
];
