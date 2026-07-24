import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  solde: number;
  revenusThisMonth: number;
  depensesThisMonth: number;
  transactionsThisMonth: number;
  depensesByCategory: Record<string, number>;
  monthlyEvolution: {
    month: string;
    revenus: number;
    depenses: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }
}
