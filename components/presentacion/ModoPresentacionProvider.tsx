'use client'

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'

export interface SlideDescriptor {
  href: string
  title: string
}

interface ModoPresentacionContextValue {
  isActive: boolean
  slides: SlideDescriptor[]
  currentSlideIndex: number
  setSlides: (slides: SlideDescriptor[]) => void
  setCurrentSlideIndex: (i: number) => void
  activar: () => void
  desactivar: () => void
  goToSlide: (index: number) => void
  nextSlide: () => void
  prevSlide: () => void
}

const ModoPresentacionContext =
  createContext<ModoPresentacionContextValue | null>(null)

export function useModoPresentacion() {
  const ctx = useContext(ModoPresentacionContext)
  if (!ctx)
    throw new Error(
      'useModoPresentacion debe usarse dentro de ModoPresentacionProvider'
    )
  return ctx
}

export function ModoPresentacionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isActive, setIsActive] = useState(false)
  const [slides, setSlides] = useState<SlideDescriptor[]>([])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  const activar = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen()
    } catch {
      /* noop */
    }
    setIsActive(true)
  }, [])

  const desactivar = useCallback(() => {
    if (document.fullscreenElement)
      document.exitFullscreen().catch(() => {
        /* noop */
      })
    setIsActive(false)
  }, [])

  const goToSlide = useCallback(
    (index: number) => {
      if (slides.length === 0) return
      const clamped = Math.max(0, Math.min(slides.length - 1, index))
      setCurrentSlideIndex(clamped)
      const slide = slides[clamped]
      if (slide) router.push(slide.href)
    },
    [slides, router]
  )

  const nextSlide = useCallback(
    () => goToSlide(currentSlideIndex + 1),
    [goToSlide, currentSlideIndex]
  )
  const prevSlide = useCallback(
    () => goToSlide(currentSlideIndex - 1),
    [goToSlide, currentSlideIndex]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      if (
        e.key === 'ArrowRight' ||
        e.key === 'ArrowDown' ||
        (isActive && e.key === ' ')
      ) {
        e.preventDefault()
        nextSlide()
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        prevSlide()
      }
      if (isActive) {
        if (e.key === 'Escape') desactivar()
        if (e.key === 'Home') goToSlide(0)
        if (e.key === 'End') goToSlide(slides.length - 1)
      }
      if (!isActive && (e.key === 'f' || e.key === 'F')) {
        activar()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    isActive,
    nextSlide,
    prevSlide,
    desactivar,
    activar,
    goToSlide,
    slides.length,
  ])

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setIsActive(false)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () =>
      document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  return (
    <ModoPresentacionContext.Provider
      value={{
        isActive,
        slides,
        currentSlideIndex,
        setSlides,
        setCurrentSlideIndex,
        activar,
        desactivar,
        goToSlide,
        nextSlide,
        prevSlide,
      }}
    >
      {children}
    </ModoPresentacionContext.Provider>
  )
}
