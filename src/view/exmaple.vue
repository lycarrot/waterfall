<template>
  <div class="example">
    <waterfall v-slot:default="props" :lists="lists">
      <div
        style="
          width: 100%;
          height: 20px;
          text-align: center;
          line-height: 20px;
          background: green;
          border:1px solid red;
        "
      >
        这是第 {{ props.index }}张图片
      </div>
    </waterfall>
  </div>
</template>
<script>
import waterfall from '../components/waterfall'
import axios from 'axios'
export default {
  components: {
    waterfall
  },
  data () {
    return {
      group: 0,
      lists: []
    }
  },
  methods: {
    getLists () {
      axios.get('./static/mock/data.json?group=' + this.group)
        .then((res) => {
          if (this.group < 10) {
            this.lists = this.lists.concat(res.data)
            this.group++
            console.log('list', this.lists)
          }
        })
    }
  },
  created () {
    this.getLists()
  }
}
</script>
<style scoped lang="less">
.example {
  width: 100%;
  padding: 10px;
  height: 600px;
  box-sizing: border-box;
}
</style>
