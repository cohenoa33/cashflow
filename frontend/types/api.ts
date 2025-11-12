export type Account = {
  id: number;
  name: string;
  currency: string;
  ownerId: number;
  description?: string | null;
  notes?: string | null;
  startingBalance: number | string;
  currentBalance: number | string;
  createdAt: string;
  updatedAt: string;
};
