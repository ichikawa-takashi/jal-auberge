// 2ndビューの下の余白を調整する前のjs

gsap.registerPlugin(ScrollTrigger)
const main = document.querySelector('.main')
const footer = document.querySelector('.footer__inner')

// // ──────────────────────────────────────
// // ローダー（幕が上に消える）
// // ──────────────────────────────────────
;(function () {
  const loader = document.querySelector('.loader')
  if (!loader) return

  document.body.style.overflow = 'hidden'
  const loaderStartDelay = 0.3 + 0.9 + 1.5 // 1.4s
  const loaderDuration = 6
  window.__loaderEndTime = performance.now() + (loaderStartDelay + loaderDuration) * 1000

  const tl = gsap.timeline({ delay: loaderStartDelay })
  tl.to(loader, {
    duration: loaderDuration,
    ease: 'power4.out',
    yPercent: -100,
  })
  tl.call(
    () => {
      document.body.style.overflow = ''
    },
    null,
    2.8 * 0.3,
  )
  tl.call(
    () => {
      document.body.classList.remove('is-loading')
    },
    null,
    .1,
  )
})()

// // ──────────────────────────────────────
// //  テキスト（loadText）アニメーション（幕が上に消える）
// // ──────────────────────────────────────
;(function () {
  const loadText = document.querySelector('.load-text')
  if (!loadText) return

  const subEl = loadText.querySelector('.load-text__sub')
  const mainEl = loadText.querySelector('.load-text__main')
  if (!subEl || !mainEl) return

  function wrapChars(el) {
    const text = el.textContent
    el.textContent = ''
    for (const char of text) {
      const outer = document.createElement('span')
      outer.className = 'load-text__char'
      const inner = document.createElement('span')
      inner.className = 'load-text__char-inner'
      inner.textContent = char
      outer.appendChild(inner)
      el.appendChild(outer)
    }
  }

  wrapChars(subEl)
  wrapChars(mainEl)

  const chars = loadText.querySelectorAll('.load-text__char-inner')

  // 初期状態：文字は下に隠れている
  gsap.set(chars, { yPercent: 100 })
  gsap.set(loadText, { opacity: 1 })
  const tl = gsap.timeline({ delay: 0.3 })

  // 順番に下から上に出てくる
  tl.to(chars, {
    yPercent: 0,
    duration: 0.9,
    stagger: 0.06,
    ease: 'power4.out',
  })

  // 最後にフェードアウトして見えなくする（文字アニメ終了後に少し表示してから消す）
  tl.to(
    loadText,
    {
      autoAlpha: 0,
      duration: 0.2,
      ease: 'power2.out',
    },
    '+=1',
  )
})()

