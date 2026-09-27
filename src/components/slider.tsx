"use client"

import { Slider as SliderPrimitive } from "@base-ui/react"
import clsx from "clsx"
import "./slider.css"

const Slider = SliderPrimitive.Root

function SliderControl({
  className,
  ...props
}: SliderPrimitive.Control.Props) {
  return (
    <SliderPrimitive.Control
      data-slot="slider-control"
      className={clsx("tmap-slider-control", className)}
      {...props}
    />
  )
}

function SliderTrack({ className, ...props }: SliderPrimitive.Track.Props) {
  return (
    <SliderPrimitive.Track
      data-slot="slider-track"
      className={clsx("tmap-slider-track", className)}
      {...props}
    />
  )
}

function SliderIndicator({
  className,
  ...props
}: SliderPrimitive.Indicator.Props) {
  return (
    <SliderPrimitive.Indicator
      data-slot="slider-indicator"
      className={clsx("tmap-slider-indicator", className)}
      {...props}
    />
  )
}

function SliderThumb({ className, ...props }: SliderPrimitive.Thumb.Props) {
  return (
    <SliderPrimitive.Thumb
      data-slot="slider-thumb"
      className={clsx("tmap-slider-thumb", className)}
      {...props}
    />
  )
}

function SliderValue({ className, ...props }: SliderPrimitive.Value.Props) {
  return (
    <SliderPrimitive.Value
      data-slot="slider-value"
      className={clsx("tmap-slider-value", className)}
      {...props}
    />
  )
}

export { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack, SliderValue }
