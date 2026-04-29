import * as signalR from '@microsoft/signalr';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private hubConnection!: signalR.HubConnection;

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44357/notificationHub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Conectado'));
  }

  receiveNotifications() {
    this.hubConnection.on('ReceiveNotification', (message) => {
      alert("Nueva notificación "+ message);
      console.log('Nueva notificación:', message);
    });
  }
}
