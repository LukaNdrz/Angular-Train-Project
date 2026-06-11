import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../components/navbar/navbar';
import { forkJoin } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, RouterModule],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class Booking implements OnInit {
  trainInfo: any = {};
  vagons: any[] = [];
  passengerCount: number = 1;

  contactEmail = '';
  contactPhone = '';

  passengerList: {
    name: string;
    surname: string;
    idNumber: string;
    seatId: string | null;
    seatNumber: string;
    status: string;
  }[] = [];

  showModal = false;
  modalPassengerIndex = -1;
  selectedVagon: any = null;
  modalStep: number = 1;

  loading = false;
  error = '';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.trainInfo = params;
      this.passengerCount = Number(params['passengers']) || 1;
      this.passengerList = Array.from({ length: this.passengerCount }, () => ({
        name: '',
        surname: '',
        idNumber: '',
        seatId: null,
        seatNumber: '',
        status: 'adult'
      }));

      if (params['trainId']) {
        this.http.get<any[]>('https://railway.stepprojects.ge/api/vagons')
          .subscribe({
            next: (vagons) => {
              this.vagons = vagons.filter(v => v.trainId === Number(params['trainId']));
              console.log('trainId:', params['trainId']);
              console.log('vagons loaded:', vagons.length);
              console.log('filtered vagons:', this.vagons);
              console.log('seats:', this.vagons[0]?.seats?.slice(0,5));
            },
            error: (err) => console.error('Failed to load vagons', err)
          });
      }
    });
  }

  openSeatPicker(index: number) {
  this.modalPassengerIndex = index;
  this.modalStep = 1; 
  this.showModal = true;

  // Get the current passenger's chosen seat ID
  const currentSeatId = this.passengerList[index]?.seatId;

  //  If they already have a seat, find the wagon it belongs to
  if (currentSeatId) {
    this.selectedVagon = this.vagons.find(v => 
      v.seats.some((s: any) => s.seatId === currentSeatId)
    ) || null;
  } else {
    // If they haven't picked a seat yet, keep it null
    this.selectedVagon = null;
  }
}

selectVagon(vagon: any) {
  this.selectedVagon = vagon;
  this.modalStep = 2; // move to step 2
}

