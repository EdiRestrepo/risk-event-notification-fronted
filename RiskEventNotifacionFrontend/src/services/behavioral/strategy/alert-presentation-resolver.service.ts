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

  /** Estrategia actual (patrón GoF): */
  private currentStrategy: AlertPresentationStrategy | null = null;

  /**
   * Establece la estrategia actual (Patrón GoF).
   * Permite cambiar la estrategia en tiempo de ejecución.
   * @param strategy - Estrategia concreta a usar
   */
  setStrategy(strategy: AlertPresentationStrategy): void {
    this.currentStrategy = strategy;
  }

  /**
   * Ejecuta la estrategia actual sobre una alerta (Patrón GoF).
   * Equivalente a doSomething() del patrón clásico.
   * @param alert - Alerta a procesar
   * @returns ViewModel generado por la estrategia actual
   */
  execute(alert: RealTimeAlert): AlertPresentationViewModel {
    if (!this.currentStrategy) {
      // Si no hay estrategia establecida, usar auto-discovery
      return this.resolve(alert);
    }
    return this.currentStrategy.buildViewModel(alert);
  }

  /**
   * Auto-descubre y resuelve la estrategia correcta para una alerta.
   * Busca la primera estrategia que pueda manejar la alerta.
   * @param alert - Alerta a procesar
   * @returns ViewModel generado por la estrategia apropiada
   */
  resolve(alert: RealTimeAlert): AlertPresentationViewModel {
    const strategy = this.strategies.find(item => item.canHandle(alert));
    return strategy!.buildViewModel(alert);
  }

  /**
   * Procesa múltiples alertas resolviendo la estrategia para cada una.
   * @param alerts - Array de alertas
   * @returns Array de ViewModels
   */
  resolveMany(alerts: RealTimeAlert[]): AlertPresentationViewModel[] {
    return alerts.map(alert => this.resolve(alert));
  }

  /**
   * Obtiene la estrategia actual establecida.
   * @returns Estrategia actual o null si no está establecida
   */
  getCurrentStrategy(): AlertPresentationStrategy | null {
    return this.currentStrategy;
  }

  /**
   * Resetea a la estrategia actual a null (auto-discovery).
   */
  resetStrategy(): void {
    this.currentStrategy = null;
  }

  /**
   * Obtiene la lista de estrategias disponibles.
   * @returns Array de estrategias
   */
  getAvailableStrategies(): AlertPresentationStrategy[] {
    return [...this.strategies];
  }
}
