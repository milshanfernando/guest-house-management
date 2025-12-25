export const today = () => new Date().toISOString().split("T")[0];

export const formatDate = (date: string) => new Date(date).toLocaleString();
