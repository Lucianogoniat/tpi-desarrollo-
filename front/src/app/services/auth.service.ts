import { computed, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';
import {
  AuthResponse,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '../models/auth';
import { SafeUser } from '../models/user';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'access_token';
  private token = signal<string | null>(localStorage.getItem(this.tokenKey));

  user = signal<SafeUser | null>(null);
  userLoaded = signal(false);
  isAuthenticated = computed(() => !!this.token());
  isAdmin = computed(() => this.user()?.role === 'admin');

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.initializeUser();
  }

  private initializeUser(): void {
    const token = this.getToken();
    if (token) {
      this.me().pipe(finalize(() => this.userLoaded.set(true))).subscribe({
        error: () => this.logout(),
      });
    } else {
      this.userLoaded.set(true);
    }
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/register`, dto).pipe(
      tap((res) => {
        if (res?.access_token) {
          this.handleAuth(res);
        }
      }),
    );
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, dto).pipe(
      tap((res) => {
        if (res?.access_token) {
          this.handleAuth(res);
        }
      }),
    );
  }

  verifyEmail(dto: VerifyEmailDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.api}/verify-email`, dto);
  }

  forgotPassword(dto: ForgotPasswordDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.api}/forgot-password`, dto);
  }

  resetPassword(dto: ResetPasswordDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.api}/reset-password`, dto);
  }

  resendVerification(): Observable<{ message: string }> {
    const token = this.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    return this.http.post<{ message: string }>(`${this.api}/resend-verification`, {}, { headers });
  }

  me(): Observable<SafeUser> {
    return this.http.get<SafeUser>(`${this.api}/me`).pipe(
      tap((user) => this.user.set(user)),
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.token.set(null);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.token();
  }

  private handleAuth(res: AuthResponse): void {
    if (res?.access_token && res?.user) {
      localStorage.setItem(this.tokenKey, res.access_token);
      this.token.set(res.access_token);
      this.user.set(res.user);
    }
  }
}
