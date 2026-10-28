// Становится true, когда элемент подъезжает к экрану. Так карта и её скрипты грузятся,
// только если до них долистали.

export function useInView(target, margin = '300px') {
  const inView = ref(false)
  let observer

  onMounted(() => {
    if (!('IntersectionObserver' in window)) {
      inView.value = true
      return
    }
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          inView.value = true
          observer.disconnect()
        }
      },
      { rootMargin: margin }
    )
    if (target.value) observer.observe(target.value)
  })

  onBeforeUnmount(() => observer?.disconnect())
  return inView
}
