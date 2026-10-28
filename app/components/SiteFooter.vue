<script setup>
defineProps({ compact: { type: Boolean, default: false } })
</script>

<template>
  <footer class="footer" :class="{ 'footer--compact': compact }">
    <div class="wrap">
      <div v-if="!compact" class="footer__grid">
        <div class="footer__about">
          <NuxtLink to="/" class="footer__logo" aria-label="Литера, на главную">
            <LogoMark />
            <span>ЛИТЕРА</span>
          </NuxtLink>
          <p>Квартиры, дома и таунхаусы в Петербурге и пригороде. Проверяем каждый объект до показа.</p>
        </div>
        <nav aria-labelledby="f-catalog" class="footer__col">
          <h2 id="f-catalog" class="label">Каталог</h2>
          <NuxtLink :to="{ path: '/catalog', query: { type: 'flat' } }">Квартиры</NuxtLink>
          <NuxtLink :to="{ path: '/catalog', query: { market: 'new' } }">Новостройки</NuxtLink>
          <NuxtLink :to="{ path: '/catalog', query: { type: 'house,townhouse' } }">Дома и таунхаусы</NuxtLink>
        </nav>
        <nav aria-labelledby="f-services" class="footer__col">
          <h2 id="f-services" class="label">Сервисы</h2>
          <NuxtLink to="/#mortgage">Ипотечный калькулятор</NuxtLink>
          <NuxtLink to="/favorites">Избранное и сравнение</NuxtLink>
          <NuxtLink to="/#lead">Подбор объекта</NuxtLink>
        </nav>
        <div class="footer__col">
          <h2 class="label">Контакты</h2>
          <a href="tel:+78120000000" class="footer__phone">+7 812 000-00-00</a>
          <span>Санкт-Петербург, Большая Конюшенная ул., 1</span>
          <span>ежедневно 9:00–21:00</span>
        </div>
      </div>
      <div class="footer__bottom">
        <span>© 2026 Литера. Демо-проект для портфолио: компания, объекты, цены и контакты вымышлены.</span>
        <span>Фото: Unsplash. Карта: © участники OpenStreetMap.</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 80px 0 32px;
  border-top: 1px solid var(--line);
  background: #fff;
}

.footer--compact {
  padding: 28px 0;
}

.footer__grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.3fr;
  gap: 40px;
}

.footer__about {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.footer__about p {
  max-width: 300px;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.65;
}

.footer__logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--ink);
  font-family: var(--serif);
  font-size: 25px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-decoration: none;
}

.footer__col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 15px;
  color: var(--ink-2);
}

.footer__col h2 {
  margin-bottom: 4px;
  letter-spacing: 0.18em;
}

.footer__col a {
  color: var(--ink);
  text-decoration: none;
}

.footer__col a:hover {
  color: var(--brand);
}

.footer__phone {
  font-size: 18px;
  font-weight: 700;
}

.footer__bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  margin-top: 64px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 13px;
  line-height: 1.6;
}

.footer--compact .footer__bottom {
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
}

@media (max-width: 1100px) {
  .footer__grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 600px) {
  .footer {
    padding-top: 56px;
  }

  .footer__grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
