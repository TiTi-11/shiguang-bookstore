const util = require('../../utils/util')

Component({
  properties: {
    book: {
      type: Object,
      value: {}
    },
    // grid：竖版卡片（两列 / 三列网格）；list：横版行
    mode: {
      type: String,
      value: 'grid'
    }
  },

  data: {
    salesText: '',
    priceText: ''
  },

  observers: {
    book(book) {
      if (!book || !book.id) return
      this.setData({
        salesText: util.sales(book.sales),
        priceText: util.price(book.price)
      })
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { id: this.data.book.id })
    }
  }
})
