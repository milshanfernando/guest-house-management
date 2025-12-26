// export const today = () => new Date().toISOString().split("T")[0];

// export const formatDate = (date: string) => new Date(date).toLocaleString();
// Always returns YYYY-MM-DD (local date)
export const today = (): string => new Date().toLocaleDateString("en-CA");

// Format any date string to YYYY-MM-DD
export const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("en-CA");
