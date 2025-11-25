import type { FC } from 'react'

export interface AnimationComponentProps {
  text: string
}

export interface IAnimationStrategy {
  readonly id: string
  readonly name: string
  getAnimationComponent(): FC<AnimationComponentProps>
  getControlComponent?(): FC | null
}

