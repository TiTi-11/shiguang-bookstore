/**
 * 本地数据源（业务演示数据）
 * 真实项目里这一层会换成接口返回；这里的字段结构已按接口设计，替换时只需改 db.js。
 */

const categories = [
  { id: 'xhqh', name: '玄幻奇幻', color: '#F6E7D8', textColor: '#8C5A3C' },
  { id: 'dsyn', name: '都市异能', color: '#E8F0F7', textColor: '#2F5D8C' },
  { id: 'lsjs', name: '历史军事', color: '#F2F2E9', textColor: '#6B6B3A' },
  { id: 'khkj', name: '科幻空间', color: '#E6F2EC', textColor: '#2E6B57' },
  { id: 'dmty', name: '盗墓探险', color: '#EFEFEF', textColor: '#333333' },
  { id: 'xyxd', name: '校园现代', color: '#F7ECF2', textColor: '#8C3F63' },
  { id: 'yyjj', name: '言情近代', color: '#FBEEE9', textColor: '#B4553A' },
  { id: 'jqrm', name: '经典名著', color: '#F5F0E1', textColor: '#7A6335' },
  { id: 'ercy', name: '儿童文学', color: '#E9F2F4', textColor: '#37606B' },
  { id: 'shkx', name: '社会科学', color: '#EDEAF6', textColor: '#5B4B8A' },
  { id: 'jsjx', name: '计算机', color: '#E8F0F7', textColor: '#1F4E79' },
  { id: 'xytl', name: '悬疑推理', color: '#ECEFF3', textColor: '#2C3E50' }
]

