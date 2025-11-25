import type { IAnimationStrategy } from './strategies/IAnimationStrategy'
import { SpiralAnimationStrategy } from './strategies/SpiralAnimationStrategy'
import { ChaosToOrderStrategy } from './strategies/ChaosToOrderStrategy'
import { WaveFieldStrategy } from './strategies/WaveFieldStrategy'
import { OrbitLettersStrategy } from './strategies/OrbitLettersStrategy'

const strategyRegistry: { [key: string]: new () => IAnimationStrategy } = {
  spiral: SpiralAnimationStrategy,
  chaos: ChaosToOrderStrategy,
  wave: WaveFieldStrategy,
  orbit: OrbitLettersStrategy,
}

export const availableStrategies: IAnimationStrategy[] = Object
  .values(strategyRegistry)
  .map(Strategy => new Strategy())

export function createAnimationStrategy(id: string): IAnimationStrategy {
  const StrategyClass = strategyRegistry[id]
  if(!StrategyClass){
    console.warn(`No strategy found for id: ${id}. Falling back to default.`)
    return new SpiralAnimationStrategy()
  }
  return new StrategyClass()
}