// ──────────────────────────────────────
// FV clip-path スライダー
// ──────────────────────────────────────
;(function () {
  const fv = document.querySelector('.fv')
  const slider = document.querySelector('.fv__slider')
  if (!slider) return

  const slides = Array.from(slider.querySelectorAll('.fv__slide'))
  if (slides.length < 2) return

  const images = slides.map((s) => s.querySelector('.fv__image'))
  const pagination = fv.querySelector('.fv__pagination')
  const pauseBtn = fv.querySelector('.fv__control-button')

  const DISPLAY = 4
  const WIPE = 1.5
  const SCALE_FROM = 1.0
  const SCALE_TO = 1.08

  // スライダー開始タイミング（秒）。1 = 1秒後 / ローダー後にしたい場合は 3.5 などに
  const SLIDER_START_DELAY_SEC = 3
  const startTime = performance.now() + SLIDER_START_DELAY_SEC * 1000

  let current = 0
  let isPaused = false
  let isWiping = false
  let elapsed = 0
  let prevTime = null
  let activeTweens = []
  const imageTweens = slides.map(() => null)

  // ページネーション生成
  const paginationItems = slides.map(() => {
    const item = document.createElement('span')
    item.className = 'fv__pagination-item'
    pagination.appendChild(item)
    return item
  })

  function updatePagination(activeIndex, progress) {
    paginationItems.forEach((item, i) => {
      if (i < activeIndex) {
        item.style.setProperty('--progress', 1)
      } else if (i === activeIndex) {
        item.style.setProperty('--progress', Math.min(progress, 1))
      } else {
        item.style.setProperty('--progress', 0)
      }
    })
  }

  function killActiveTweens() {
    activeTweens.forEach((t) => t.kill())
    activeTweens = []
  }

  // 初期状態（表示中だけ zIndex 2、他は 0 にして DOM 順の重なりを防ぐ）
  slides.forEach((slide, i) => {
    gsap.set(slide, { clipPath: 'inset(0% 0% 0% 0%)', zIndex: i === 0 ? 2 : 0 })
    gsap.set(images[i], { scale: SCALE_FROM })
  })
  updatePagination(0, 0)

  imageTweens[0] = gsap.to(images[0], {
    scale: SCALE_TO,
    duration: DISPLAY + WIPE,
    delay: SLIDER_START_DELAY_SEC,
    ease: 'none',
  })

  function wipe() {
    isWiping = true
    killActiveTweens()

    const ci = current
    const ni = (current + 1) % slides.length

    // 今のスライド(ci)以外は一旦 zIndex 0。次(ni)だけ 2 にして「直下の1枚」にする
    // （ni 以外を 1 のままにすると DOM 順で後ろのスライドが上に出て一瞬見える）
    slides.forEach((slide, i) => {
      if (i !== ci && i !== ni) gsap.set(slide, { zIndex: 0 })
    })
    gsap.set(slides[ni], { clipPath: 'inset(0% 0% 0% 0%)', zIndex: 2 })
    gsap.set(images[ni], { scale: SCALE_FROM })
    gsap.set(slides[ci], { zIndex: 3 })

    imageTweens[ni] = gsap.to(images[ni], {
      scale: SCALE_TO,
      duration: WIPE + DISPLAY + WIPE,
      ease: 'none',
    })

    activeTweens.push(
      gsap.to(slides[ci], {
        clipPath: 'inset(0% 0% 0% 100%)',
        duration: WIPE,
        ease: 'power3.inOut',
        onComplete() {
          if (imageTweens[ci]) { imageTweens[ci].kill(); imageTweens[ci] = null }
          gsap.set(slides[ci], { zIndex: 0 })
          gsap.set(images[ci], { scale: SCALE_FROM })
          gsap.set(slides[ni], { zIndex: 2 })
          current = ni
          elapsed = 0
          prevTime = null
          isWiping = false
        },
      }),
    )
  }

  // メインループ: 進捗バーのリアルタイム更新
  function tick(timestamp) {
    if (timestamp < startTime) {
      requestAnimationFrame(tick)
      return
    }
    if (!isPaused && !isWiping) {
      if (prevTime !== null) {
        elapsed += (timestamp - prevTime) / 1000
      }
      prevTime = timestamp

      updatePagination(current, elapsed / DISPLAY)

      if (elapsed >= DISPLAY) {
        wipe()
      }
    } else if (!isPaused && isWiping) {
      updatePagination(current, 1)
      prevTime = null
    } else {
      prevTime = null
    }
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)

  // 一時停止ボタン
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused
      pauseBtn.classList.toggle('is-paused', isPaused)
      pauseBtn.setAttribute('aria-label', isPaused ? '再生' : '一時停止')

      activeTweens.forEach((t) => (isPaused ? t.pause() : t.resume()))
      imageTweens.forEach((t) => t && (isPaused ? t.pause() : t.resume()))
    })
  }
})()

// ──────────────────────────────────────
// FAQ accordion
// ──────────────────────────────────────
document.querySelectorAll('.faq__item').forEach((details) => {
  const summary = details.querySelector('.faq__question')
  const answer = details.querySelector('.faq__answer')

  if (details.open) {
    answer.style.height = answer.scrollHeight + 'px'
  }

  summary.addEventListener('click', (e) => {
    e.preventDefault()

    if (details.open) {
      answer.style.height = answer.scrollHeight + 'px'
      requestAnimationFrame(() => {
        answer.style.height = '0'
      })
      answer.addEventListener(
        'transitionend',
        () => {
          details.removeAttribute('open')
        },
        { once: true },
      )
    } else {
      details.setAttribute('open', '')
      const targetHeight = answer.scrollHeight
      answer.style.height = '0'
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          answer.style.height = targetHeight + 'px'
        })
      })
      answer.addEventListener(
        'transitionend',
        () => {
          answer.style.height = 'auto'
        },
        { once: true },
      )
    }
  })
})

// ──────────────────────────────────────
// 無限スライダー（共通）
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

  const pauseBtn = slider.closest('section').querySelector('.control-button')
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused
      pauseBtn.classList.toggle('is-paused', isPaused)
      pauseBtn.setAttribute('aria-label', isPaused ? '再生' : '一時停止')
    })
  }

  requestAnimationFrame(() => {
    // サブピクセル精度で1セット分の幅を取得（2セット時点で計測）
    let setWidth =
      track.children[items.length].getBoundingClientRect().left -
      track.children[0].getBoundingClientRect().left

    // 画面幅を埋めるのに十分なクローンを追加（広いウィンドウでも余裕を持たせる）
    const extraSets = Math.ceil(window.innerWidth / setWidth)
    for (let i = 1; i < extraSets; i++) {
      items.forEach((item) => track.appendChild(item.cloneNode(true)))
    }

    // クローン追加後、レイアウト完了を待ってから setWidth を再計測しアニメ開始
    // （広いウィンドウでは DOM 追加後の reflow が次のフレームになることがある）
    requestAnimationFrame(() => {
      setWidth =
        track.children[items.length].getBoundingClientRect().left -
        track.children[0].getBoundingClientRect().left

      // 安全のためセット数を1つ多めに確保（サブピクセル・計測ずれ対策）
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

          // リセット条件に小さな余裕を持たせて浮動小数点のずれで途切れないようにする
          if (pos <= -setWidth + 0.5) pos += setWidth
          if (pos > 0.5) pos -= setWidth

          track.style.transform = `translateX(${pos}px)`
        }
        requestAnimationFrame(tick)
      })()
    })
  })
}

