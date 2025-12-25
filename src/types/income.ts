export interface Income {
  id: number;
  date: string;
  amount: number;
  note?: string;
  platform?: string;
  propertyId: number;
  property: {
    id: number;
    name: string;
  };
}
