import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../components/navbar/navbar';
import { first } from 'rxjs/operators';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.css'
})
export class Confirmation implements OnInit {
  ticket: any = null;
  loading = true;
  error = '';

 constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.route.queryParams.pipe(first()).subscribe(params => {
      const ticketId = params['ticketId'];
       console.log('ticketId:', ticketId);
      if (!ticketId) {
        this.error = 'ბილეთის ID ვერ მოიძებნა';
        this.loading = false;
        return;
      }
      this.http.get<any>(`https://railway.stepprojects.ge/api/tickets/confirm/${ticketId}`)
        .subscribe({
          next: (data) => { 
              console.log('ticket data:', data);
              this.ticket = data; 
              this.loading = false; 
              this.cdr.detectChanges(); // add this
            },
          error: (err) => {
              console.log('error:', err);
              this.error = 'ბილეთის ინფორმაცია ვერ ჩაიტვირთა';
              this.loading = false;
            }
        });
    });
  }

  goHome() { this.router.navigate(['/']); }

  downloadPDF() {
  const doc = new jsPDF();
  
  doc.setFillColor(26, 58, 92);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('STEP RAILWAY', 20, 25);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Train Ticket', 160, 25);

  doc.setTextColor(26, 58, 92);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Ticket Confirmation', 20, 58);

  doc.setDrawColor(200, 220, 240);
  doc.line(20, 63, 190, 63);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 138, 170);
  doc.text('Ticket ID:', 20, 75);
  doc.setTextColor(26, 58, 92);
  doc.setFont('helvetica', 'bold');
  doc.text(this.ticket.id, 70, 75);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 138, 170);
  doc.text('Date:', 20, 88);
  doc.setTextColor(26, 58, 92);
  doc.setFont('helvetica', 'bold');
  doc.text(new Date().toLocaleDateString('en-GB'), 70, 88);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 138, 170);
  doc.text('Email:', 20, 101);
  doc.setTextColor(26, 58, 92);
  doc.setFont('helvetica', 'bold');
  doc.text(this.ticket.email, 70, 101);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 138, 170);
  doc.text('Phone:', 20, 114);
  doc.setTextColor(26, 58, 92);
  doc.setFont('helvetica', 'bold');
  doc.text(this.ticket.phone, 70, 114);

  doc.line(20, 122, 190, 122);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 58, 92);
  doc.text('Passengers', 20, 134);

  let y = 146;
  this.ticket.persons.forEach((p: any, i: number) => {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 92);
    doc.text(`${i + 1}. ${p.name} ${p.surname}`, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 138, 170);
    doc.text(`ID: ${p.idNumber}`, 120, y);
    y += 13;
  });

  doc.line(20, y + 4, 190, y + 4);
  y += 16;

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 58, 92);
  doc.text(`Total Paid: ${this.ticket.ticketPrice} GEL`, 20, y);

  doc.setFillColor(26, 58, 92);
  doc.rect(0, 272, 210, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('© 2024 Step Railway. All rights reserved.', 20, 287);

  doc.save(`ticket-${this.ticket.id}.pdf`);
}
}