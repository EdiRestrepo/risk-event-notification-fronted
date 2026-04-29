import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('RiskEventNotifacionFrontend');
  constructor(
      private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.notificationService.startConnection();
    this.notificationService.receiveNotifications();
  }
}

