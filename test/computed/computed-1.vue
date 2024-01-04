<template>
  <div>

  </div>
</template>
<script>
export default {
  props: {

  },
  data() {
    return {
      firstName: '12313',
      lastName: 'sw234',
    }
  },
  computed: {
    ...mapState(['age', 'school']),
    userName(){
      return this.firstName + this.lastName
    }
  },
  methods: {
    logName(){
      this.userName
      this.firstName
      this.lastName
      this.age
      this.school
    }
  },
}
</script>
