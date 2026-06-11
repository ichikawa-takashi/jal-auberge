
history.scrollRestoration = 'manual'

//------------------------------------
// Lenis スムーススクロール
//------------------------------------

const lenis = new Lenis({
  duration: 1.6,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  wheelMultiplier: 0.8, // 1スクロールで動く量（デフォルト1、小さくすると移動量が減る）
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// ハッシュリンクを lenis.scrollTo() で処理（2回クリック問題の対策）
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    const target = document.querySelector(href);
    if (target) lenis.scrollTo(target);
  });
});

//------------------------------------
//  ヘッダーがスクロールしたらヘッダーの背景を変える
//------------------------------------

// const headerInner = document.querySelector('.header__inner')
// const HEADER_SCROLL_THRESHOLD = 80
// if (headerInner) {
//   let lastScrollY = window.scrollY
//   const updateHeaderInner = () => {
//     const scrollY = window.scrollY
//     if (scrollY <= HEADER_SCROLL_THRESHOLD) {
//       headerInner.classList.remove('is-hidden')
//     } else if (scrollY > lastScrollY) {
//       headerInner.classList.add('is-hidden')
//     } else {
//       headerInner.classList.remove('is-hidden')
//     }
//     lastScrollY = scrollY
//   }
//   let ticking = false
//   window.addEventListener(
//     'scroll',
//     () => {
//       if (!ticking) {
//         requestAnimationFrame(() => {
//           updateHeaderInner()
//           ticking = false
//         })
//         ticking = true
//       }
//     },
//     { passive: true },
//   )
// }

//------------------------------------
// #about通過中にロゴをclip-pathで分割切り替え
//------------------------------------

const headerLogoRed = document.querySelector('.header__logo-img--red')
const headerEl2 = document.querySelector('.header')
const aboutSection = document.querySelector('#about')

function updateLogoClip() {
  if (!headerLogoRed || !aboutSection) return
  // ドロワーが開いているときは白ロゴのまま
  if (headerEl2.querySelector('#nav').classList.contains('is-active')) return

  const logoRect = document.querySelector('.header__logo-img--shadow').getBoundingClientRect()
  const aboutRect = aboutSection.getBoundingClientRect()
  const logoHeight = logoRect.height

  // #aboutの上端がロゴ内を通過するときのclip（上からのクリップ量）
  // 一度赤に変わったら#about以降もそのまま維持
  const topClip = Math.max(0, Math.min(100, (aboutRect.top - logoRect.top) / logoHeight * 100))

  headerLogoRed.style.clipPath = `inset(${topClip}% 0 0 0)`

  // ハンバーガー色
  if (topClip < 100) {
    headerEl2.classList.add('is-dark-hamburger')
  } else {
    headerEl2.classList.remove('is-dark-hamburger')
  }
}

lenis.on('scroll', updateLogoClip)

//------------------------------------
// 画像のスケールと、画像のパララックス
//------------------------------------

gsap.registerPlugin(ScrollTrigger)
const trigger = document.querySelectorAll('.js-size-down')
const trigger_y = document.querySelectorAll('.js-y-translate')

const BREAKPOINT_PC = 768
const isSP = window.innerWidth < BREAKPOINT_PC
const parallaxY = isSP ? 40 : 100

trigger.forEach((item) => {
  gsap.fromTo(
    item.querySelector('img'),
    {
      objectPosition: ' 50% 0%',
    //   y: -parallaxY,
    },
    {
      objectPosition: ' 50% 100%',
    //   y: parallaxY,
      scrollTrigger: {
        trigger: item,
        start: '-50% 35%',
        end: '300% 35%',
        scrub: true,
      },
    },
  )

//   gsap.fromTo(
//     item,
//     { y: 100 },
//     {
//       y: -100,
//       duration: 0.6,
//       scrollTrigger: {
//         trigger: item,
//         start: 'top 66%',
//       },
//     },
//   )
})
trigger_y.forEach((item) => {
  gsap.fromTo(
    item,
    { y: parallaxY },
    {
      y: -parallaxY,
      scrollTrigger: {
        trigger: item,
        start: 'top 90%',
        end: 'bottom 10%',
        scrub: 2,
      },
    },
  )
})

//------------------------------------
// locationの画像の色変更
//------------------------------------

// gsap.fromTo(
//   '.location__images',
//   { '--_opacity': 0 },
//   {
//     '--_opacity': 1,
//     scrollTrigger: {
//       trigger: '.location__images',
//       start: '30% 50%',
//       end: '70% 50%',
//       scrub: true,
//     },
//   },
// )

