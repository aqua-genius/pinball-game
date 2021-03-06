import { Rect, Circle } from './shapes'
import { unimplemented, playground } from './common'

export type Action = () => void

export type GameT = {
  fps: (v?: number) => number
  drawRect: (rect: Rect, style: string) => void
  drawCircle: (circle: Circle, style: string) => void
  registerKeyPressedAction: (key: string, action: Action) => void
  listenKeyPressing: () => void
  mutate: () => void
  draw: () => void
  pauseOrStart: () => void
}

export const Game = () => {
  const self = {} as GameT

  const states = {
    actions: {
      pressed: {} as { [key: string]: Action },
      press: {} as { [key: string]: Action },
    },
    keys: {
      pressed: {} as { [key: string]: boolean },
    },
    paused: true,
    fps: 100,
  }

  const context = playground.getContext('2d') as CanvasRenderingContext2D

  self.fps = v => {
    if (v) states.fps = v
    return states.fps
  }

  self.drawRect = (rect, style = '') => {
    context.fillStyle = style
    context.fillRect(rect.x, rect.y, rect.w, rect.h)
    context.fillStyle = ''
  }

  self.drawCircle = (circle, style = '') => {
    context.fillStyle = style
    context.beginPath()
    context.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI)
    context.fill()
    context.fillStyle = ''
  }

  self.registerKeyPressedAction = (key, action) => {
    states.actions.pressed[key] = action
  }

  const executeKeyPressedActions = () => {
    Object.entries(states.actions.pressed).forEach(([key, action]) => {
      if (states.keys.pressed[key]) action()
    })
  }

  self.listenKeyPressing = () => {
    window.addEventListener('keydown', event => states.keys.pressed[event.key] = true)
    window.addEventListener('keyup', event => states.keys.pressed[event.key] = false)
  }

  self.mutate = unimplemented('game.mutate')

  const clear = () => context.clearRect(0, 0, playground.width, playground.height)

  self.draw = unimplemented('game.draw')

  const loop = () => {
    executeKeyPressedActions()
    self.mutate()
    clear()
    self.draw()
    if (!states.paused) setTimeout(loop, 1000 / states.fps)
  }

  const start = () => {
    states.paused = false
    loop()
  }

  const pause = () => {
    states.paused = true
  }

  self.pauseOrStart = () => {
    if (states.paused) start()
    else pause()
  }

  return self
}
