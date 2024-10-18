// Function responsible for passing the error to the error handling middleware
export function asyncWrapper(func) {
  return (req, res, next) => func(req, res, next).catch((err) => next(err));
}