closeModal() {
  this.showModal = false;
  this.selectedVagon = null;
  this.modalPassengerIndex = -1;
  this.modalStep = 1; // reset
}

  isSeatTaken(seat: any): boolean {
    if (seat.isOccupied) return true;
    return this.passengerList.some(
      (p, i) => i !== this.modalPassengerIndex && p.seatId === seat.seatId
    );
  }

  selectSeat(seat: any) {
  if (this.isSeatTaken(seat)) return;
  this.passengerList[this.modalPassengerIndex].seatId = seat.seatId;
  this.passengerList[this.modalPassengerIndex].seatNumber = seat.number;
 }

  getSortedSeats(seats: any[]): any[] {
    return [...seats].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
  }

  get totalPrice(): number {
    let total = 0;
    for (const p of this.passengerList) {
      if (p.seatId && this.vagons.length) {
        for (const v of this.vagons) {
          const seat = v.seats.find((s: any) => s.seatId === p.seatId);
          if (seat) { total += seat.price; break; }
        }
      }
    }
    return total;
  }

   register() {
    console.log("REGISTER STARTED");
    this.error = '';

    if (!this.contactEmail || !this.contactPhone) {
      console.log("CONTACT INFO FAILED");
      this.error = 'გთხოვთ შეავსოთ საკონტაქტო ინფორმაცია';
      return;
    }

    for (const p of this.passengerList) {
      if (!p.name || !p.surname || !p.idNumber || !p.seatId) {
        console.log("PASSENGER VALIDATION FAILED");
        this.error = 'გთხოვთ შეავსოთ ყველა მგზავრის ინფორმაცია და აირჩიოთ ადგილი';
        return;
      }
    }

    console.log("VALIDATION PASSED");
    console.log("TRAIN INFO:", this.trainInfo);

    this.loading = true;

    const body = {
      trainId: Number(this.trainInfo['trainId']),
      date: this.trainInfo['date'],
      email: this.contactEmail,
      phoneNumber: this.contactPhone,
      people: this.passengerList.map(p => ({
        seatId: p.seatId,
        name: p.name,
        surname: p.surname,
        idNumber: p.idNumber,
        status: p.status,
        payoutCompleted: true
      }))
    };
    
    console.log("BODY CREATED:", body);
    console.log("SENDING REQUEST");

    this.http.post('https://railway.stepprojects.ge/api/tickets/register', body, { responseType: 'text' as const })
      .subscribe({
        next: (res) => {
          this.loading = false;
          const match = String(res).match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
          const ticketId = match ? match[0] : res;
          
          // Save to localStorage history tracker
          const saved = JSON.parse(localStorage.getItem('myTickets') || '[]');
          saved.push({
            ticketId,
            date: new Date().toLocaleDateString(),
            from: this.trainInfo['from'],
            to: this.trainInfo['to'],
            departure: this.trainInfo['departure']
          });
          localStorage.setItem('myTickets', JSON.stringify(saved));
          
          // 1. Build the dynamic ticket summary details
          const passengerNames = this.passengerList.map(p => `${p.name} ${p.surname}`).join(', ');
          const seatNumbers = this.passengerList.map(p => p.seatNumber).join(', ');

          // NEW: Look up the real wagon class name by scanning the vagons array
          const carriageClasses = this.passengerList.map(p => {
            const vagonIndex = this.vagons.findIndex(v => {
              const seatsArray = v.seats || v.Seats;
              return seatsArray ? seatsArray.some((s: any) => s.seatId === p.seatId) : false;
            });

            if (vagonIndex !== -1) {
              return this.getWagonClass(vagonIndex);
            }

            // Fallback: If array search failed, use the wagon currently active in the modal UI
            if (this.selectedVagon) {
              const backupIndex = this.vagons.indexOf(this.selectedVagon);
              if (backupIndex !== -1) return this.getWagonClass(backupIndex);
            }

            return 'II კლასი';
          });

          // Join and clear out duplicates if multiple passengers share a class tier
          const uniqueCarriageClasses = [...new Set(carriageClasses)].join(', ');

          const summaryData = {
            departureTime: this.trainInfo['departure'] || '00:00',
            departureStation: this.trainInfo['from'] || 'საწყისი სადგური',
            arrivalTime: this.trainInfo['arrive'] || '00:00',
            arrivalStation: this.trainInfo['to'] || 'საბოლოო სადგური',
            passengerName: passengerNames,
            date: this.trainInfo['date'] || '',
            carriage: uniqueCarriageClasses, // <-- Successfully dynamically calculated!
            seat: seatNumbers,
            price: this.totalPrice
          };
          
          // 2. Navigate to payment page and pass the structured object seamlessly via state
          this.router.navigate(['/payment'], { 
            queryParams: { ticketId },
            state: { ticket: summaryData }
          });
        },
        error: (err) => {
          this.loading = false;
          this.error = 'დაფიქსირდა შეცდომა. სცადეთ თავიდან.';
          console.error(err);
        }
      });
  }
  getSeatRows(seats: any[]): any[][] {
    const sorted = [...seats].sort((a, b) =>
      a.number.localeCompare(b.number, undefined, { numeric: true })
    );
    const rowMap: { [key: string]: any[] } = {};
    for (const seat of sorted) {
      const rowNum = seat.number.replace(/[A-Z]/g, '');
      if (!rowMap[rowNum]) rowMap[rowNum] = [];
      rowMap[rowNum].push(seat);
    }
    return Object.values(rowMap);
  }
  getSeatPrice(seatId: string | null): number | null {
  if (!seatId) return null;
  for (const v of this.vagons) {
    const seat = v.seats.find((s: any) => s.seatId === seatId);
    if (seat) return seat.price;
  }
  return null;
}
getWagonImage(index: number): string {
  if (index === 0) {
    return 'assets/firstWagon.png';
  }

  if (index === this.vagons.length - 1) {
    return 'assets/lastWagon.png';
  }

  return 'assets/midWagon.png';
}

getWagonClass(index: number): string {
  if (index === 0) {
    return 'I კლასი';
  }

  if (index === this.vagons.length - 1) {
    return 'ბიზნეს კლასი';
  }

  return 'II კლასი';
}

}