const books = [
  { id: 1, title: '斗破苍穹', author: '天蚕土豆', publisher: '起点中文网', cid: 'xhqh', price: 50, originalPrice: 68, sales: 12800, stock: 86, rating: 9.2, tags: ['热血', '升级流'], intro: '少年逆袭的东方玄幻长篇，节奏快、爽点密，适合想一口气读完的时候。' },
  { id: 2, title: '全职高手', author: '蝴蝶蓝', publisher: '羊城晚报出版社', cid: 'dsyn', price: 45, originalPrice: 58, sales: 9600, stock: 52, rating: 9.4, tags: ['电竞', '群像'], intro: '退役大神重回赛场的故事，写的是游戏，讲的是不服输的人。' },
  { id: 3, title: '明朝那些事儿', author: '当年明月', publisher: '浙江人民出版社', cid: 'lsjs', price: 68, originalPrice: 88, sales: 43000, stock: 120, rating: 9.3, tags: ['历史', '通俗'], intro: '把三百年明史讲成故事，读得进去的历史入门首选。' },
  { id: 4, title: '三体', author: '刘慈欣', publisher: '重庆出版社', cid: 'khkj', price: 52, originalPrice: 68, sales: 56000, stock: 210, rating: 9.6, tags: ['科幻', '硬核'], intro: '地球文明与三体文明的第一次接触，华语科幻的标杆之作。' },
  { id: 5, title: '鬼吹灯之精绝古城', author: '天下霸唱', publisher: '安徽文艺出版社', cid: 'dmty', price: 55, originalPrice: 69, sales: 21000, stock: 65, rating: 9.0, tags: ['探险', '悬疑'], intro: '摸金校尉深入古墓，氛围紧张，适合夜里开着一盏灯读。' },
  { id: 6, title: '最好的我们', author: '八月长安', publisher: '湖南文艺出版社', cid: 'xyxd', price: 42, originalPrice: 52, sales: 33000, stock: 88, rating: 8.9, tags: ['青春', '校园'], intro: '耿耿于怀的高中三年，写尽了那种说不清楚的少年心事。' },
  { id: 7, title: '倾城之恋', author: '张爱玲', publisher: '北京十月文艺出版社', cid: 'yyjj', price: 38, originalPrice: 45, sales: 8700, stock: 40, rating: 9.0, tags: ['民国', '爱情'], intro: '一座城的陷落成全了一对男女，张爱玲式的清醒与苍凉。' },
  { id: 8, title: '红楼梦', author: '曹雪芹', publisher: '人民文学出版社', cid: 'jqrm', price: 88, originalPrice: 118, sales: 29000, stock: 150, rating: 9.8, tags: ['古典', '四大名著'], intro: '读不完也读不腻的经典，每隔几年重读都会读出新的东西。' },
  { id: 9, title: '小王子', author: '圣埃克苏佩里', publisher: '人民文学出版社', cid: 'ercy', price: 32, originalPrice: 39, sales: 41000, stock: 200, rating: 9.3, tags: ['童话', '治愈'], intro: '写给大人的童话，关于驯养、责任和那些看不见的东西。' },
  { id: 10, title: '乌合之众', author: '古斯塔夫·勒庞', publisher: '中央编译出版社', cid: 'shkx', price: 48, originalPrice: 58, sales: 15000, stock: 72, rating: 8.7, tags: ['社会学', '心理'], intro: '群体如何变得冲动、轻信，读完之后看热搜会多一层判断。' },
  { id: 11, title: 'JavaScript 高级程序设计', author: 'Matt Frisbie', publisher: '人民邮电出版社', cid: 'jsjx', price: 128, originalPrice: 159, sales: 12000, stock: 45, rating: 9.1, tags: ['前端', '进阶'], intro: '前端进阶绕不开的一本厚书，原型、闭包、异步都讲到根上。' },
  { id: 12, title: '深入理解计算机系统', author: 'Randal E. Bryant', publisher: '机械工业出版社', cid: 'jsjx', price: 139, originalPrice: 169, sales: 8600, stock: 30, rating: 9.5, tags: ['底层', '经典'], intro: '从二进制到进程，把"程序到底怎么跑起来"讲透的一本书。' },
  { id: 13, title: '算法导论', author: 'Thomas H. Cormen', publisher: '机械工业出版社', cid: 'jsjx', price: 149, originalPrice: 189, sales: 6200, stock: 22, rating: 9.0, tags: ['算法', '教材'], intro: '算法课的圣经，适合边刷题边当工具书翻。' },
  { id: 14, title: '雪中悍刀行', author: '烽火戏诸侯', publisher: '北京联合出版公司', cid: 'xhqh', price: 68, originalPrice: 86, sales: 18000, stock: 60, rating: 8.8, tags: ['武侠', '江湖'], intro: '有江湖气也有书卷气，慢热但后劲很大的一部长篇。' },
  { id: 15, title: '流浪地球', author: '刘慈欣', publisher: '长江文艺出版社', cid: 'khkj', price: 42, originalPrice: 52, sales: 26000, stock: 95, rating: 9.2, tags: ['科幻', '中短篇'], intro: '带着地球去流浪，短篇里塞下了足够震撼的想象力。' },
  { id: 16, title: '藏地密码', author: '何马', publisher: '重庆出版社', cid: 'dmty', price: 56, originalPrice: 68, sales: 11000, stock: 48, rating: 8.6, tags: ['探险', '西藏'], intro: '关于西藏的探险长篇，风景、传说和谜题一起铺开。' },
  { id: 17, title: '你好，旧时光', author: '八月长安', publisher: '湖南文艺出版社', cid: 'xyxd', price: 38, originalPrice: 48, sales: 24000, stock: 70, rating: 8.8, tags: ['青春', '成长'], intro: '余周周的故事，写的是一代人共同的少年时代。' },
  { id: 18, title: '半生缘', author: '张爱玲', publisher: '北京十月文艺出版社', cid: 'yyjj', price: 39, originalPrice: 46, sales: 7600, stock: 36, rating: 8.9, tags: ['民国', '遗憾'], intro: '错过的两个人，和那半生的距离，读起来钝钝地疼。' },
  { id: 19, title: '三国演义', author: '罗贯中', publisher: '人民文学出版社', cid: 'jqrm', price: 68, originalPrice: 88, sales: 22000, stock: 110, rating: 9.4, tags: ['古典', '历史'], intro: '权谋、义气与人心，中国人最熟悉的那段历史叙事。' },
  { id: 20, title: '哈利·波特与魔法石', author: 'J.K. 罗琳', publisher: '人民文学出版社', cid: 'ercy', price: 45, originalPrice: 59, sales: 38000, stock: 140, rating: 9.5, tags: ['奇幻', '成长'], intro: '九又四分之三站台，很多人童年阅读的起点。' },
  { id: 21, title: '夏洛的网', author: 'E.B. 怀特', publisher: '上海译文出版社', cid: 'ercy', price: 32, originalPrice: 39, sales: 19000, stock: 80, rating: 9.2, tags: ['童话', '友情'], intro: '一只蜘蛛和一头小猪的约定，温柔地讲离别这件事。' },
  { id: 22, title: '人类简史', author: '尤瓦尔·赫拉利', publisher: '中信出版社', cid: 'shkx', price: 58, originalPrice: 68, sales: 47000, stock: 130, rating: 9.1, tags: ['历史', '通识'], intro: '从认知革命讲到人工智能，用一本书重新看一遍人类。' },
  { id: 23, title: '思考，快与慢', author: '丹尼尔·卡尼曼', publisher: '中信出版社', cid: 'shkx', price: 62, originalPrice: 76, sales: 20000, stock: 58, rating: 8.9, tags: ['心理', '决策'], intro: '系统 1 与系统 2 的博弈，读完会怀疑自己很多判断。' },
  { id: 24, title: '代码整洁之道', author: 'Robert C. Martin', publisher: '人民邮电出版社', cid: 'jsjx', price: 79, originalPrice: 99, sales: 9800, stock: 42, rating: 9.0, tags: ['工程化', '规范'], intro: '命名、函数、注释怎么写得让人愿意接手，程序员的基础修养。' },
  { id: 25, title: '重构：改善既有代码的设计', author: 'Martin Fowler', publisher: '人民邮电出版社', cid: 'jsjx', price: 108, originalPrice: 138, sales: 5400, stock: 26, rating: 9.3, tags: ['重构', '设计'], intro: '把"能跑"的代码改成"好改"的代码，案例可以反复对照。' },
  { id: 26, title: '你当像鸟飞往你的山', author: '塔拉·韦斯特弗', publisher: '南海出版公司', cid: 'shkx', price: 59, originalPrice: 72, sales: 31000, stock: 76, rating: 9.2, tags: ['自传', '成长'], intro: '一个女孩从山里走到剑桥，教育如何重塑一个人。' },
  { id: 27, title: '平凡的世界', author: '路遥', publisher: '北京十月文艺出版社', cid: 'jqrm', price: 88, originalPrice: 108, sales: 35000, stock: 100, rating: 9.5, tags: ['现实', '奋斗'], intro: '黄土高原上两代人的命运，朴素但有力量。' },
  { id: 28, title: '围城', author: '钱锺书', publisher: '人民文学出版社', cid: 'jqrm', price: 45, originalPrice: 56, sales: 16000, stock: 64, rating: 9.1, tags: ['讽刺', '婚姻'], intro: '"城里的人想出去"，婚姻与人生的经典比喻。' },
  { id: 29, title: '活着', author: '余华', publisher: '作家出版社', cid: 'jqrm', price: 35, originalPrice: 45, sales: 52000, stock: 160, rating: 9.6, tags: ['现实', '命运'], intro: '福贵的一生，读完很久说不出话，但会想再活认真一点。' },
  { id: 30, title: '白夜行', author: '东野圭吾', publisher: '南海出版公司', cid: 'xytl', price: 49, originalPrice: 60, sales: 28000, stock: 84, rating: 9.3, tags: ['推理', '暗黑'], intro: '两个孩子在黑暗里互为光，推理外壳下的残酷成长。' },
  { id: 31, title: '解忧杂货店', author: '东野圭吾', publisher: '南海出版公司', cid: 'xytl', price: 39, originalPrice: 49, sales: 36000, stock: 92, rating: 9.0, tags: ['温暖', '治愈'], intro: '寄信到过去，收到的其实是自己心里的答案。' },
  { id: 32, title: '万历十五年', author: '黄仁宇', publisher: '中华书局', cid: 'lsjs', price: 52, originalPrice: 65, sales: 13000, stock: 54, rating: 9.2, tags: ['历史', '大历史观'], intro: '看似平淡的一年，藏着整个王朝走向的伏笔。' }
].map((b) => Object.assign({}, b, {
  cover: '/images/covers/c' + (b.id < 10 ? '0' + b.id : b.id) + '.jpg'
}))

module.exports = {
  categories,
  books
}
