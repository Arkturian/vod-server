import { create } from 'zustand'

interface AnimationState {
  text: string
  selectedStrategyId: string
  config: Record<string, any>
  setText: (text: string) => void
  setStrategy: (id: string) => void
  setConfig: (newConfig: Record<string, any>) => void
}

export const useAnimationStore = create<AnimationState>((set) => ({
  text: 'Genial',
  selectedStrategyId: 'spiral',
  config: { tightness: 5 },
  setText: (text) => set({ text }),
  setStrategy: (id) => set({ selectedStrategyId: id, config: {} }),
  setConfig: (newConfig) => set((state) => ({ config: { ...state.config, ...newConfig } })),
}))

