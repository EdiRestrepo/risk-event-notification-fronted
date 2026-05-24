import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { RealTimeAlert } from '../../notification.service';
import { RiskAlertSubject } from './risk-alert-subject.interface';
import { RiskAlertObserver } from './risk-alert-observer.interface';

/**
 * RiskAlertEventBusService - Patron Observer
 *
 * Rol en el patron:
 * - Subject concreto: mantiene la lista de alertas activas.
 * - Notifica a todos los observadores mediante alerts$ y alertCount$.
 * - Desacopla la llegada de alertas por SignalR de la forma en que los
 *   componentes las muestran en pantalla.
 */
@Injectable({ providedIn: 'root' })
export class RiskAlertEventBusService implements RiskAlertSubject {
  private readonly alertsSubject = new BehaviorSubject<RealTimeAlert[]>([]);

  /** Lista explícita de observadores (Patrón GoF): */
  private subscribers: RiskAlertObserver[] = [];

  /** Flujo principal de alertas activas para componentes Angular. */
  readonly alerts$: Observable<RealTimeAlert[]> = this.alertsSubject.asObservable();

  /** Flujo derivado para badges, contadores y menus. */
  readonly alertCount$: Observable<number> = this.alerts$.pipe(
    map(alerts => alerts.length)
  );

  /**
   * Registra un observador en la lista central (Patrón GoF).
   * Retorna función para desuscribirse.
   */
  attach(observer: RiskAlertObserver): () => void {
    if (!this.subscribers.includes(observer)) {
      this.subscribers.push(observer);
    }
    return () => this.unsubscribe(observer);
  }

  /**
   * Remueve un observador de la lista central (Patrón GoF).
   */
  private unsubscribe(observer: RiskAlertObserver): void {
    const index = this.subscribers.indexOf(observer);
    if (index > -1) {
      this.subscribers.splice(index, 1);
    }
  }

  /**
   * Notifica a todos los observadores registrados (Patrón GoF).
   * Se invoca cuando el estado (alertas) cambia.
   */
  private notifySubscribers(): void {
    const currentAlerts = this.alertsSubject.value;
    this.subscribers.forEach(subscriber => subscriber.update(currentAlerts));
  }

  publishAlert(alert: RealTimeAlert): void {
    this.alertsSubject.next([alert, ...this.alertsSubject.value]);
    this.notifySubscribers();
  }

  removeAlert(alertId: string): void {
    const updatedAlerts = this.alertsSubject.value.filter(alert => alert.id !== alertId);
    this.alertsSubject.next(updatedAlerts);
    this.notifySubscribers();
  }

  clearAlerts(): void {
    this.alertsSubject.next([]);
    this.notifySubscribers();
  }

  getSnapshot(): RealTimeAlert[] {
    return [...this.alertsSubject.value];
  }

  /**
   * Obtiene la cantidad actual de observadores suscritos.
   */
  getSubscriberCount(): number {
    return this.subscribers.length;
  }
}
