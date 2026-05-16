export interface Committee {
  id: number;
  name: string;
  description: string;
  createdBy: number;
  directorId: number | null;
  isOpen: boolean;
  createdAt: string;
}
