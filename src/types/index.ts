export interface Guide {
  id: number;
  name: string;
  supervisor: string;
  department: string;
  nps: number;
  nrpc: number;
  refundPercent: number;
  totalTickets: number;
}

export interface Winner {
  id: string;
  guide_id: number;
  name: string;
  supervisor: string;
  department: string;
  nps: number;
  nrpc: number;
  refund_percent: number;
  total_tickets: number;
  won_at: string;
  created_at: string;
}

export interface RaffleSettings {
  maxWinners: number;
  drawFrom: 'all' | 'departments';
  selectedDepartments: string[];
}