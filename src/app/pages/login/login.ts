import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  signIn() {
  if (!this.email || !this.password) {
    this.error = 'გთხოვთ შეავსოთ ყველა ველი';
    return;
  }
  this.auth.signIn(this.email, this.password).subscribe({
    next: () => this.router.navigate(['/']),
    error: () => this.error = 'არასწორი ელ. ფოსტა ან პაროლი'
  });
}
}