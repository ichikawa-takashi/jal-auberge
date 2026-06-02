;(function initHeroSlider() {
  const INTERVAL         = 5000
  const ACTIVE_DURATION  = 2000
  const BEFORE_DURATION  = 9400

  // ─── DOM refs ───
  const pauseBtn      = document.querySelector('.hero__pause-btn')
  const pagItems      = document.querySelectorAll('.hero__pagination-item')

  // ─── State ───
  let isPaused        = false
  let intervalId      = null
  let resumeTimerId   = null
  let tickStartTime   = Date.now()
  let slideIndex      = 0
  const slideCount    = pagItems.length || 1

  // ─── Pausable timeout manager ───
  // 各エントリ: { el, cls, remaining, startedAt, timerId }
  const pendingRemovals = []

  function scheduleRemoval(el, cls, delay) {
    const entry = { el, cls, remaining: delay, startedAt: Date.now(), timerId: null }
    entry.timerId = setTimeout(() => {
      el.classList.remove(cls)
      const i = pendingRemovals.indexOf(entry)
      if (i !== -1) pendingRemovals.splice(i, 1)
    }, delay)
    pendingRemovals.push(entry)
  }

  function pauseAllRemovals() {
    const now = Date.now()
    pendingRemovals.forEach(entry => {
      clearTimeout(entry.timerId)
      // 残り時間を更新して保存
      entry.remaining = Math.max(0, entry.remaining - (now - entry.startedAt))
    })
  }

  function resumeAllRemovals() {
    pendingRemovals.forEach(entry => {
      entry.startedAt = Date.now()
      entry.timerId = setTimeout(() => {
        entry.el.classList.remove(entry.cls)
        const i = pendingRemovals.indexOf(entry)
        if (i !== -1) pendingRemovals.splice(i, 1)
      }, entry.remaining)
    })
  }

  function clearAllRemovals() {
    pendingRemovals.forEach(entry => clearTimeout(entry.timerId))
    pendingRemovals.length = 0
  }

  // ─── Slider helpers ───
  function createSlider(selector) {
    const items = document.querySelectorAll(selector)
    if (!items.length) return null
    let index = 0

    function restartAnim(el) {
      const img = el.querySelector('img')
      img.style.animation = 'none'
      void img.offsetWidth
      img.style.animation = ''
    }

    function tick() {
      items.forEach(item => item.classList.remove('active'))
      const el = items[index]
      el.classList.remove('active', 'before')
      // 古い removal エントリがあれば削除
      for (let i = pendingRemovals.length - 1; i >= 0; i--) {
        if (pendingRemovals[i].el === el) {
          clearTimeout(pendingRemovals[i].timerId)
          pendingRemovals.splice(i, 1)
        }
      }
      restartAnim(el)
      el.classList.add('active', 'before')
      scheduleRemoval(el, 'active', ACTIVE_DURATION)
      scheduleRemoval(el, 'before', BEFORE_DURATION)
      index = (index + 1) % items.length
    }

    function setPlayState(state) {
      items.forEach(item => {
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
    pagItems.forEach(item => {
      const bar = item.querySelector('.hero__pagination-bar')
      if (bar) bar.style.animationPlayState = state
    })
  }

  // ─── Master tick ───
  const left  = createSlider('.hero__slider--left .hero__slider-item')
  const right = createSlider('.hero__slider--right .hero__slider-item')

  function masterTick() {
    if (left)  left.tick()
    if (right) right.tick()
    updatePagination(slideIndex)
    slideIndex    = (slideIndex + 1) % slideCount
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
        if (left)  left.setPlayState('paused')
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
        if (left)  left.setPlayState('running')
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