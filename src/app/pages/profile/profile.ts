import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  activeTab = 'info';
  user: any = null;
  form: any = {};
  oldPassword = '';
  newPassword = '';
  updateSuccess = false;
  updateError = '';
  passwordSuccess = false;
  passwordError = '';

  constructor(private auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.auth.fetchCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.form = {
          firstName: user.firstName,
          lastName: user.lastName,
          age: user.age,
          email: user.email,
          phone: user.phone,
          address: user.address,
          zipcode: user.zipcode,
          avatar: user.avatar,
          gender: user.gender
        };
        this.cdr.detectChanges();
      },
      error: (err) => console.log('error:', err)
    });
  }

  updateProfile() {
  this.updateSuccess = false;
  this.updateError = '';
  this.cdr.detectChanges();

  this.auth.updateUser({ ...this.form, age: Number(this.form.age) }).subscribe({
    next: () => {
      this.updateSuccess = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.updateSuccess = false;
        this.cdr.detectChanges();
      }, 3000);
    },
    error: (err) => {
      this.updateError = err?.error?.message || 'შეცდომა';
      this.cdr.detectChanges();
    }
  });
}

  changePassword() {
  this.passwordSuccess = false;
  this.passwordError = '';
  this.cdr.detectChanges();
  if (!this.oldPassword || !this.newPassword) {
    this.passwordError = 'შეავსეთ ორივე ველი';
    this.cdr.detectChanges();
    return;
  }
  this.auth.changePassword(this.oldPassword, this.newPassword).subscribe({
    next: () => {
      this.passwordSuccess = true;
      this.oldPassword = '';
      this.newPassword = '';
      this.cdr.detectChanges();
      setTimeout(() => {
        this.passwordSuccess = false;
        this.cdr.detectChanges();
      }, 3000);
    },
    error: (err) => {
      this.passwordError = err?.error?.message || 'შეცდომა';
      this.cdr.detectChanges();
    }
  });
}
}