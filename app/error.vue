<script setup>
const props = defineProps({ error: { type: Object, required: true } })
const notFound = computed(() => props.error?.statusCode === 404)

useHead({ title: notFound.value ? 'Страница не найдена' : 'Ошибка' })
</script>

<template>
  <SiteHeader />
  <main id="main" class="wrap error">
    <span class="eyebrow">{{ error.statusCode }}</span>
    <h1 class="h1">{{ notFound ? 'Такой страницы нет' : 'Что-то пошло не так' }}</h1>
    <p class="lead">{{ notFound ? 'Возможно, объект уже продан или ссылка устарела. Посмотрите похожие варианты в каталоге.' : 'Попробуйте обновить страницу или вернуться на главную.' }}</p>
    <div class="error__actions">
      <button type="button" class="btn btn--primary" @click="clearError({ redirect: '/catalog' })">Открыть каталог</button>
      <button type="button" class="btn btn--outline" @click="clearError({ redirect: '/' })">На главную</button>
    </div>
  </main>
  <SiteFooter compact />
</template>

<style scoped>
.error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  min-height: 60vh;
  padding-top: 96px;
  padding-bottom: 96px;
}

.error .lead {
  max-width: 560px;
}

.error__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
