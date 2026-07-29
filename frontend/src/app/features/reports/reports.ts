import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { TransactionService } from '../../core/services/transaction';
import { CategoryService } from '../../core/services/category';
import { NotificationService } from '../../core/services/notification';
import { Transaction } from '../../shared/models/transaction.model';
import { Category } from '../../shared/models/category.model';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-reports',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    LoadingSpinner,
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports implements OnInit {
  onTypeChange(): void {
    this.computeSummary();
  }
  isLoading = true;
  allTransactions: Transaction[] = [];
  availableMonths: { value: string; label: string }[] = [];
  selectedMonth = '';

  totalRevenus = 0;
  totalDepenses = 0;
  totalTransactions = 0;
  selectedType = '';
  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.transactionService
      .getTransactions({ page: 1, limit: 10000, sortBy: 'date', order: 'desc' })
      .subscribe({
        next: (res) => {
          this.allTransactions = res.transactions;
          this.buildAvailableMonths(res.transactions);
          this.computeSummary();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private buildAvailableMonths(transactions: Transaction[]): void {
    const monthNames = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ];
    const monthSet = new Set<string>();

    transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthSet.add(key);
    });

    this.availableMonths = Array.from(monthSet)
      .sort((a, b) => b.localeCompare(a))
      .map((key) => {
        const [year, month] = key.split('-');
        return { value: key, label: `${monthNames[parseInt(month, 10) - 1]} ${year}` };
      });
  }

  onMonthChange(): void {
    this.computeSummary();
  }

  private getFilteredData(): Transaction[] {
    let data = this.allTransactions;

    if (this.selectedMonth) {
      data = data.filter((t) => {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return key === this.selectedMonth;
      });
    }

    if (this.selectedType) {
      data = data.filter((t) => t.type === this.selectedType);
    }

    return data;
  }

  private computeSummary(): void {
    const data = this.getFilteredData();
    this.totalRevenus = data
      .filter((t) => t.type === 'revenu')
      .reduce((sum, t) => sum + t.amount, 0);
    this.totalDepenses = data
      .filter((t) => t.type === 'depense')
      .reduce((sum, t) => sum + t.amount, 0);
    this.totalTransactions = data.length;
  }

  private getCategoryName(category: Category | string | null): string {
    if (!category) return '—';
    return typeof category === 'string' ? '' : category.name;
  }

  private getFilenameSuffix(): string {
    return this.selectedMonth || 'toutes';
  }

  private getPeriodLabel(): string {
    if (!this.selectedMonth) return 'Toutes les périodes';
    return this.availableMonths.find((m) => m.value === this.selectedMonth)?.label || '';
  }

  exportCsv(): void {
    const data = this.getFilteredData();

    if (data.length === 0) {
      this.notification.error('Aucune transaction à exporter pour cette période');
      return;
    }

    const header = ['Date', 'Description', 'Catégorie', 'Type', 'Montant'];
    const formatAmount = (amount: number): string => {
      const rounded = Math.round(amount).toString();
      const withSeparators = rounded.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return withSeparators + ' FCFA';
    };
    const rows = data.map((t) => [
      new Date(t.date).toLocaleDateString('fr-FR'),
      t.description,
      this.getCategoryName(t.category),
      t.type === 'revenu' ? 'Revenu' : 'Dépense',
      formatAmount(t.amount),
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${this.getFilenameSuffix()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    this.notification.success('Export CSV réussi');
  }

  exportExcel(): void {
    const data = this.getFilteredData();

    if (data.length === 0) {
      this.notification.error('Aucune transaction à exporter pour cette période');
      return;
    }

    const rows = data.map((t) => ({
      Date: new Date(t.date).toLocaleDateString('fr-FR'),
      Description: t.description,
      Catégorie: this.getCategoryName(t.category),
      Type: t.type === 'revenu' ? 'Revenu' : 'Dépense',
      Montant: t.amount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 12 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    XLSX.writeFile(workbook, `transactions-${this.getFilenameSuffix()}.xlsx`);

    this.notification.success('Export Excel réussi');
  }

  exportPdf(): void {
    const data = this.getFilteredData();

    if (data.length === 0) {
      this.notification.error('Aucune transaction à exporter pour cette période');
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Rapport de transactions', 14, 18);

    doc.setFontSize(10);
    doc.text(this.getPeriodLabel(), 14, 25);

    const formatAmount = (amount: number): string => {
      const rounded = Math.round(amount).toString();
      const withSeparators = rounded.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return withSeparators + ' FCFA';
    };

    const rows = data.map((t) => [
      new Date(t.date).toLocaleDateString('fr-FR'),
      t.description,
      this.getCategoryName(t.category),
      t.type === 'revenu' ? 'Revenu' : 'Dépense',
      formatAmount(t.amount),
    ]);

    autoTable(doc, {
      head: [['Date', 'Description', 'Catégorie', 'Type', 'Montant']],
      body: rows,
      startY: 32,
      headStyles: { fillColor: [249, 115, 22] },
    });

    doc.save(`transactions-${this.getFilenameSuffix()}.pdf`);

    this.notification.success('Export PDF réussi');
  }
}