//------------------------------------
// フッターのパララックス
//------------------------------------

const main = document.querySelector('.main')
const footer = document.querySelector('.footer__inner')

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

//------------------------------------
// マスク
//------------------------------------

// const mask = document.querySelector('.mask')


// gsap.fromTo(
//   mask,
//   { '--_blur': '0
// px',},
//   {
//     '--_blur': '30px',
//     scrollTrigger: {
//       trigger: message,
//       start: 'top 50%',
//       end: 'bottom 50%',
//       scrub: true,
//     },
//   },
// )



//------------------------------------
// messageの文字色変更
//------------------------------------

const messageContent = document.querySelector('.message__content')
let globalIndex = 0

messageContent.querySelectorAll('p').forEach((item) => {
  const childNodes = Array.from(item.childNodes)

  childNodes.forEach((node) => {
    if (node.nodeType !== Node.TEXT_NODE) return
    const text = node.textContent
    const fragment = document.createDocumentFragment()
    for (const char of text) {
      if (char === ' ' || char === '\n' || char === '\t') continue
      const span = document.createElement('span')
      span.className = 'message__char'
      span.textContent = char
      span.dataset.index = String(globalIndex)
      globalIndex++
      fragment.appendChild(span)
    }

    item.replaceChild(fragment, node)
  })
})
const totalChars = globalIndex

ScrollTrigger.create({
  trigger: '.message',
  start: 'top 61%',
  end: 'bottom 95%',
  scrub: true,
  onUpdate: (self) => {
    const progress = self.progress

    const threshold = Math.floor(self.progress * totalChars)
    messageContent.querySelectorAll('.message__char').forEach((span) => {
      const idx = parseInt(span.dataset.index, 10)
      span.classList.toggle('is-white', idx < threshold)
    })
  },
})

//------------------------------------
// ハンバーガーメニュー
//------------------------------------

const hamburger = document.getElementById('hamburger')
const nav = document.getElementById('nav')

function openMenu() {
  hamburger.classList.add('is-active')
  nav.classList.add('is-active')
  document.body.style.overflow = 'hidden'
  // ドロワー中は白ロゴ固定
  if (headerLogoRed) headerLogoRed.style.clipPath = 'inset(100% 0 0 0)'
  headerEl2.classList.remove('is-dark-hamburger')
}
function closeMenu() {
  hamburger.classList.remove('is-active')
  nav.classList.remove('is-active')
  document.body.style.overflow = 'auto'
  // ドロワーを閉じたら現在スクロール位置に基づいてclip-pathを再計算
  updateLogoClip()
}

hamburger.addEventListener('click', () => {
  if (hamburger.classList.contains('is-active')) {
    closeMenu()
  } else {
    openMenu()
  }
})

window.addEventListener('resize', () => {
  if (window.innerWidth >= BREAKPOINT_PC) {
    closeMenu()
  }
}) /
  //------------------------------------
  // ハッシュリンクのスムーススクロール
  //------------------------------------

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

//------------------------------------
// 地図　API
//------------------------------------

const stores = [
  {
    id: 'furano',
    name: 'JAL オーベルジュ 富良野',
    lat: 43.41233555838843,
    lng: 142.41910270990738,
    postcode: '〒071-0714',
    address: '北海道空知郡中富良野町宮町1番83',
    access: ['旭川空港より車で約45分', '新千歳空港より車で約2時間'],
    detailUrl: '/furano/',
    logoText: 'JAL Auberge\nFURANO',
    markerScale: 16,
  },
//   {
//     id: 'otaru',
//     name: 'サンプル店舗 小樽',
//     lat: 43.1907,
//     lng: 140.9942,
//     postcode: '〒000-0000',
//     address: '北海道 小樽市 XXXXXXXXXXXXX',
//     access: ['札幌より車で約30分'],
//     detailUrl: '#',
//     logoText: 'Sample\nOTARU',
//     markerScale: 8,
//   },
]

let map = null
let markers = []
let currentCardStoreId = null
let cardOpenedByClick = false

