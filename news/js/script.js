

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
// ハンバーガーメニュー
//------------------------------------

const hamburger = document.getElementById('hamburger')
const nav = document.getElementById('nav')
const headerLogo = document.querySelector('.header__logo img')
const LOGO_DEFAULT = headerLogo ? headerLogo.getAttribute('src') : ''
const _scriptBase = document.currentScript ? document.currentScript.src.replace(/\/js\/[^/]+$/, '/') : ''
const LOGO_MENU_OPEN = _scriptBase + 'images/common/logo-header.png'

function openMenu() {
  hamburger.classList.add('is-active')
  nav.classList.add('is-active')
  document.body.style.overflow = 'hidden'
  if (headerLogo) headerLogo.setAttribute('src', LOGO_MENU_OPEN)
}
function closeMenu() {
  hamburger.classList.remove('is-active')
  nav.classList.remove('is-active')
  document.body.style.overflow = 'auto'
  if (headerLogo) headerLogo.setAttribute('src', LOGO_DEFAULT)
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
// const hero = document.querySelector('.hero')
// const message = document.querySelector('.message')
// const link = document.querySelector('.article-link--top')

// gsap.fromTo( [hero, link],
//   {
//     opacity: 1,
//   },
//    {
//     opacity: 0,
//     pointerEvents: 'none',
//     scrollTrigger: {
//       trigger: message,
//       start: 'bottom 0%',
//       scrub: true,
//     },
//   },
// )


//------------------------------------
// ニュース「もっと見る」ボタン
// LOAD_MORE_COUNT: 1クリックで追加表示する件数（変更可）
//------------------------------------

;(function initLoadMore() {
  const LOAD_MORE_COUNT = 4

  const articles = Array.from(document.querySelectorAll('.sub-news__body .card-news'))
  const button = document.querySelector('.sub-news__button')
  const buttonLink = button ? button.querySelector('a') : null

  if (!articles.length || !button) return

  let visibleCount = LOAD_MORE_COUNT

  // 初期表示：LOAD_MORE_COUNT件以降を非表示
  articles.forEach((article, i) => {
    if (i >= visibleCount) {
      article.style.display = 'none'
    }
  })

  // 全件表示済みならボタンを非表示
  if (articles.length <= visibleCount) {
    button.style.display = 'none'
  }

  if (buttonLink) {
    buttonLink.addEventListener('click', (e) => {
      e.preventDefault()

      const nextCount = visibleCount + LOAD_MORE_COUNT
      const newArticles = articles.slice(visibleCount, nextCount)

      newArticles.forEach((article, idx) => {
        article.style.display = ''
        gsap.from(article, {
          height: 0,
          opacity: 0,
          overflow: 'hidden',
          duration: 0.5,
          delay: idx * 0.08,
          ease: 'power2.out',
          clearProps: 'height,overflow,opacity',
        })
      })

      visibleCount = nextCount

      if (visibleCount >= articles.length) {
        button.style.display = 'none'
      }
    })
  }
})()
