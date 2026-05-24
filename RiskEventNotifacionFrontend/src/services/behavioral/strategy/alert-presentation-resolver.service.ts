import { Injectable } from '@angular/core';
import type { RealTimeAlert } from '../../notification.service';
import { AlertPresentationStrategy, AlertPresentationViewModel } from './alert-presentation-strategy.interface';
import { LandslideRiskAlertStrategy } from './landslide-risk-alert.strategy';
import { FloodRiskAlertStrategy } from './flood-risk-alert.strategy';
import { RainRiskAlertStrategy } from './rain-risk-alert.strategy';
import { DefaultRiskAlertStrategy } from './default-risk-alert.strategy';

/**
 * Contexto/resolvedor del patron Strategy.
 * Selecciona la estrategia concreta segun el contenido de la alerta.
 */
@Injectable({ providedIn: 'root' })
export class AlertPresentationResolverService {
  private readonly strategies: AlertPresentationStrategy[] = [
    new LandslideRiskAlertStrategy(),
    new FloodRiskAlertStrategy(),
    new RainRiskAlertStrategy(),
    new DefaultRiskAlertStrategy()
  ];

  resolve(alert: RealTimeAlert): AlertPresentationViewModel {
    const strategy = this.strategies.find(item => item.canHandle(alert));
    return strategy!.buildViewModel(alert);
  }

  resolveMany(alerts: RealTimeAlert[]): AlertPresentationViewModel[] {
    return alerts.map(alert => this.resolve(alert));
  }
}