function initMap() {
  const center = { lat: 43.4, lng: 142.2 }
  function getZoomByWidth() {
    const w = window.innerWidth
    if (w >= 768) return 8
    return 7.5
  }
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: getZoomByWidth(),
    center: center,
    disableDefaultUI: false,
    zoomControl: false,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    fullscreenControl: false,
    panControl: false,
    draggable: false,
    gestureHandling: 'none',
  })

  const grayStyles = [
    {
      featureType: 'all',
      elementType: 'geometry',
      stylers: [{ color: '#eeeeee' }],
    },
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#555555' }],
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#ffffff' }, { weight: 2 }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#949494' }],
    },
    {
      //都市部　（確定）
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#BDBDBD' }],
    },
    {
      featureType: 'landscape.natural',
      elementType: 'geometry',
      // stylers: [{ color: '#d2d2d2' }],
      // stylers: [{ color: '#ff0000' }],
    },
    {
      featureType: 'landscape.natural.landcover',
      elementType: 'geometry',
      stylers: [{ color: '#b5b5b5' }],
      // stylers: [{ color: '#ff0000' }],
    },
    {
      featureType: 'landscape.natural.terrain',
      elementType: 'geometry',
      // stylers: [{ color: '#8f8f8f' }],
      stylers: [{ color: '#949494' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#656565' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#555555' }],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#d8d8d8' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'all',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#bbbbbb' }, { weight: 0.5 }],
    },
  ]
  map.setOptions({ styles: grayStyles })

  stores.forEach(function (store) {
    addMarker(store)
  })

  map.addListener('click', function () {
    const card = document.getElementById('info-card')
    if (card) {
      card.classList.remove('is-visible')
      card.setAttribute('aria-hidden', 'true')
      currentCardStoreId = null
      cardOpenedByClick = false
    }
  })

  // 枠のサイズ確定後・描画完了後・リサイズ時に再描画（上セクションの高さ変更などに対応）
  function triggerResize() {
    if (!map) return
    google.maps.event.trigger(map, 'resize')
    map.setCenter(center)
    map.setZoom(getZoomByWidth())
  }
  setTimeout(triggerResize, 100)
  google.maps.event.addListenerOnce(map, 'idle', triggerResize)

  const mapEl = document.getElementById('map')
  const resizeObserver = new ResizeObserver(function () {
    if (map && mapEl && mapEl.offsetHeight > 0) triggerResize()
  })
  resizeObserver.observe(mapEl)
}

function animateMarkerScale(marker, iconBase, fromScale, toScale, duration) {
  const startTime = performance.now()
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
    marker.setIcon({ ...iconBase, scale: fromScale + (toScale - fromScale) * eased })
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function addMarker(store) {
  const baseScale = store.markerScale ?? 16
  const iconBase = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: baseScale,
    fillColor: 'rgb( 204 0 0 / .9)',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 1.3,
  }

  const marker = new google.maps.Marker({
    position: { lat: store.lat, lng: store.lng },
    map: map,
    icon: { ...iconBase },
    storeId: store.id,
  })

  marker.addListener('mouseover', function () {
    animateMarkerScale(marker, iconBase, baseScale, baseScale * 1.2, 300)
    if (!cardOpenedByClick) showInfoCard(store.id)
  })

  marker.addListener('mouseout', function () {
    animateMarkerScale(marker, iconBase, baseScale * 1.2, baseScale, 300)
    if (!cardOpenedByClick) {
      const card = document.getElementById('info-card')
      if (card) {
        card.classList.remove('is-visible')
        card.setAttribute('aria-hidden', 'true')
        currentCardStoreId = null
      }
    }
  })

  marker.addListener('click', function () {
    cardOpenedByClick = true
    showInfoCard(store.id)
  })

  markers.push({ marker: marker, storeId: store.id })
}

