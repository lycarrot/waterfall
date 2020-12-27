<template>
  <div class="waterfall-wrapper" ref="wrap">
    <ul class="waterfall-container">
      <li
        class="item"
        v-for="(item, index) in lists"
        :key="index"
        :style="{
          marginRight: index % (cols_n - 1) != 0 ? marginR + 'px' : '',
          marginBottom: marginB + 'px',
        }"
      >
        <img
          :src="item[imgField]"
          :style="{
            height: item._height + 'px',
            width: colWidth + 'px',
          }"
          alt=""
          class="img"
        />
        <div class="description" :style="{ width: colWidth + 'px' }">
          <slot :index="index"></slot>
        </div>

      </li>
    </ul>
  </div>
</template>
<script>

export default {
  props: {
    lists: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 列
    cols: {
      type: [Number, String],
      default: 5
    },
    // 图片字段名称
    imgField: {
      type: String,
      default: 'src'
    },
    marginR: {
      type: Number,
      default: 10
    },
    marginB: {
      type: Number,
      default: 10
    },
    distance: {
      type: Number,
      default: 15
    }
    //  当窗口变化时  1改变图片宽度  0保持图片宽度，改变列数量
    // resizeType: {
    //   type: Number,
    //   default: 1
    // }
  },
  data () {
    return {

      colWidth: 0,
      loadedCount: 0,
      isResize: false,
      // 是否到底部加载数据中
      isBtLoading: false
    }
  },
  computed: {
    // showLists () {
    //   return this.lists.filter(item => !item.isError)
    // }
    cols_n () {
      return this.isMobile() && this.cols === 5 ? 2 : this.cols
    }
  },
  methods: {
    isMobile () {
      var mobileArry = ['iPhone', 'iPad', 'Android', 'Windows Phone', 'BB10; Touch', 'BB10; Touch', 'PlayBook', 'Nokia']
      var ua = navigator.userAgent
      var res = mobileArry.filter(function (arr) {
        return ua.indexOf(arr) > 0
      })
      return res.length > 0
    },
    // 计算列
    calueteColWidth () {
      const wrap = this.$refs.wrap
      const wrapWidth = wrap.offsetWidth ? wrap.offsetWidth : window.innerWidth
      // 每一行有padding需要减去
      // if (this.isResize && this.resizeType === 1) {
      //   this.paint()
      //   return
      // }

      this.colWidth = Math.floor((wrapWidth - this.marginR * (this.cols_n - 1)) / this.cols_n)
    },
    preLoad () {
      if (this.lists.length) {
        this.lists.forEach((item, index) => {
          if (item._preload && !this.isResize) return
          if (!item[this.imgField]) {
            this.$set(item, '_height', 100)
            this.loadedCount++
            return
          }
          let img = new Image()
          img.src = item[this.imgField]
          img.onload = img.onerror = (e) => {
            this.loadedCount++
            if (e.type === 'load') {
              const height = this.colWidth / (img.width / img.height)
              this.$set(item, '_height', height)
            }
            // 图片加载失败过滤不显示
            if (e.type === 'error') {
              this.$set(item, '_height', 100)
            }
            item._preload = true
            if (this.loadedCount === this.lists.length || this.isResize) {
              this.isBtLoading = false
              this.$emit('paint')
            }
          }
        })
      }
    },
    paint () {
      this.$nextTick(() => {
        let arr = []
        for (let i = 0; i < this.lists.length; i++) {
          if (this.lists[i]._paint) return
          // 把第列第一个元素高度加入一个数组里面
          const item = this.$el.getElementsByClassName('item')[i]
          const itemHeight = item.offsetHeight
          if (i < this.cols_n) {
            this.lists[i].top = 0
            this.lists[i].left = i * this.colWidth + i * this.marginR
            arr.push(itemHeight)
          } else {
            let minColHeight = Math.min(...arr)
            let minColIndex = arr.findIndex(item => item === minColHeight)
            this.lists[i].top = minColHeight + this.marginB
            this.lists[i].left = minColIndex * this.colWidth + this.marginR * minColIndex
            arr.splice(minColIndex, 1, minColHeight + itemHeight + this.marginB)
          }
          item.style.top = this.lists[i].top + 'px'
          item.style.left = this.lists[i].left + 'px'
          item._paint = true
        }
      })
    },
    resize () {
      if (!this.isMobile() && window.innerWidth === this.$refs.wrap.offsetWidth) {
        this.isResize = true
        this.calueteColWidth()
        this.preLoad()
      }
    },
    scroll () {
      const wrap = this.$refs.wrap
      if (this.isBtLoading) return
      if (wrap.scrollTop + wrap.offsetHeight > wrap.scrollHeight - this.distance) {
        this.isBtLoading = true
        this.$emit('scrolltoB')
      }
    },
    scrollToB () {

    }
  },
  watch: {
    lists (newval, oldval) {
      if (newval.length !== oldval.length) {
        this.preLoad()
      }
    }
  },
  mounted () {
    this.calueteColWidth()
    this.$on('paint', () => {
      this.paint()
    })
    window.addEventListener('resize', this.resize)
    this.$refs.wrap.addEventListener('scroll', this.scroll)
  }

}
</script>
<style lang="less" scoped>
ul li {
  list-style: none;
}
ul,
li,
div {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.waterfall-wrapper {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  -ms-overflow-style: none;
  position: relative;
  scrollbar-width: none;
  .waterfall-container {
    .item {
      position: absolute;
      overflow: hidden;
      .img {
        display: block;
      }
      .description {
        overflow: hidden;
      }
    }
  }
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
