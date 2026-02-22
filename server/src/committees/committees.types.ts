export interface Committee {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  directorId: string | null;
  isOpen: boolean;
  createdAt: string;
}
