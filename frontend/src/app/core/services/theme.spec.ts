import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark-theme');
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  it('devrait démarrer en mode clair par défaut', () => {
    expect(service.isDark()).toBe(false);
  });

  it('toggleTheme devrait activer le mode sombre', () => {
    service.toggleTheme();
    expect(service.isDark()).toBe(true);
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
  });

  it('toggleTheme devrait sauvegarder la préférence en localStorage', () => {
    service.toggleTheme();
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
