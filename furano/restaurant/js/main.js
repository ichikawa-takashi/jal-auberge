// 2ndビューの下の余白を調整する前のjs

history.scrollRestoration = 'manual'


//------------------------------------
// Lenis スムーススクロール
//------------------------------------

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({
  duration: 1.6,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  wheelMultiplier: 0.8,
});

lenis.on('scroll', ScrollTrigger.update);

// Google Maps iframe上ではLenisを一時停止
const mapIframe = document.querySelector('.access__body iframe')
if (mapIframe) {
  mapIframe.addEventListener('mouseenter', () => lenis.stop())
  mapIframe.addEventListener('mouseleave', () => lenis.start())
}

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
const main = document.querySelector('.main')
const footer = document.querySelector('.footer__inner')


/** ハンバーガー */

const nav = document.getElementById('nav')
const hamburger = document.querySelector('.header__hamburger')

function openMenu() {
  if (!hamburger || !nav) return
  hamburger.classList.add('is-active')
  nav.classList.add('is-active')
  document.body.style.overflow = 'hidden'
  lenis.stop()
}

function closeMenu() {
  if (!hamburger || !nav) return
  hamburger.classList.remove('is-active')
  nav.classList.remove('is-active')
  document.body.style.overflow = 'auto'
  lenis.start()
}

if (hamburger) {
  hamburger.addEventListener('click', () => {
    if (hamburger.classList.contains('is-active')) {
      closeMenu()
    } else {
      openMenu()
    }
  })
}

const mqHeader = window.matchMedia('(min-width: 768px)')
mqHeader.addEventListener('change', () => {
  if (!hamburger || !nav) return
  nav.style.transition = 'none'
  nav.offsetHeight
  if (mqHeader.matches) {
    closeMenu()
  }
  requestAnimationFrame(() => {
    nav.style.transition = ''
  })
})

gsap.fromTo(
  footer,
  { y: 100 },
  {
    y: 0,
    scrollTrigger: {
      trigger: main,
      start: '100% 100%',
      scrub: true,
    },
  },
)

// スムーススクロール

document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href^="#"]')
  if (!anchor) return

  const id = anchor.getAttribute('href')
  if (!id || id === '#') return

  const target = document.querySelector(id)
  if (!target) return

  e.preventDefault()
  closeMenu()
  lenis.scrollTo(target, { duration: 1.2 })

  const removeHash = () => {
    if (history.replaceState) {
      history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search,
      )
    }
  }
  setTimeout(removeHash, 1200)
})




//------------------------------------
// フッターの位置を固定
//------------------------------------

// const BREAKPOINT_PC = 768
function setMainPaddingTop() {
  const header = document.querySelector('.header__inner')
  const main = document.querySelector('.main')
  if (!header || !main) return
  const offset = window.matchMedia('(min-width: 768px)').matches ? 16 : 10
  main.style.paddingTop = `${header.offsetHeight + offset}px`
}

setMainPaddingTop()
window.addEventListener('resize', setMainPaddingTop)

function setMainMarginByFooter() {
  const footer = document.querySelector('.footer')
  const main = document.querySelector('.main')
  if (!footer || !main) return
    main.style.marginBottom = `${footer.offsetHeight}px`
}

setMainMarginByFooter()
window.addEventListener('resize', setMainMarginByFooter)


// ──────────────────────────────────────
// 無限スライダー（SP限定）
// ──────────────────────────────────────

