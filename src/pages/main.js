import '@utils/common'

import App from '@components/App.svelte'

new App({
  target: document.body,
  props: {
    from: 'main page',
    moduleClass: 'mainPage'
  }
})
