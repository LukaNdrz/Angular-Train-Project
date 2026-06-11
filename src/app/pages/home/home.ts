import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, AfterViewInit {
  stations: any[] = [];
  from = '';
  to = '';
  date = '';
  passengers: number | null = null;
  today = new Date().toISOString().split('T')[0];
  constructor(private http: HttpClient, private router: Router) {}

  @ViewChild('trainVideo') trainVideo!: ElementRef;

  ngAfterViewInit() {
    const video: HTMLVideoElement = this.trainVideo.nativeElement;
    this.trainVideo.nativeElement.playbackRate = 2.0;
    video.muted = true;

    video.play().catch(error => {
    console.error("Video autoplay failed or was blocked by the browser:", error);
    });
  }

  ngOnInit() {
    this.http.get<any[]>('https://railway.stepprojects.ge/api/stations')
      .subscribe(data => {
        this.stations = data;
      });
  }

  

searchTrains() {
  this.router.navigate(['/trains'], {
    queryParams: { from: this.from, to: this.to, date: this.date, passengers: this.passengers }
  });
}

}