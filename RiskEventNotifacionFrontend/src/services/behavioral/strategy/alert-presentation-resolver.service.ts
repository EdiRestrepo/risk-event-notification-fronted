import { Injectable } from '@angular/core';
import type { RealTimeAlert } from '../../models/risk-alert.model';
import { AlertPresentationStrategy, AlertPresentationViewModel } from './alert-presentation-strategy.interface';
import { EarthquakeRiskAlertStrategy } from './earthquake-risk-alert.strategy';
import { HurricaneRiskAlertStrategy } from './hurricane-risk-alert.strategy';
import { LandslideRiskAlertStrategy } from './landslide-risk-alert.strategy';
import { FloodRiskAlertStrategy } from './flood-risk-alert.strategy';
import { RainRiskAlertStrategy } from './rain-risk-alert.strategy';
import { DefaultRiskAlertStrategy } from './default-risk-alert.strategy';

/**
 * Contexto/resolvedor del patron Strategy.
 * Selecciona la estrategia concreta segun el tipo de evento recibido.
 */
@Injectable({ providedIn: 'root' })
export class AlertPresentationResolverService {
  private readonly strategies: AlertPresentationStrategy[] = [
    new EarthquakeRiskAlertStrategy(),
    new HurricaneRiskAlertStrategy(),
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
