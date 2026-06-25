import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SafeUser, UpdateUserRoleDto } from '../models/user';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  findAll(): Observable<SafeUser[]> {
    return this.http.get<SafeUser[]>(`${this.api}/users`);
  }

  updateRole(id: number, dto: UpdateUserRoleDto): Observable<SafeUser> {
    return this.http.patch<SafeUser>(`${this.api}/users/${id}/role`, dto);
  }

  updateMyPassword(dto: {
    currentPassword: string;
    newPassword: string;
  }): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.api}/users/me/password`, dto);
  }

  updateMyEmail(dto: {
    newEmail: string;
    password: string;
  }): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.api}/users/me/email`, dto);
  }
}
