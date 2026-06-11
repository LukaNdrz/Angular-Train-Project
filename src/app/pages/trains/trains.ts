import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Imported ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-trains',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './trains.html',
  styleUrl: './trains.css'
})
export class Trains implements OnInit {
  searchParams: any = {};
  filteredTrains: any[] = [];

  // 2. Injected private cdr: ChangeDetectorRef into the constructor
  constructor(private route: ActivatedRoute, private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchParams = params;
      this.fetchAndFilterDepartures();
    });
  }

  private getGeorgianDayName(dateString: string): string {
    if (!dateString || dateString.trim() === '') return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ''; 

      const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
      const dayName = new Intl.DateTimeFormat('en-US', options).format(date).toLowerCase();

      const dayMap: { [key: string]: string } = {
        'monday': 'ორშაბათი',
        'tuesday': 'სამშაბათი',
        'wednesday': 'ოთხშაბათი',
        'thursday': 'ხუთშაბათი',
        'friday': 'პარასკევი',
        'saturday': 'შაბათი',
        'sunday': 'კვირა'
      };

      return dayMap[dayName] || '';
    } catch (e) {
      return '';
    }
  }

  fetchAndFilterDepartures() {
    if (!this.searchParams || Object.keys(this.searchParams).length === 0) {
      return;
    }
    
    // Clear old results immediately on a new search invocation
    this.filteredTrains = [];

    const rawDate = this.searchParams.date || '';
    const targetDayName = rawDate ? this.getGeorgianDayName(rawDate) : '';

    const paramFrom = this.searchParams.from ? String(this.searchParams.from).trim().toLowerCase() : '';
    const paramTo = this.searchParams.to ? String(this.searchParams.to).trim().toLowerCase() : '';

    this.http.get<any[]>('https://railway.stepprojects.ge/api/departures')
      .pipe(
        map((data: any[]) => {
          if (!Array.isArray(data)) return []; 

          let results: any[] = [];

          data.forEach(dep => {
            const depSource = dep?.source ? String(dep.source).trim().toLowerCase() : '';
            const depDestination = dep?.destination ? String(dep.destination).trim().toLowerCase() : '';
            const depDate = dep?.date ? String(dep.date).trim().toLowerCase() : '';

            const matchFrom = !paramFrom || depSource.includes(paramFrom) || paramFrom.includes(depSource);
            const matchTo = !paramTo || depDestination.includes(paramTo) || paramTo.includes(depDestination);
            const matchDay = !targetDayName || depDate === targetDayName.toLowerCase();

            if (matchFrom && matchTo && matchDay) {
              if (dep?.trains && Array.isArray(dep.trains)) {
                results = [...results, ...dep.trains];
              }
            }
          });

          return results;
        })
      )
      .subscribe({
        next: (finalFilteredArray) => {
          this.filteredTrains = finalFilteredArray;
          
          // 3. Force Angular to wake up and redraw the HTML template immediately!
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error('Error fetching departures stream:', err);
        }
      });
  }
  selectTrain(train: any) {
  this.router.navigate(['/booking'], {
    queryParams: {
      trainId: train.id,
      from: train.from,
      to: train.to,
      departure: train.departure,
      arrive: train.arrive,
      number: train.number,
      name: train.name,
      passengers: this.searchParams.passengers,
      date: this.searchParams.date
    }
  });
}
}