initInfiniteSlider('.spot__slider', 'spot__slider-track')
initInfiniteSlider('.stay__slider', 'stay__slider-track')
initInfiniteSlider('.shop__slider', 'shop__slider-track')

// スライダーの非同期クローン追加完了後に ScrollTrigger を再計算
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
  })
})

/** ハンバーガー */

const nav = document.getElementById('nav')
const hamburger = document.querySelector('.header__hamburger')

function openMenu() {
  hamburger.classList.add('is-active')
  nav.classList.add('is-active')
  document.body.style.overflow = 'hidden'
}

function closeMenu() {
  hamburger.classList.remove('is-active')
  nav.classList.remove('is-active')
  document.body.style.overflow = 'auto'
}

hamburger.addEventListener('click', () => {
  if (hamburger.classList.contains('is-active')) {
    closeMenu()
  } else {
    openMenu()
  }
})

const mqHeader = window.matchMedia('(min-width: 768px)')
mqHeader.addEventListener('change', () => {
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
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const removeHash = () => {
    if (history.replaceState) {
      history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search,
      )
    }
  }
  const scrollDuration = 600
  closeMenu()
  setTimeout(removeHash, scrollDuration)
})

// メッセージセクション PC用
;(function () {
  const mqPc = window.matchMedia('(min-width: 768px)')
  const mainTitle = document.querySelector('.title-main')
  const concept = document.getElementById('concept')
  const conceptText = document.querySelector('.message__text')
  if (!concept || !conceptText || !mainTitle) return

  let pinTrigger = null
  let conceptTextTrigger = null
  let mainTitleTrigger = null
  let conceptTextScrollListener = null
  let conceptTextRafId = null
  let mainTitleRafId = null
  let scrollYAtEnter = 0
  let released = false
  let prevMainAbove = true
  let mainTitleStarted = null
  let mainTitleScrollHandler = null
  let savedTop = null

  function destroyPc() {
    if (pinTrigger) {
      pinTrigger.kill()
      pinTrigger = null
    }
    if (conceptTextTrigger) {
      conceptTextTrigger.kill()
      conceptTextTrigger = null
    }
    if (mainTitleTrigger) {
      mainTitleTrigger.kill()
      mainTitleTrigger = null
    }
    if (conceptTextScrollListener) {
      window.removeEventListener('scroll', conceptTextScrollListener, {
        passive: true,
      })
      conceptTextScrollListener = null
    }
    if (mainTitleScrollHandler) {
      window.removeEventListener('scroll', mainTitleScrollHandler, {
        passive: true,
      })
      mainTitleScrollHandler = null
    }
    if (conceptTextRafId != null) {
      cancelAnimationFrame(conceptTextRafId)
      conceptTextRafId = null
    }
    if (mainTitleRafId != null) {
      cancelAnimationFrame(mainTitleRafId)
      mainTitleRafId = null
    }
    conceptText.style.removeProperty('transform')
    mainTitle.style.removeProperty('position')
    mainTitle.style.removeProperty('top')
    mainTitle.style.removeProperty('left')
    mainTitle.style.removeProperty('width')
    released = false
    prevMainAbove = true
    mainTitleStarted = null
    savedTop = null
  }

  function createPc() {
    if (pinTrigger) return

    pinTrigger = ScrollTrigger.create({
      trigger: concept,
      start: 'top top',
      endTrigger: conceptText,
      end: 'top 300',
      pin: true,
    })

    conceptTextTrigger = ScrollTrigger.create({
      trigger: conceptText,
      start: () => `top ${mainTitle.getBoundingClientRect().top}px`,
      onEnter: () => {
        if (released) return
        released = true
        scrollYAtEnter = window.scrollY
        conceptTextScrollListener = () => {
          if (conceptTextRafId != null) return
          conceptTextRafId = requestAnimationFrame(() => {
            conceptTextRafId = null
            const dy = window.scrollY - scrollYAtEnter
            conceptText.style.transform = `translateY(-${dy}px)`
          })
        }
        window.addEventListener('scroll', conceptTextScrollListener, {
          passive: true,
        })
        conceptTextScrollListener()
      },
    })

    mainTitleTrigger = ScrollTrigger.create({
      trigger: concept,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: () => {
        const mainTop = mainTitle.getBoundingClientRect().top
        const conceptTextTop = conceptText.getBoundingClientRect().top
        const mainAbove = mainTop <= conceptTextTop

        if (prevMainAbove && !mainAbove) {
          if (mainTitleStarted === null) {
            mainTitleStarted = true
            const rect = mainTitle.getBoundingClientRect()
            savedTop = rect.top
            mainTitle.style.position = 'fixed'
            mainTitle.style.top = rect.top + 'px'
            mainTitle.style.left = rect.left + 'px'
            mainTitle.style.width = rect.width + 'px'
            mainTitleScrollHandler = () => {
              if (mainTitleStarted === null) return
              if (mainTitleRafId != null) return
              mainTitleRafId = requestAnimationFrame(() => {
                mainTitleRafId = null
                if (mainTitleStarted === null) return
                const ct = conceptText.getBoundingClientRect().top
                if (ct >= savedTop) {
                  window.removeEventListener('scroll', mainTitleScrollHandler, {
                    passive: true,
                  })
                  mainTitleScrollHandler = null
                  mainTitle.style.removeProperty('position')
                  mainTitle.style.removeProperty('top')
                  mainTitle.style.removeProperty('left')
                  mainTitle.style.removeProperty('width')
                  mainTitleStarted = null
                  savedTop = null
                  return
                }
                mainTitle.style.top = ct + 'px'
              })
            }
            window.addEventListener('scroll', mainTitleScrollHandler, {
              passive: true,
            })
            mainTitleScrollHandler()
          }
        }
        prevMainAbove = mainAbove
      },
    })
  }

  function handleResize() {
    if (mqPc.matches) {
      createPc()
    } else {
      destroyPc()
    }
  }

  handleResize()
  mqPc.addEventListener('change', handleResize)
})()

