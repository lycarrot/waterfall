<template>
  <div class="waterfall-wrapper">
    <ul class="waterfall-container">
      <li
        class="item"
        v-for="(item, index) in lists"
        :key="index"
        :style="{ marginRight: index%(cols-1)!=0?marginR + 'px':'', marginBottom: marginB + 'px' }"
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
      default: 6
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
    }
  },
  data () {
    return {
      // cols: 2
      colWidth: 0,
      loadedCount: 0
    }
  },
  methods: {
    // 计算列
    calueteColWidth () {
      const wrap = document.querySelector('.waterfall-wrapper')
      const wrapWidth = wrap.clientWidth ? wrap.clientWidth : window.innerWidth
      // 每一行有padding需要减去
      console.log('wrapWidth', wrapWidth)
      this.colWidth = Math.floor((wrapWidth - this.marginR * (this.cols - 1)) / this.cols)
      console.log('sds', this.colWidth)
    },
    preLoad () {
      if (this.lists.length) {
        this.lists.forEach(item => {
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
            if (e.type === 'error') {
              this.$set(item, '_height', 100)
              item._error = true
            }
            if (this.loadedCount === this.lists.length) {
              this.$emit('paint')
            }
          }
        })
        // console.log('list', this.lists)
        // this.paint()
      }
    },
    paint () {
      this.$nextTick(() => {
        let arr = []
        for (let i = 0; i < this.lists.length; i++) {
          // 把第列第一个元素高度加入一个数组里面
          const item = this.$el.getElementsByClassName('item')[i]
          console.log('gfgfg', item, item.clientHeight)
          const itemHeight = item.offsetHeight
          if (i < this.cols) {
            this.lists[i].top = 0
            this.lists[i].left = i * this.colWidth + i * this.marginR

            arr.push(itemHeight)
          } else {
            let minColHeight = Math.min(...arr)
            let minColIndex = arr.findIndex(item => item === minColHeight)
            console.log('7', arr, minColHeight, minColIndex)
            this.lists[i].top = minColHeight + this.marginB
            this.lists[i].left = minColIndex * this.colWidth + this.marginR * minColIndex
            arr.splice(minColIndex, 1, minColHeight + itemHeight + this.marginB)
          }
          item.style.top = this.lists[i].top + 'px'
          item.style.left = this.lists[i].left + 'px'
        }
        console.log('arr', arr)
      })
    }
  },
  watch: {
    lists () {
      this.preLoad()
    }
  },
  mounted () {
    this.calueteColWidth()
    this.$on('paint', () => {
      this.paint()
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
  // overflow-y: scroll;
  position: relative;
  .waterfall-container {
    .item {
      position: absolute;
      border:1px solid green;
      // display: flex;
      overflow: hidden;
      .img {
        display: block;
      }
      .description {
        overflow: hidden;
      }
    }
  }
}
</style>
