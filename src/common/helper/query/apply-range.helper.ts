export function applyRange(query: any, field: string, range?: any) {
  if (!range) return;

  query[field] = {};

  if (range.start !== undefined && range.start !== null) {
    query[field].$gte = range.start;
  }

  if (range.end !== undefined && range.end !== null) {
    query[field].$lte = range.end;
  }

  // remove empty range object
  if (Object.keys(query[field]).length === 0) {
    delete query[field];
  }
}
