import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-check-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './check-ticket.html',
  styleUrl: './check-ticket.css',
})
export class CheckTicket {
  ticketId = '';
  ticket: any = null;
  loading = false;
  error = '';
  savedTickets: any[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.savedTickets = JSON.parse(localStorage.getItem('myTickets') || '[]');
  }

  loadSaved(id: string) {
    this.ticketId = id;
    this.search();
  }

  search() {
    if (!this.ticketId.trim()) {
      this.error = 'გთხოვთ შეიყვანოთ ბილეთის ნომერი';
      return;
    }
    this.loading = true;
    this.error = '';
    this.ticket = null;

    this.http.get<any>(`https://railway.stepprojects.ge/api/tickets/confirm/${this.ticketId.trim()}`)
      .subscribe({
        next: (data) => {
          this.ticket = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'ბილეთი ვერ მოიძებნა';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }
  cancelTicket() {
  if (!confirm('დარწმუნებული ხართ რომ გსურთ ბილეთის გაუქმება?')) return;
  
  this.http.delete(`https://railway.stepprojects.ge/api/tickets/cancel/${this.ticket.id}`, { responseType: 'text' as const })
    .subscribe({
      next: () => {
          const cancelledId = this.ticket.id;
          this.ticket = null;
          this.ticketId = '';
          this.error = 'ბილეთი წარმატებით გაუქმდა';
          
          const saved = JSON.parse(localStorage.getItem('myTickets') || '[]');
          const updated = saved.filter((t: any) => t.ticketId !== cancelledId);
          localStorage.setItem('myTickets', JSON.stringify(updated));
          this.savedTickets = updated;
          this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'გაუქმება ვერ მოხერხდა';
        this.cdr.detectChanges();
      }
    });
}
}