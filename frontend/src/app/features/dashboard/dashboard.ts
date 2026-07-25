import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService, DashboardStats } from '../../core/services/dashboard';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MatCardModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  stats = signal<DashboardStats | null>(null);

  pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  };

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: 'bottom',

        labels: {
          padding: 18,

          font: {
            family: 'Inter',

            size: 13,

            weight: 'normal',
          },
        },
      },

      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;

            return `${value.toLocaleString('fr-FR')} FCFA`;
          },
        },
      },
    },
  };

  lineChartData: ChartData<'line'> = {
    labels: [],

    datasets: [],
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,

    maintainAspectRatio: false,

    interaction: {
      mode: 'index',

      intersect: false,
    },

    plugins: {
      legend: {
        position: 'top',

        labels: {
          padding: 20,

          font: {
            family: 'Inter',

            size: 13,

            weight: 'normal',
          },
        },
      },

      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;

            return `${context.dataset.label}: ${value.toLocaleString('fr-FR')} FCFA`;
          },
        },
      },
    },

    scales: {
      x: {
        ticks: {
          font: {
            family: 'Inter',
            size: 11,
          },
          autoSkip: true,
          maxRotation: 0,
        },
      },

      y: {
        ticks: {
          font: {
            family: 'Inter',
            size: 11,
          },
          maxTicksLimit: 5,
          callback: (value) => {
            const num = Number(value);
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
            if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
            return num.toString();
          },
        },
      },
    },
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);

        this.buildPieChart(data);

        this.buildLineChart(data);
      },
    });
  }

  private buildPieChart(data: DashboardStats): void {
    this.pieChartData = {
      labels: Object.keys(data.depensesByCategory),

      datasets: [
        {
          data: Object.values(data.depensesByCategory),
        },
      ],
    };
  }

  private buildLineChart(data: DashboardStats): void {
    this.lineChartData = {
      labels: data.monthlyEvolution.map((m) => {
        const [year, month] = m.month.split('-');

        return new Date(Number(year), Number(month) - 1).toLocaleDateString('fr-FR', {
          month: 'short',
        });
      }),

      datasets: [
        {
          label: 'Revenus',

          data: data.monthlyEvolution.map((m) => m.revenus),

          borderColor: '#16a34a',

          backgroundColor: 'rgba(22,163,74,0.15)',

          tension: 0.4,

          fill: true,

          pointRadius: 4,
        },

        {
          label: 'Dépenses',

          data: data.monthlyEvolution.map((m) => m.depenses),

          borderColor: '#dc2626',

          backgroundColor: 'rgba(220,38,38,0.15)',

          tension: 0.4,

          fill: true,

          pointRadius: 4,
        },
      ],
    };
  }
}