function showInfoCard(storeId) {
  const store = stores.find(function (s) {
    return s.id === storeId
  })
  if (!store) return

  const card = document.getElementById('info-card')
  card.classList.remove('is-visible')

  const logoHtml =
    '<img src="images/common/logo.png" alt="' +
    escapeHtml(store.logoText.replace(/\n/g, ' ')) +
    '" class="info-card__logo-img">'

  const accessList = store.access
    .map(function (line) {
      return '<li>' + line + '</li>'
    })
    .join('')

  card.innerHTML =
    '<div class="info-card__logo">' +
    logoHtml +
    '</div>' +
    '<div class="info-card__body">' +
    '<div class="info-card__body-text">' +
    '<h2 class="info-card__name">' +
    escapeHtml(store.name) +
    '</h2>' +
    '<span class="info-card__open">2026年12月 OPEN</span>' +
    '<p class="info-card__address">' +
    escapeHtml(store.postcode) +
    '<br>' +
    escapeHtml(store.address) +
    '</p>' +
    // '<ul class="info-card__access">' +
    // accessList +
    // '</ul>' +
    '</div>' +
    '<div class="info-card__body-button">' +
    '<a href="' +
    escapeHtml(store.detailUrl) +
    '" class="info-card__button" aria-label="詳細を見る">' +
    '<div class="info-card__button-cover">' +
    '<svg class="info-card__button-cover-default" width="9" height="14"><use href="#icon-arrow"></use></svg>' +
    '<svg class="info-card__button-cover-hover" width="9" height="14"><use href="#icon-arrow"></use></svg>' +
    '</div></a>'
  '</div>' + '</div>'
  card.getBoundingClientRect() // reflow を強制してtransitionを確実に発火させる
  card.setAttribute('aria-hidden', 'false')
  card.classList.add('is-visible')
  currentCardStoreId = storeId
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
window.initMap = initMap

//------------------------------------
// 記事リンク
//------------------------------------

// article-link: ページ最下部までスクロールしたら消す、上にスクロールしたら出現する
// const articleLink = document.querySelector('.article-link')
// const ARTICLE_LINK_HIDE_THRESHOLD = 80
// if (articleLink) {
//   let tickingArticleLink = false

//   const updateArticleLinkVisibility = () => {
//     const scrollY = window.scrollY
//     const bottom = document.documentElement.scrollHeight - window.innerHeight

//     if (
//       bottom <= ARTICLE_LINK_HIDE_THRESHOLD ||
//       scrollY >= bottom - ARTICLE_LINK_HIDE_THRESHOLD
//     ) {
//       articleLink.classList.add('is-hidden')
//     } else {
//       articleLink.classList.remove('is-hidden')
//     }
//   }

//   window.addEventListener(
//     'scroll',
//     () => {
//       if (!tickingArticleLink) {
//         requestAnimationFrame(() => {
//           updateArticleLinkVisibility()
//           tickingArticleLink = false
//         })
//         tickingArticleLink = true
//       }
//     },
//     { passive: true },
//   )
//   updateArticleLinkVisibility()
// }

//------------------------------------
// ヒーロースライダー
// 上にinsetしていくアニメーションと、下にinsetしていくアニメーションを同時に行う
// 下にある画像が動きをつけてパララックス
//------------------------------------
;(function initHeroSlider() {
  const INTERVAL = 5000
  const ACTIVE_DURATION = 2000
  // const BEFORE_DURATION  = 9400
  const BEFORE_DURATION = 16000

  // ─── DOM refs ───
  const pauseBtn = document.querySelector('.hero__pause-btn')
  const pagItems = document.querySelectorAll('.hero__pagination-item')

  // ─── State ───
  let isPaused = false
  let intervalId = null
  let resumeTimerId = null
  let tickStartTime = Date.now()
  let slideIndex = 0
  const slideCount = pagItems.length || 1

  // ─── Pausable timeout manager ───
  // 各エントリ: { el, cls, remaining, startedAt, timerId }
  const pendingRemovals = []

  function scheduleRemoval(el, cls, delay) {
    const entry = {
      el,
      cls,
      remaining: delay,
      startedAt: Date.now(),
      timerId: null,
    }
    entry.timerId = setTimeout(() => {
      el.classList.remove(cls)
      const i = pendingRemovals.indexOf(entry)
      if (i !== -1) pendingRemovals.splice(i, 1)
    }, delay)
    pendingRemovals.push(entry)
  }

  function pauseAllRemovals() {
    const now = Date.now()
    pendingRemovals.forEach((entry) => {
      clearTimeout(entry.timerId)
      // 残り時間を更新して保存
      entry.remaining = Math.max(0, entry.remaining - (now - entry.startedAt))
    })
  }

  function resumeAllRemovals() {
    pendingRemovals.forEach((entry) => {
      entry.startedAt = Date.now()
      entry.timerId = setTimeout(() => {
        entry.el.classList.remove(entry.cls)
        const i = pendingRemovals.indexOf(entry)
        if (i !== -1) pendingRemovals.splice(i, 1)
      }, entry.remaining)
    })
  }

  function clearAllRemovals() {
    pendingRemovals.forEach((entry) => clearTimeout(entry.timerId))
    pendingRemovals.length = 0
  }

  // ─── Slider helpers ───
  function createSlider(selector) {
    const items = document.querySelectorAll(selector)
    if (!items.length) return null
    const itemSet = new Set(items)
    let index = 0

    function restartAnim(el) {
      const img = el.querySelector('img')
      img.style.animation = 'none'
      void img.offsetWidth
      img.style.animation = ''
    }

    function tick() {
      items.forEach((item) => item.classList.remove('active'))
      const el = items[index]
      el.classList.remove('active', 'before')

      for (let i = pendingRemovals.length - 1; i >= 0; i--) {
        if (itemSet.has(pendingRemovals[i].el)) {
          clearTimeout(pendingRemovals[i].timerId)
          pendingRemovals.splice(i, 1)
        }
      }

      restartAnim(el)
      el.classList.add('active', 'before')
      scheduleRemoval(el, 'active', ACTIVE_DURATION)
      scheduleRemoval(el, 'before', BEFORE_DURATION)

      items.forEach((item) => {
        if (item !== el && item.classList.contains('before')) {
          scheduleRemoval(item, 'before', ACTIVE_DURATION)
        }
      })

      // 次スライドの画像を事前デコード
      const nextIndex = (index + 1) % items.length
      const nextImg = items[nextIndex].querySelector('img')
      if (nextImg && nextImg.decode) nextImg.decode().catch(() => {})

      index = (index + 1) % items.length
    }

    function setPlayState(state) {
      items.forEach((item) => {
        const img = item.querySelector('img')
        if (img) img.style.animationPlayState = state
      })
    }

    return { tick, setPlayState }
  }

  // ─── Pagination helpers ───
  function updatePagination(idx) {
    pagItems.forEach((item, i) => {
      const bar = item.querySelector('.hero__pagination-bar')
      item.classList.remove('active')
      if (bar) {
        bar.style.animation = 'none'
        void bar.offsetWidth
        bar.style.animation = ''
      }
      if (i === idx) item.classList.add('active')
    })
  }

  function setPaginationPlayState(state) {
    pagItems.forEach((item) => {
      const bar = item.querySelector('.hero__pagination-bar')
      if (bar) bar.style.animationPlayState = state
    })
  }

  // ─── Master tick ───
  const left = createSlider('.hero__slider--left .hero__slider-item')
  const right = createSlider('.hero__slider--right .hero__slider-item')

  function masterTick() {
    if (left) left.tick()
    if (right) right.tick()
    updatePagination(slideIndex)
    slideIndex = (slideIndex + 1) % slideCount
    tickStartTime = Date.now()
  }

  function startInterval() {
    intervalId = setInterval(masterTick, INTERVAL)
  }

  function stopInterval() {
    clearInterval(intervalId)
    intervalId = null
  }

  // ─── Init ───
  masterTick()
  startInterval()

  // ─── Pause / Resume ───
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused

      if (isPaused) {
        // pause ─────────────────────────────
        pauseBtn.classList.add('is-paused')
        pauseBtn.setAttribute('aria-label', '再生')

        // CSS animations を止める
        if (left) left.setPlayState('paused')
        if (right) right.setPlayState('paused')
        setPaginationPlayState('paused')

        // setInterval を止め、class removal タイマーを一時停止（残り時間保存）
        const remainingInterval = INTERVAL - (Date.now() - tickStartTime)
        stopInterval()
        clearTimeout(resumeTimerId)
        pauseAllRemovals()

        pauseBtn._remainingInterval = remainingInterval
      } else {
        // resume ────────────────────────────
        pauseBtn.classList.remove('is-paused')
        pauseBtn.setAttribute('aria-label', '一時停止')

        // CSS animations を再開
        if (left) left.setPlayState('running')
        if (right) right.setPlayState('running')
        setPaginationPlayState('running')

        // class removal タイマーを残り時間で再スケジュール
        resumeAllRemovals()

        // インターバルの残り時間後に次の tick → setInterval 再開
        const remainingInterval = pauseBtn._remainingInterval ?? INTERVAL
        resumeTimerId = setTimeout(() => {
          masterTick()
          startInterval()
        }, remainingInterval)
        tickStartTime = Date.now() - (INTERVAL - remainingInterval)
      }
    })
  }
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

// const mask = document.querySelector('.mask')
const hero = document.querySelector('.hero')
const message = document.querySelector('.message')
const link = document.querySelector('.article-link--top')

gsap.fromTo( [hero, link],
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

//------------------------------------
// #conceptが画面上部に達したら.headerにbg-blackを付与
//------------------------------------

const conceptSection = document.getElementById('concept')
const headerEl = document.querySelector('.header')

if (conceptSection && headerEl) {
  ScrollTrigger.create({
    trigger: conceptSection,
    start: 'top top',
    onEnter: () => headerEl.classList.add('bg-black'),
    onLeaveBack: () => headerEl.classList.remove('bg-black'),
  })
}

//------------------------------------
// #locationを通過したらfooterにfixedクラスを付与
//------------------------------------

const locationSection = document.getElementById('about')
const footerEl = document.querySelector('.footer')

if (locationSection && footerEl) {
  ScrollTrigger.create({
    trigger: locationSection,
    start: 'top bottom',
    onEnter: () => footerEl.classList.add('fixed'),
    onLeaveBack: () => footerEl.classList.remove('fixed'),
  })
}