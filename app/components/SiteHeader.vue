<script setup>
const { count } = useFavorites()
const route = useRoute()
const menuOpen = ref(false)
const menuButton = ref(null)

const nav = [
  { to: '/catalog', label: 'Каталог', match: (r) => r.path.startsWith('/catalog') && !r.query.market && !r.query.type },
  { to: { path: '/catalog', query: { market: 'new' } }, label: 'Новостройки', match: (r) => r.query.market === 'new' },
  { to: { path: '/catalog', query: { type: 'house,townhouse' } }, label: 'Загородные дома', match: (r) => r.query.type === 'house,townhouse' },
  { to: '/#mortgage', label: 'Ипотека' },
  { to: '/#agents', label: 'О нас' }
]

const isActive = (item) => item.match?.(route) ?? false

function closeMenu(returnFocus = false) {
  menuOpen.value = false
  if (returnFocus) menuButton.value?.focus()
}

function onKey(e) {
  if (e.key === 'Escape' && menuOpen.value) closeMenu(true)
}

watch(() => route.fullPath, () => closeMenu())
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <header class="header">
    <div class="wrap header__row">
      <NuxtLink to="/" class="logo" aria-label="Литера, на главную">
        <LogoMark />
        <span class="logo__text">
          <span class="logo__name">ЛИТЕРА</span>
          <span class="logo__tag">недвижимость Петербурга</span>
        </span>
      </NuxtLink>

      <nav class="nav" aria-label="Основное меню">
        <NuxtLink
          v-for="item in nav"
          :key="item.label"
          :to="item.to"
          class="nav__link"
          :class="{ 'is-active': isActive(item) }"
          :aria-current="isActive(item) ? 'page' : undefined"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="header__actions">
        <a class="phone" href="tel:+78120000000">
          <span class="phone__number">+7 812 000-00-00</span>
          <span class="phone__hours">ежедневно 9:00–21:00</span>
        </a>
        <a class="icon-btn header__call" href="tel:+78120000000" aria-label="Позвонить в агентство">
          <AppIcon name="phone" :size="18" />
        </a>
        <NuxtLink
          to="/favorites"
          class="icon-btn fav-link"
          :class="{ 'is-current': route.path.startsWith('/favorites') }"
          :aria-label="count ? `Избранное, ${objectsWord(count)}` : 'Избранное'"
        >
          <AppIcon name="heart" :filled="route.path.startsWith('/favorites')" />
          <span v-if="count" class="fav-link__count" aria-hidden="true">{{ count }}</span>
        </NuxtLink>
        <NuxtLink to="/#lead" class="btn btn--outline header__contact">Связаться</NuxtLink>
        <button
          ref="menuButton"
          class="icon-btn header__burger"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          :aria-label="menuOpen ? 'Закрыть меню' : 'Открыть меню'"
          @click="menuOpen = !menuOpen"
        >
          <AppIcon :name="menuOpen ? 'close' : 'menu'" :size="20" />
        </button>
      </div>
    </div>

    <div v-show="menuOpen" id="mobile-menu" class="mobile-menu">
      <nav class="wrap mobile-menu__nav" aria-label="Меню">
        <NuxtLink v-for="item in nav" :key="item.label" :to="item.to" class="mobile-menu__link">{{ item.label }}</NuxtLink>
        <NuxtLink to="/favorites" class="mobile-menu__link">Избранное</NuxtLink>
        <a href="tel:+78120000000" class="btn btn--primary mobile-menu__call">+7 812 000-00-00</a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: relative;
  z-index: 40;
  background: #fff;
  border-bottom: 1px solid var(--line);
}

.header__row {
  display: flex;
  align-items: center;
  gap: 40px;
  height: var(--header);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  color: var(--ink);
  text-decoration: none;
}

.logo__text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.logo__name {
  font-family: var(--serif);
  font-size: 25px;
  font-weight: 600;
  letter-spacing: 0.2em;
}

.logo__tag {
  margin-top: 5px;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted);
}

.nav {
  display: flex;
  gap: 32px;
  margin: 0 auto;
}

.nav__link {
  padding: 4px 0;
  color: var(--ink);
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
}

.nav__link:hover,
.nav__link.is-active {
  color: var(--brand);
}

.nav__link.is-active {
  font-weight: 600;
  box-shadow: inset 0 -1px 0 var(--brand);
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.phone {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 10px;
  color: var(--ink);
  line-height: 1.3;
  text-decoration: none;
}

.phone__number {
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
}

.phone__hours {
  font-size: 12.5px;
  color: var(--muted);
}

.header__call,
.header__burger {
  display: none;
}

.fav-link {
  position: relative;
}

.fav-link.is-current {
  border-color: var(--brand);
  background: var(--sage);
  color: var(--brand);
}

.fav-link__count {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--brand);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
}

.header__contact {
  min-height: 46px;
  padding: 0 22px;
}

.mobile-menu {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  background: #fff;
  border-bottom: 1px solid var(--line);
  box-shadow: 0 24px 40px rgba(30, 36, 34, 0.1);
}

.mobile-menu__nav {
  display: flex;
  flex-direction: column;
  padding-top: 8px;
  padding-bottom: 20px;
}

.mobile-menu__link {
  display: flex;
  align-items: center;
  min-height: 52px;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  font-size: 17px;
  font-weight: 600;
  text-decoration: none;
}

.mobile-menu__call {
  margin-top: 18px;
}

@media (max-width: 1180px) {
  .nav,
  .phone,
  .header__contact {
    display: none;
  }

  .header__call,
  .header__burger {
    display: inline-flex;
  }
}

@media (max-width: 600px) {
  .header__row {
    height: 68px;
    gap: 10px;
  }

  .logo :deep(svg) {
    width: 32px;
    height: 32px;
  }

  .logo__name {
    font-size: 22px;
  }

  .logo__tag {
    display: none;
  }

  .header__actions {
    gap: 8px;
  }

  .icon-btn {
    width: 44px;
    height: 44px;
  }
}
</style>