// ──────────────────────────────────────
// messageセクション SP用（768px未満のみ）
// ──────────────────────────────────────
;(function () {
  const message = document.getElementById('concept')
  const titleMain = document.querySelector('.title-main')
  const messageText = document.querySelector('.message__text')
  const mq = window.matchMedia('(min-width: 768px)')
  let spSt = null
  const SP_GAP = 50

  function createSp() {
    if (spSt) return
    const fixedTop = parseInt(getComputedStyle(titleMain).top, 10) || 0
    const main = document.querySelector('.main')
    let isStuck = false
    let leaveBackRafId = null

    function applyAbsPos() {
      const relTop = window.scrollY + fixedTop - main.offsetTop
      titleMain.style.position = 'absolute'
      titleMain.style.bottom = 'auto'
      titleMain.style.top = relTop + 'px'
      titleMain.style.left = '20px'
      gsap.set(titleMain, { clearProps: 'y' })
    }

    function resetToFixed() {
      titleMain.style.position = ''
      titleMain.style.bottom = ''
      titleMain.style.top = ''
      titleMain.style.left = ''
    }

    spSt = ScrollTrigger.create({
      trigger: messageText,
      start: () => {
        const tmBottom = fixedTop + titleMain.offsetHeight
        return 'top ' + (tmBottom + SP_GAP)
      },
      endTrigger: message,
      end: 'bottom top',
      invalidateOnRefresh: true,
      onEnter: () => {
        isStuck = true
        if (leaveBackRafId != null) {
          cancelAnimationFrame(leaveBackRafId)
          leaveBackRafId = null
          return
        }
        applyAbsPos()
      },
      onLeaveBack: () => {
        isStuck = false
        leaveBackRafId = requestAnimationFrame(() => {
          leaveBackRafId = null
          if (isStuck) return
          resetToFixed()
        })
      },
    })
    spSt._resetToFixed = resetToFixed
    spSt._cancelLeaveBack = () => {
      if (leaveBackRafId != null) {
        cancelAnimationFrame(leaveBackRafId)
        leaveBackRafId = null
      }
    }
  }

  function destroySp() {
    if (!spSt) return
    spSt._cancelLeaveBack()
    spSt._resetToFixed()
    spSt.kill()
    spSt = null
  }

  function handleResize() {
    if (mq.matches) {
      destroySp()
    } else {
      createSp()
    }
  }

  if (!message || !titleMain || !messageText) return
  handleResize()
  mq.addEventListener('change', handleResize)
})()



//------------------------------------
// フッターの位置を固定
//------------------------------------

// const BREAKPOINT_PC = 768
function setMainMarginByFooter() {
  const footer = document.querySelector('.footer')
  const main = document.querySelector('.main')
  if (!footer || !main) return
    main.style.marginBottom = `${footer.offsetHeight}px`
}

setMainMarginByFooter()
window.addEventListener('resize', setMainMarginByFooter)


const fv = document.querySelector('.fv')
const message = document.querySelector('.message')

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