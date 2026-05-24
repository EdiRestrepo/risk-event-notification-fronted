import type { RealTimeAlert } from '../../notification.service';
import { RiskAlertObserver } from './risk-alert-observer.interface';

/**
 * Subject del patrón Observer adaptado a Angular/RxJS.
 */
export interface RiskAlertSubject {
  attach(observer: RiskAlertObserver): () => void;
  publishAlert(alert: RealTimeAlert): void;
  removeAlert(alertId: string): void;
  clearAlerts(): void;
}
