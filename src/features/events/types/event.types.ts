// Event Types for Frontend
export enum EventType {
  CONFERENCIA = 'CONFERENCIA',
  TALLER = 'TALLER',
  SEMINARIO = 'SEMINARIO',
  COMPETENCIA = 'COMPETENCIA',
  CULTURAL = 'CULTURAL',
  DEPORTIVO = 'DEPORTIVO'
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string from backend
  time: string;
  location: string;
  type: EventType;
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  date?: string | null;
  type?: EventType | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface Metadata {
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  timestamp?: string;
}

export interface ErrorDetails {
  code: string;
  message: string;
  details?: any;
}

export interface FENResponse<T> {
  success: boolean;
  data: T | null;
  error: ErrorDetails | null;
  metadata: Metadata;
}
