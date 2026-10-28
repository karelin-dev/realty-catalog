// Короткое уведомление внизу экрана: «Ссылка скопирована» и т. п. Озвучивается скринридерами.

export function useToast() {
  const message = useState('toast', () => '')
  let timer

  function show(text) {
    message.value = text
    clearTimeout(timer)
    timer = setTimeout(() => (message.value = ''), 3000)
  }

  async function copyLink(url, text = 'Ссылка скопирована') {
    try {
      await navigator.clipboard.writeText(url)
      show(text)
    } catch {
      show('Не получилось скопировать, адрес в строке браузера')
    }
  }

  return { message, show, copyLink }
}
