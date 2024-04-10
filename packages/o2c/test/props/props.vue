<template>
  <div>

  </div>
</template>
<script>
export default {
  props: {
    firstName: {
      type: String,
      default: ''
    }
  },
  methods: {
    userDat() {
      console.log(this.firstName)
      this.xxx
    }
  }
}
</script>
