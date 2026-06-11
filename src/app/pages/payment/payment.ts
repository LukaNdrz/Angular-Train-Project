import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment {
  cardNumber = '';
  cardName = '';
  expiry = '';
  cvv = '';
  loading = false;
  error = '';
  ticketId = '';
  cvvFocused = false;
  
  // Holds the dynamic ticket summary data passed from the booking page
  ticketDetails: any = null;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.ticketId = params['ticketId'];
    });

    // Extract the state data sent by the booking registration handler
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.ticketDetails = navigation.extras.state['ticket'];
    }
  }

  formatDisplay(val: string): string {
    return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
  }

  formatCardNumber() {
    const digits = this.cardNumber.replace(/\D/g, '').slice(0, 16);
    this.cardNumber = digits.replace(/(.{4})/g, '$1 ').trim();
  }

  formatExpiry() {
    const digits = this.expiry.replace(/\D/g, '').slice(0, 4);
    this.expiry = digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
  }

  pay() {
    if (!this.cardNumber || !this.cardName || !this.expiry || !this.cvv) {
      this.error = 'გთხოვთ შეავსოთ ყველა ველი';
      return;
    }
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/confirmation'], { queryParams: { ticketId: this.ticketId } });
    }, 2000);
  }
}