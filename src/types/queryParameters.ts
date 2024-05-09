export default interface ApiQueryParameters {
  populate: string[];
  offset: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
