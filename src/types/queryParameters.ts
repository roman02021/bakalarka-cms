export default interface ApiQueryParameters {
  populate: string[];
  startFrom: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
