import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const IMAGES = [
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png',
    bg: '#F4845F',
    panel: '#F79B7F',
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png',
    bg: '#6BBF7A',
    panel: '#85CC92',
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png',
    bg: '#E882B4',
    panel: '#ED9DC4',
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png',
    bg: '#6EB5FF',
    panel: '#8DC4FF',
  },
]

const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='noise'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(#noise)' opacity='0.08'/></svg>`
const GRAIN_URI = `url("data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}")`

const CAROUSEL_TRANSITION =
  'transform 650ms cubic-bezier(0.4,0,0.2,1), filter 650ms cubic-bezier(0.4,0,0.2,1), opacity 650ms cubic-bezier(0.4,0,0.2,1), left 650ms cubic-bezier(0.4,0,0.2,1)'

type Role = 'center' | 'left' | 'right' | 'back'

function getRoleStyle(role: Role, isMobile: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    aspectRatio: '0.6 / 1',
    transition: CAROUSEL_TRANSITION,
    willChange: 'transform, filter, opacity',
  }

  switch (role) {
    case 'center':
      return {
        ...base,
        transform: `translateX(-50%) scale(${isMobile ? 1.25 : 1.68})`,
        filter: 'none',
        opacity: 1,
        zIndex: 20,
        left: '50%',
        height: isMobile ? '60%' : '92%',
        bottom: isMobile ? '22%' : 0,
      }
    case 'left':
      return {
        ...base,
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(2px)',
        opacity: 0.85,
        zIndex: 10,
        left: isMobile ? '20%' : '30%',
        height: isMobile ? '16%' : '28%',
        bottom: isMobile ? '32%' : '12%',
      }
    case 'right':
      return {
        ...base,
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(2px)',
        opacity: 0.85,
        zIndex: 10,
        left: isMobile ? '80%' : '70%',
        height: isMobile ? '16%' : '28%',
        bottom: isMobile ? '32%' : '12%',
      }
    case 'back':
      return {
        ...base,
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(4px)',
        opacity: 1,
        zIndex: 5,
        left: '50%',
        height: isMobile ? '13%' : '22%',
        bottom: isMobile ? '32%' : '12%',
      }
  }
}

export function ToonHubHero() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    IMAGES.forEach(({ src }) => {
      const img = new Image()
      img.src = src
    })
  }, [])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const navigate = (direction: 'next' | 'prev') => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveIndex(prev => (direction === 'next' ? (prev + 1) % 4 : (prev + 3) % 4))
    timerRef.current = setTimeout(() => setIsAnimating(false), 650)
  }

  const getRole = (index: number): Role => {
    if (index === activeIndex) return 'center'
    if (index === (activeIndex + 3) % 4) return 'left'
    if (index === (activeIndex + 1) % 4) return 'right'
    return 'back'
  }

  return (
    <div
      style={{
        backgroundColor: IMAGES[activeIndex].bg,
        transition: 'background-color 650ms cubic-bezier(0.4,0,0.2,1)',
        fontFamily: 'Inter, sans-serif',
      }}
      className="relative w-full overflow-hidden"
    >
      <div style={{ height: '100vh', overflow: 'hidden' }} className="relative w-full">

        {/* Grain overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 50,
            backgroundImage: GRAIN_URI,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
            opacity: 0.4,
          }}
        />

        {/* Giant ghost text */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '18%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 'clamp(90px, 28vw, 380px)',
              fontWeight: 900,
              color: 'white',
              opacity: 1,
              lineHeight: 1,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            3D SHAPE
          </span>
        </div>

        {/* Top-left brand label */}
        <div className="absolute top-6 left-4 sm:left-8" style={{ zIndex: 60 }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'white',
              opacity: 0.9,
              letterSpacing: '0.18em',
            }}
          >
            TOONHUB
          </span>
        </div>

        {/* Carousel */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 3 }}>
          {IMAGES.map((img, index) => (
            <div key={index} style={getRoleStyle(getRole(index), isMobile)}>
              <img
                src={img.src}
                alt={`Character ${index + 1}`}
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'bottom center',
                }}
              />
            </div>
          ))}
        </div>

        {/* Bottom-left text + nav buttons */}
        <div
          className="absolute bottom-6 left-4 sm:bottom-20 sm:left-24"
          style={{ zIndex: 60, maxWidth: '320px' }}
        >
          <p
            className="mb-2 sm:mb-3 text-base sm:text-[22px] tracking-widest"
            style={{
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              color: 'white',
              opacity: 0.95,
            }}
          >
            TOONHUB FIGURINES
          </p>
          <p
            className="hidden sm:block text-xs sm:text-sm mb-4 sm:mb-5"
            style={{ color: 'white', opacity: 0.85, lineHeight: 1.6 }}
          >
            The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft
            is flawless. Many thanks! Wishing you the win. Order now.
          </p>
          <div className="flex gap-3">
            {(
              [
                { dir: 'prev', Icon: ArrowLeft },
                { dir: 'next', Icon: ArrowRight },
              ] as const
            ).map(({ dir, Icon }) => (
              <button
                key={dir}
                onClick={() => navigate(dir)}
                className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full"
                style={{
                  background: 'transparent',
                  border: '2px solid white',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'transform 150ms, background-color 150ms',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.08)'
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <Icon size={26} strokeWidth={2.25} />
              </button>
            ))}
          </div>
        </div>

        {/* Bottom-right DISCOVER IT link */}
        <div
          className="absolute bottom-6 right-4 sm:bottom-20 sm:right-10"
          style={{ zIndex: 60 }}
        >
          <a
            href="#"
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 'clamp(20px, 4vw, 56px)',
              fontWeight: 400,
              color: 'white',
              opacity: 0.95,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              textTransform: 'uppercase',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'opacity 200ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.95')}
          >
            DISCOVER IT
            <ArrowRight className="w-5 h-5 sm:w-8 sm:h-8" strokeWidth={2.25} />
          </a>
        </div>
      </div>
    </div>
  )
}
