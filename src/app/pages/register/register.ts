import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  error = '';
  success = '';

  userData = {
    firstName: '',
    lastName: '',
    age: null as number | null,
    email: '',
    password: '',
    address: '',
    phone: '',
    zipcode: '',
    avatar: '',
    gender: ''
  };

  constructor(private auth: AuthService, private router: Router) {}

  signUp() {
  const { firstName, lastName, age, email, password, phone, address, zipcode, gender } = this.userData;

  if (!firstName || !lastName || !age || !email || !password || !phone || !address || !zipcode || !gender) {
    this.error = 'გთხოვთ შეავსოთ ყველა სავალდებულო ველი';
    return;
  }

  const payload = {
    ...this.userData,
    age: Number(this.userData.age),
    avatar: this.userData.avatar || 'https://i.pravatar.cc/150'
  };

  this.auth.signUp(payload).subscribe({
    next: () => {
      this.auth.signIn(email, password).subscribe({
        next: () => this.router.navigate(['/'])
      });
    },
    error: (err) => {
      this.error = err?.error?.message || 'შეცდომა, სცადეთ თავიდან';
    }
  });
}
}