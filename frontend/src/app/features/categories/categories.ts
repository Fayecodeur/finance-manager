import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CategoryService } from '../../core/services/category';
import { Category } from '../../shared/models/category.model';
import { CategoryForm } from './category-form/category-form';
import { NotificationService } from '../../core/services/notification';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
@Component({
  selector: 'app-categories',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    EmptyState,
    LoadingSpinner,
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  displayedColumns: string[] = ['name', 'type', 'actions'];
  allCategories = signal<Category[]>([]);
  search = signal('');
  pageIndex = signal(0);
  pageSize = signal(5);
  isLoading = signal(true);
  filtered = computed(() => {
    const term = this.search().toLowerCase();
    return this.allCategories().filter((c) => c.name.toLowerCase().includes(term));
  });

  paged = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.allCategories.set(categories);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  openForm(category: Category | null = null): void {
    const dialogRef = this.dialog.open(CategoryForm, {
      width: '400px',
      data: { category },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      if (category) {
        this.categoryService.updateCategory(category._id, result).subscribe({
          next: () => {
            this.loadCategories();
            this.notification.success('Catégorie modifiée avec succès');
          },
          error: () => this.notification.error('Erreur lors de la modification'),
        });
      } else {
        this.categoryService.createCategory(result).subscribe({
          next: () => {
            this.loadCategories();
            this.notification.success('Catégorie ajoutée avec succès');
          },
          error: () => this.notification.error("Erreur lors de l'ajout"),
        });
      }
    });
  }

  deleteCategory(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '360px',
      data: {
        title: 'Supprimer la catégorie',
        message: 'Cette action est irréversible. Voulez-vous vraiment supprimer cette catégorie ?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.loadCategories();
          this.notification.success('Catégorie supprimée');
        },
        error: () => this.notification.error('Erreur lors de la suppression'),
      });
    });
  }
}
