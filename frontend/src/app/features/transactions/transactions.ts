import { CommonModule } from '@angular/common';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { TransactionService } from '../../core/services/transaction';
import { CategoryService } from '../../core/services/category';
import { NotificationService } from '../../core/services/notification';

import { Transaction } from '../../shared/models/transaction.model';
import { Category } from '../../shared/models/category.model';

import { TransactionForm, TransactionFormData } from './transaction-form/transaction-form';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../shared/empty-state/empty-state';

@Component({
  selector: 'app-transactions',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    EmptyState,
    LoadingSpinner,
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions implements OnInit {
  displayedColumns: string[] = ['date', 'description', 'category', 'type', 'amount', 'actions'];

  dataSource = new MatTableDataSource<Transaction>([]);
  categories: Category[] = [];

  totalItems = 0;
  pageSize = 10;
  currentPage = 1;
  sortBy = 'date';
  order: 'asc' | 'desc' = 'desc';
  search = '';
  selectedType = '';
  selectedCategory = '';
  isLoading = signal(true);

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadTransactions();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.cdr.detectChanges();
      },
      error: () => {
        this.categories = [];
        this.cdr.detectChanges();
      },
    });
  }

  loadTransactions(): void {
    this.isLoading.set(true);
    this.transactionService
      .getTransactions({
        search: this.search,
        type: this.selectedType,
        category: this.selectedCategory,
        sortBy: this.sortBy,
        order: this.order,
        page: this.currentPage,
        limit: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.dataSource.data = res.transactions;
          this.totalItems = res.total;
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  onSearchChange(value: string): void {
    this.search = value;
    this.currentPage = 1;
    this.loadTransactions();
  }

  onTypeChange(value: string): void {
    this.selectedType = value;
    this.currentPage = 1;
    this.loadTransactions();
  }

  onCategoryChange(value: string): void {
    this.selectedCategory = value;
    this.currentPage = 1;
    this.loadTransactions();
  }

  onSortChange(sort: Sort): void {
    if (sort.direction) {
      this.sortBy = sort.active;
      this.order = sort.direction as 'asc' | 'desc';
    } else {
      this.sortBy = 'date';
      this.order = 'desc';
    }

    this.loadTransactions();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadTransactions();
  }

  openForm(transaction: Transaction | null = null): void {
    const data: TransactionFormData = {
      transaction,
      categories: this.categories,
    };

    const dialogRef = this.dialog.open(TransactionForm, {
      width: '400px',
      data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      if (transaction) {
        this.transactionService.updateTransaction(transaction._id, result).subscribe({
          next: () => {
            this.loadTransactions();
            this.notification.success('Transaction modifiée avec succès');
          },
          error: () => this.notification.error('Erreur lors de la modification'),
        });
      } else {
        this.transactionService.createTransaction(result).subscribe({
          next: () => {
            this.loadTransactions();
            this.notification.success('Transaction ajoutée avec succès');
          },
          error: () => this.notification.error("Erreur lors de l'ajout"),
        });
      }
    });
  }

  deleteTransaction(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '360px',
      data: {
        title: 'Supprimer la transaction',
        message:
          'Cette action est irréversible. Voulez-vous vraiment supprimer cette transaction ?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.transactionService.deleteTransaction(id).subscribe({
        next: () => {
          this.loadTransactions();
          this.notification.success('Transaction supprimée');
        },
        error: () => this.notification.error('Erreur lors de la suppression'),
      });
    });
  }

  getCategoryName(category: Category | string | null): string {
    if (!category) return '—';
    return typeof category === 'string' ? '' : category.name;
  }
}
