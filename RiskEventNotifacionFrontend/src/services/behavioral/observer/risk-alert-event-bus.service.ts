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

  /** Flujo principal de alertas activas para componentes Angular. */
  readonly alerts$: Observable<RealTimeAlert[]> = this.alertsSubject.asObservable();

  /** Flujo derivado para badges, contadores y menus. */
  readonly alertCount$: Observable<number> = this.alerts$.pipe(
    map(alerts => alerts.length)
  );

  /** Adaptacion explicita GoF: registra un observador imperativo. */
  attach(observer: RiskAlertObserver): () => void {
    const subscription = this.alerts$.subscribe(alerts => observer.update(alerts));
    return () => subscription.unsubscribe();
  }

  publishAlert(alert: RealTimeAlert): void {
    this.alertsSubject.next([alert, ...this.alertsSubject.value]);
  }

  removeAlert(alertId: string): void {
    const updatedAlerts = this.alertsSubject.value.filter(alert => alert.id !== alertId);
    this.alertsSubject.next(updatedAlerts);
  }

  clearAlerts(): void {
    this.alertsSubject.next([]);
  }

  getSnapshot(): RealTimeAlert[] {
    return [...this.alertsSubject.value];
  }
}
