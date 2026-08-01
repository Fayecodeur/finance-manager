import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Auth } from './auth';

describe('Auth Service', () => {
  let service: Auth;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(Auth);
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  it('isLoggedIn devrait renvoyer false sans token', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('isLoggedIn devrait renvoyer true avec un token en storage', () => {
    localStorage.setItem('auth_token', 'fake-token-123');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('logout devrait supprimer le token', () => {
    localStorage.setItem('auth_token', 'fake-token-123');
    service.logout();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('getToken devrait renvoyer le token stocké', () => {
    localStorage.setItem('auth_token', 'abc-def');
    expect(service.getToken()).toBe('abc-def');
  });
});
