<template>
  <div>

  </div>
</template>
<script>
export default {
  data() {
    const a = '1231121223'
    const lastName = 'last'
    return {
      firstName: a,
      lastName,
    }
  },
  methods: {
    userDat() {
      this.firstName = '1231231'
      this.lastName = 's'
    }
  }
}
</script>
