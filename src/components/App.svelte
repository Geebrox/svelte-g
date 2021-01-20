<script>
  import './App.scss'
  import classes from './App.module.scss'

  export let from
  export let moduleClass
</script>

<h1 class="text-2xl">
  Hello from {from}!
</h1>
<h1 class={classes[moduleClass]}>Modular h1</h1>
