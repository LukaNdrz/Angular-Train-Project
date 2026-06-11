import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'https://api.everrest.educata.dev/auth';
  private tokenKey = 'access_token';

  currentUser$ = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient, private router: Router) {
  const token = this.getToken();
  if (token) {
    setTimeout(() => this.fetchCurrentUser().subscribe(), 0);
   }
  }

  signIn(email: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/sign_in`, { email, password }).pipe(
      tap(data => localStorage.setItem(this.tokenKey, data.access_token)),
      switchMap(() => this.fetchCurrentUser())
    );
  }

  signUp(userData: any) {
    return this.http.post<any>(`${this.baseUrl}/sign_up`, userData);
  }

  fetchCurrentUser() {
    return this.http.get<any>(`${this.baseUrl}`).pipe(
      tap(user => this.currentUser$.next(user))
    );
  }

  signOut() {
    localStorage.removeItem(this.tokenKey);
    this.currentUser$.next(null);
    this.router.navigate(['/']);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn() {
    return !!this.getToken();
  }
  updateUser(data: any) {
  return this.http.patch<any>(`${this.baseUrl}/update`, data).pipe(
    tap(user => this.currentUser$.next(user))
  );
}

changePassword(oldPassword: string, newPassword: string) {
  return this.http.patch<any>(`${this.baseUrl}/change_password`, { oldPassword, newPassword });
}
}