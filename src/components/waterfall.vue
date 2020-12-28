<template>
<div style="height:100%;">
  <div class="waterfall-wrapper" ref="wrap">
    <div class="pull-to-refresh-layer">
      <div v-show="!isShowLoading">
        <!-- <i ref="icon" class="css-icon icon-upward"></i> -->
        <p>下拉刷新</p>
      </div>
      <div v-show="isShowLoading" style="padding-top: 30px">
        假装是个loading图标
      </div>
    </div>
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
    <div class="footer" v-if="isBtLoading" :style="{ top: maxHeight + 'px' }">
      {{ finished ? finishedText : loadingText }}
    </div>
  </div>
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
    },
    finished: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: '加载中...'
    },
    finishedText: {
      type: String,
      default: '没有更多了'
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
      isBtLoading: false,
      heightLists: [],
      isShowLoading: false
    }
  },
  computed: {
    // showLists () {
    //   return this.lists.filter(item => !item.isError)
    // }
    maxHeight () {
      return Math.max.apply(null, this.heightLists)
    },
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
              this.$emit('paint')
            }
          }
        })
      }
    },
    paint () {
      this.$nextTick(() => {
        // let arr = []
        this.heightLists = []
        for (let i = 0; i < this.lists.length; i++) {
          if (this.lists[i]._paint) return
          // 把第列第一个元素高度加入一个数组里面
          const item = this.$el.getElementsByClassName('item')[i]
          const itemHeight = item.offsetHeight

          if (i < this.cols_n) {
            this.lists[i].top = 0
            this.lists[i].left = i * this.colWidth + i * this.marginR
            this.heightLists.push(itemHeight)
          } else {
            let minColHeight = Math.min(...this.heightLists)
            let minColIndex = this.heightLists.findIndex(item => item === minColHeight)
            this.lists[i].top = minColHeight + this.marginB
            this.lists[i].left = minColIndex * this.colWidth + this.marginR * minColIndex
            this.heightLists.splice(minColIndex, 1, minColHeight + itemHeight + this.marginB)
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
    pull (el, callback) {
      let beginPagY = 0
      let currentPos
      const maxTranslateY = 150
      // const iconEl = this.$refs.icon
      el.addEventListener('touchstart', e => {
        if (el.scrollTop !== 0) {
          return
        }
        beginPagY = e.touches[0].pageY
        e.preventDefault()
      })
      el.addEventListener('touchmove', e => {
        if (el.scrollTop !== 0) {
          return
        }
        const pageY = e.touches[0].pageY
        const distance = currentPos = pageY - beginPagY
        if (distance < 0 || distance > maxTranslateY) {
          // 上拉的时候不做任何处理
          return
        }
        // if (distance > 60) {
        //   iconEl.classList.add('active')
        // } else {
        //   iconEl.classList.remove('active')
        // }
        e.preventDefault()
        el.style.transform = `translateY(${distance}px)`
      })
      // let clear = () => {
      //   this.isShowLoading = false
      //   el.style.transform = `translateY(0)`
      //   setTimeout(() => {
      //     el.style.transition = ``
      //   }, 200)
      // }
      // el.addEventListener('touchend', () => {
      //   el.style.transition = `.2s`
      //   if (currentPos >= 60) {
      //     this.isShowLoading = true
      //     el.style.transform = `translateY(30px)`
      //     callback && callback(() => {
      //       clear()
      //     })
      //     return
      //   }
      //   clear()
      // })
    }
    // scrollToB () {

    // }
  },
  watch: {
    lists (newval, oldval) {
      if (newval.length !== oldval.length) {
        this.isBtLoading = false
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
    this.pull(this.$refs.wrap, (done) => {
      setTimeout(() => {
        done()
      }, 1000)
    })
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
  .footer {
    position: absolute;
    width: 100%;
    height: 40px;
    line-height: 40px;
    font-size: 16px;
    text-align: center;
    color: #969799;
  }
}
.css-icon {
  display: inline-block;
  height: 1em;
  width: 1em;
  font-size: 20px;
  box-sizing: border-box;
  text-indent: -9999px;
  vertical-align: middle;
  position: relative;
}
.css-icon::before,
.css-icon::after {
  content: "";
  box-sizing: inherit;
  position: absolute;
  left: 50%;
  top: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

.icon-upward::before {
  height: 0.65em;
  width: 0.65em;
  border-style: solid;
  border-width: 2px 0 0 2px;
  -ms-transform: translate(-50%, -50%) rotate(45deg);
  transform: translate(-50%, -50%) rotate(45deg);
}
.icon-upward::after {
  height: 0.8em;
  border-left: 2px solid;
  top: 55%;
}

.icon-upward.active {
  transform: rotate(180deg);
  transition: transform 0.3s;
}

.pull-to-refresh-layer {
  height: 60px;
  margin-top: -60px;
  font-size: 12px;
  text-align: center;
  color: #aaa;
  line-height: 30px;
}
</style>