function initInfiniteSlider(sliderSelector, trackClassName) {
  const slider = document.querySelector(sliderSelector)
  if (!slider) return

  const items = Array.from(slider.children)
  if (!items.length) return

  const track = document.createElement('div')
  track.className = trackClassName

  items.forEach((item) => track.appendChild(item))
  items.forEach((item) => track.appendChild(item.cloneNode(true)))

  slider.appendChild(track)

  const BASE_SPEED = 0.5
  const SCROLL_BOOST = 0.03
  const DECAY = 0.92

  let pos = 0
  let boost = 0
  let isPaused = false
  let lastScrollY = window.scrollY

  window.addEventListener(
    'scroll',
    () => {
      boost += (window.scrollY - lastScrollY) * SCROLL_BOOST
      lastScrollY = window.scrollY
    },
    { passive: true },
  )

  const pauseBtn = slider.closest('.gastronomy__ingredients-slider-wrapper')?.querySelector('[data-slider-btn]')
  if (pauseBtn) {
    pauseBtn.classList.add('is-playing')
    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused
      pauseBtn.classList.toggle('is-playing', !isPaused)
      pauseBtn.setAttribute('aria-label', isPaused ? 'スライダーを再生' : 'スライダーを一時停止')
    })
  }

  requestAnimationFrame(() => {
    let setWidth =
      track.children[items.length].getBoundingClientRect().left -
      track.children[0].getBoundingClientRect().left

    const extraSets = Math.ceil(window.innerWidth / setWidth)
    for (let i = 1; i < extraSets; i++) {
      items.forEach((item) => track.appendChild(item.cloneNode(true)))
    }

    requestAnimationFrame(() => {
      setWidth =
        track.children[items.length].getBoundingClientRect().left -
        track.children[0].getBoundingClientRect().left

      const totalSets = track.children.length / items.length
      const minSets = Math.ceil(window.innerWidth / setWidth) + 2
      if (totalSets < minSets) {
        for (let i = totalSets; i < minSets; i++) {
          items.forEach((item) => track.appendChild(item.cloneNode(true)))
        }
      }

      ;(function tick() {
        if (!isPaused) {
          pos -= BASE_SPEED + boost
          boost *= DECAY
          if (Math.abs(boost) < 0.01) boost = 0

          if (pos <= -setWidth + 0.5) pos += setWidth
          if (pos > 0.5) pos -= setWidth

          track.style.transform = `translateX(${pos}px)`
        }
        requestAnimationFrame(tick)
      })()
    })
  })
}

if (window.matchMedia('(max-width: 767px)').matches) {
  initInfiniteSlider('.gastronomy__ingredients-slider', 'gastronomy__ingredients-slider-track')
}

const fv = document.querySelector('.fv')
const message = document.querySelector('.message')

//------------------------------------
// .js-fadeIn スクロールフェードイン
//------------------------------------

// 即時: フラッシュ防止のため先に非表示にする
gsap.utils.toArray('.js-fadeIn, .js-fadeIn-delay, .js-fadeIn-delay-pc').forEach((el) => {
  gsap.set(el, { opacity: 0, y: 0 })
})

gsap.utils.toArray('.js-image-stagger').forEach((container) => {
  if (getComputedStyle(container).display === 'none') return
  const figures = container.querySelectorAll('figure')
  gsap.set(figures, { opacity: 0, y: 0 })
})

// lazy画像の読み込み完了後に正しい位置でScrollTriggerを初期化
window.addEventListener('load', () => {
  const isPC = window.matchMedia('(min-width: 768px)').matches

  gsap.utils.toArray('.js-fadeIn').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
    })
  })

  gsap.utils.toArray('.js-fadeIn-delay').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: 'power2.out',
      delay: 0.2,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
    })
  })

  gsap.utils.toArray('.js-fadeIn-delay-pc').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: 'power2.out',
      delay: isPC ? 0.2 : 0,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
    })
  })

  // .js-image-stagger: コンテナ内のfigureを上から順に0.2sずつずらしてフェードイン
  // display: none のコンテナ（SP非表示のPC用リスト等）はスキップ
  gsap.utils.toArray('.js-image-stagger').forEach((container) => {
    if (getComputedStyle(container).display === 'none') return
    const figures = container.querySelectorAll('figure')
    if (!figures.length) return
    gsap.to(figures, {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: 'none',
      stagger: 0.2,
      scrollTrigger: {
        trigger: container,
        start: 'top 88%',
        once: true,
      },
    })
  })

  // lazy画像が後から読み込まれてレイアウトが変わった時に再計算（デバウンス）
  let refreshTimer
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    if (img.complete) return
    img.addEventListener('load', () => {
      clearTimeout(refreshTimer)
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 100)
    })
  })
})


gsap.fromTo( fv,
  {
    opacity: 1,
  },
  {
    opacity: 0, 
    pointerEvents: 'none',
    scrollTrigger: {
      trigger: message,
      start: 'bottom 0%',
      scrub: true,
    },
  },
)