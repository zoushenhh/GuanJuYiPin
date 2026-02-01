// 县令 - AI驱动的古代县令模拟器
import type { Region, Background, Aptitude, PostHeaven, Ability } from '@/types';

// =======================================================================
//                           本地朝代数据
// =======================================================================
export const LOCAL_REGIONS: Omit<Region, 'source'>[] = [
  {
    id: 1,
    name: '秦朝',
    era: '公元前221-公元前207年',
    description: '中国历史上第一个大一统王朝，推行郡县制，统一文字、货币、度量衡。中央集权制度建立，法家思想主导。官员由皇帝任免，实行三公九卿制。徭役繁重，修长城、建阿房宫、开灵渠等大型工程。官场以法治为纲，赏罚分明。为官者需严格执行朝廷法度，维护大一统局面。',
  },
  {
    id: 2,
    name: '西汉',
    era: '公元前202-公元8年',
    description: '刘邦建立，推行郡国并行制，后逐步削藩。汉武帝时期罢黜百家独尊儒术，确立儒家正统地位。开辟丝绸之路，对外交流频繁。官制完善，设立刺史制度监察地方。科举制度萌芽，察举制选拔人才。为官者需通晓儒家经典，修身齐家治国平天下。',
  },
  {
    id: 3,
    name: '东汉',
    era: '公元25-220年',
    description: '刘秀重建汉室，豪强势力崛起。外戚宦官交替专权，党锢之祸影响深远。太学兴盛，士人集团形成。造纸术改进，文化传播加速。为官者需周旋于外戚宦官之间，坚守士大夫气节。',
  },
  {
    id: 4,
    name: '三国',
    era: '公元220-280年',
    description: '魏蜀吴三分天下，战争频繁。各国唯才是举，破格用人。屯田制推行，恢复农业生产。诸葛亮治蜀，鞠躬尽瘁；曹操统一北方，挟天子令诸侯。为官者需审时度势，择明主而事。',
  },
  {
    id: 5,
    name: '西晋',
    era: '公元265-316年',
    description: '司马炎统一三国，门阀士族制度形成。九品中正制施行，上品无寒门。奢靡成风，八王之乱削弱国力。五胡乱华，永嘉南渡。为官者多出身名门望族，讲究门第出身。',
  },
  {
    id: 6,
    name: '东晋',
    era: '公元317-420年',
    description: '司马睿在建康建立，偏安江南。北士南渡，南北士族融合。王谢袁萧等门阀把持朝政。北伐尝试屡屡失败。清谈玄学盛行，佛教道教发展。为官者多世袭特权，讲究风度气韵。',
  },
  {
    id: 7,
    name: '南北朝',
    era: '公元420-589年',
    description: '南朝宋齐梁陈延续汉人政权，北朝北魏等少数民族政权汉化。民族融合加速，佛教兴盛。均田制推行，府兵制建立。文化南北差异明显，南文北武。为官者需应对复杂的民族关系和政治变革。',
  },
  {
    id: 8,
    name: '隋朝',
    era: '公元581-618年',
    description: '杨坚统一南北，结束长期分裂。开创科举制度，打破门阀垄断。修建大运河，沟通南北。三省六部制确立，中央集权加强。隋炀帝穷兵黩武，导致农民起义。为官者可通过科举入仕，寒门子弟有机会进入政坛。',
  },
  {
    id: 9,
    name: '唐朝',
    era: '公元618-907年',
    description: '中国历史最强盛时期之一。贞观之治、开元盛世达到顶峰。科举制度完善，诗歌文化繁荣。丝绸之路畅通，万国来朝。安史之乱后由盛转衰，藩镇割据。为官者需通过科举考试，诗文才华备受推崇。',
  },
  {
    id: 10,
    name: '五代十国',
    era: '公元907-960年',
    description: '唐末藩镇割据演变而来的分裂时期。北方五代更替频繁，南方十国相对稳定。武人当政，战乱不断。后周柴荣开始统一进程。南唐、吴越等文化繁荣。为官者需适应频繁政权更替，明哲保身。',
  },
  {
    id: 11,
    name: '北宋',
    era: '公元960-1127年',
    description: '赵匡胤陈桥兵变建立，重文轻武。杯酒释兵权，加强中央集权。科举制度鼎盛，寒门大量入仕。经济繁荣，商业发达。但冗官冗兵问题严重，财政困难。司马光王安石变法之争。为官者多为文官，通过科举晋升。',
  },
  {
    id: 12,
    name: '南宋',
    era: '公元1127-1279年',
    description: '北宋灭亡后赵构建立，偏安江南。岳飞抗金被秦桧陷害。经济重心南移完成，海上贸易繁荣。理学兴起，朱熹集大成。文风华丽，词作兴盛。为官者需应对金国威胁，主战主和派斗争激烈。',
  },
  {
    id: 13,
    name: '元朝',
    era: '公元1271-1368年',
    description: '蒙古族建立，首次少数民族统一中国。四等人制度，蒙古人色目人汉人南人等级分明。科举制度中断，后期恢复但名额受限。行省制度设立，疆域辽阔。东西交流频繁，马可波罗来华。为官者多蒙古色目人，汉人官员受限。',
  },
  {
    id: 14,
    name: '明朝',
    era: '公元1368-1644年',
    description: '朱元璋推翻元朝建立，恢复汉族统治。废除丞相制度，皇权高度集中。内阁制度形成，票拟批红分离。八股取士，思想僵化。郑和下西洋，展现国力。后期宦官专政，东厂西厂特务统治。为官者需通过科举八股，党争激烈。',
  },
];

// =======================================================================
//                           本地地域数据
// =======================================================================
// 官品点机制：贫瘠地区官品点多（难度高），繁华地区官品点少（难度低）
// 县大小固定：村级
export const LOCAL_BACKGROUNDS: Omit<Background, 'source'>[] = [
  { id: 1, name: '西北边陲', description: '位于西北边境的荒漠戈壁，土地贫瘠，水源稀缺，民风彪悍。常受游牧民族侵扰，匪患严重。官品点充裕但治理难度极高。', total_points: 100, rarity: 2, color: '#F56565' },
  { id: 2, name: '西南山区', description: '崇山峻岭，交通闭塞，经济落后。少数民族聚居，文化差异大，政务复杂。自然环境恶劣，疾病频发。', total_points: 90, rarity: 2, color: '#ED8936' },
  { id: 3, name: '塞北草原', description: '北方草原边缘，地广人稀，牧业为主。气候严寒，冬季漫长。部落迁徙频繁，治理难度大。', total_points: 85, rarity: 2, color: '#ECC94B' },
  { id: 4, name: '中原腹地', description: '中原核心区域，土地肥沃，农业发达。人口密集，商业繁荣。交通便利，文化昌盛。但竞争激烈，政务繁忙。', total_points: 60, rarity: 3, color: '#48BB78' },
  { id: 5, name: '江南水乡', description: '长江三角洲，水网密布，鱼米之乡。经济富庶，文风鼎盛。商业发达，市镇林立。物产丰饶，生活优渥。', total_points: 50, rarity: 4, color: '#4299E1' },
  { id: 6, name: '京畿重地', description: '京城周边，天子脚下。权贵云集，政务繁杂。考核严格，升迁机会多但风险也大。一举一动备受关注。', total_points: 40, rarity: 4, color: '#9F7AEA' },
  { id: 7, name: '沿海商埠', description: '沿海港口城市，海上贸易繁荣。外商云集，商贸发达。物产丰富，税收充足。但海防压力、走私问题突出。', total_points: 45, rarity: 4, color: '#38B2AC' },
  { id: 8, name: '偏远海岛', description: '孤悬海外，与世隔绝。台风频发，补给困难。民风淳朴但观念保守。开发潜力大但基础设施薄弱。', total_points: 80, rarity: 3, color: '#805AD5' },
  { id: 9, name: '丘陵地带', description: '地形起伏，交通不便。农业以梯田为主，产量有限。经济欠发达，民生困难。土匪藏匿，治安复杂。', total_points: 75, rarity: 3, color: '#D69E2E' },
  { id: 10, name: '湖泽湿地', description: '湖泊沼泽遍布，水患频发。渔业为主，农业受限。交通不便，瘟疫易发。治理难度中等偏上。', total_points: 70, rarity: 3, color: '#319795' },
  { id: 11, name: '关隘要冲', description: '交通咽喉，兵家必争。商旅往来，税收可观。但军事压力大，防务开支巨大。需兼顾军民两务。', total_points: 55, rarity: 3, color: '#DD6B20' },
  { id: 12, name: '贫瘠荒原', description: '土地沙化严重，植被稀少。水源匮乏，生存艰难。人口外流严重。治理极其困难，需大规模投入。', total_points: 95, rarity: 2, color: '#C53030' },
];

// =======================================================================
//                           本地天资数据 (原出身数据)
// =======================================================================
export const LOCAL_APTITUDES: Omit<Aptitude, 'source'>[] = [
  { id: 1, name: '孤儿出身', description: '自幼父母双亡，吃百家饭长大，磨练出坚韧的意志和过人的体魄。', talent_cost: 0, attribute_modifiers: { 政务: 1 }, rarity: 3 },
  { id: 2, name: '书香门第', description: '出身于官宦世家，饱读诗书，对治国之道有超乎常人的理解力。', talent_cost: 2, attribute_modifiers: { 经济: 2 }, rarity: 3 },
  { id: 3, name: '商贾之家', description: '生于富贵之家，精通人情世故，处事圆滑，魅力非凡。', talent_cost: 2, attribute_modifiers: { 民生: 2 }, rarity: 3 },
  { id: 4, name: '将门之后', description: '名将的后代，血脉中流淌着勇武与煞气，心性坚定。', talent_cost: 3, attribute_modifiers: { 军事: 2, 威望: 1 }, rarity: 3 },
  { id: 5, name: '幕僚出身', description: '你的恩师是一位游历四方的大幕僚，你继承了他的部分衣钵和见识。', talent_cost: 4, attribute_modifiers: { 经济: 1, 文化: 1 }, rarity: 4 },
  { id: 6, name: '前朝遗臣', description: '你保留着前朝的记忆，虽然官位尽失，但对官场和未来的大事了如指掌。', talent_cost: 5, attribute_modifiers: { 经济: 2, 文化: 1 }, rarity: 5 },
  { id: 7, name: '世家子弟', description: '你的家族中流淌着稀薄的高官血脉，天生威严十足，升迁速度略快于常人。', talent_cost: 6, attribute_modifiers: { 威望: 2, 政务: 1 }, rarity: 5 },
  { id: 8, name: '革职复起', description: '你是一名被革职后重新起用的老臣，虽然占据了新的职位，但记忆中蕴含着庞大的官场经验。', talent_cost: 7, attribute_modifiers: { 经济: 3, 威望: -1 }, rarity: 5 },
  { id: 9, name: '渔民之后', description: '祖上世代捕鱼为生，水性极佳，体魄强健。', talent_cost: 1, attribute_modifiers: { 政务: 2 }, rarity: 2 },
  { id: 10, name: '皇室宗亲', description: '生于皇家的权力之巅，自幼享受锦衣玉食和最好的教育，但与基层官场的接触较少。', talent_cost: 3, attribute_modifiers: { 民生: 2, 威望: 1 }, rarity: 4 },
  { id: 11, name: '药铺伙计', description: '自幼在药铺长大，日夜与药材为伴，对医理有超常的敏感。', talent_cost: 2, attribute_modifiers: { 民生: 1, 经济: 1 }, rarity: 3 },
  { id: 12, name: '账房学徒', description: '师从账房先生，自小研习账目，对数字极其敏锐。', talent_cost: 3, attribute_modifiers: { 经济: 2, 民生: 1 }, rarity: 4 },
  { id: 13, name: '捕快世家', description: '祖上世代捕快，骨子里透着勇武之气，对罪犯极其敏感。', talent_cost: 4, attribute_modifiers: { 军事: 2, 威望: 1 }, rarity: 4 },
  { id: 14, name: '乞丐出身', description: '自幼流落街头，饱经风霜，磨练出超凡的意志和适应能力。', talent_cost: -1, attribute_modifiers: { 威望: 2, 民生: -1 }, rarity: 2 },
  { id: 15, name: '矿工余生', description: '曾是矿工，在暗无天日的矿洞中挣扎求生，体魄强健但不通文墨。', talent_cost: 0, attribute_modifiers: { 政务: 3, 文化: -1 }, rarity: 2 },
  { id: 16, name: '画师弟子', description: '师承名家，精通书画之道，对文书有天生的理解力。', talent_cost: 3, attribute_modifiers: { 文化: 1, 民生: 2 }, rarity: 3 },
  { id: 17, name: '戏班出身', description: '自幼学戏，擅长察言观色，魅力非凡，但为官之心不够坚定。', talent_cost: 1, attribute_modifiers: { 民生: 3, 威望: -1 }, rarity: 2 },
  { id: 18, name: '儒生世家', description: '世代科举入仕，饱读诗书，对经典和政事有超常理解力。', talent_cost: 4, attribute_modifiers: { 文化: 2, 政务: 1 }, rarity: 4 },
  { id: 19, name: '医者世家', description: '世代行医济世，对民生疾苦和疾病有特殊敏感。', talent_cost: 3, attribute_modifiers: { 民生: 2, 文化: 1 }, rarity: 3 },
  { id: 20, name: '算学世家', description: '世代精通算术，对财政统计和账目管理有天赋。', talent_cost: 3, attribute_modifiers: { 经济: 2, 文化: 1 }, rarity: 3 },
  { id: 21, name: '法学世家', description: '世代研习律法，对刑名断案有深刻理解。', talent_cost: 3, attribute_modifiers: { 政务: 2, 文化: 1 }, rarity: 3 },
  { id: 22, name: '农学家传', description: '世代耕读传家，对农事桑麻有丰富经验。', talent_cost: 2, attribute_modifiers: { 民生: 2, 经济: 1 }, rarity: 2 },
  { id: 23, name: '史官世家', description: '世代修史，对历史兴衰和政治变革有独到见解。', talent_cost: 4, attribute_modifiers: { 文化: 2, 威望: 1 }, rarity: 4 },
  { id: 24, name: '亡国之臣', description: '国破家亡，历经苦难，心性坚韧如铁，但背负着沉重的仇恨。', talent_cost: 2, attribute_modifiers: { 威望: 3, 民生: -1 }, rarity: 3 }
];

// =======================================================================
//                           本地后天数据 (学科才能体系)
// =======================================================================
export const LOCAL_POST_HEAVENS: Omit<PostHeaven, 'source'>[] = [
  // ============== 上品学科 (1.6x, 10点) ==============
  {
    id: 1,
    name: '算学',
    tier: '上品',
    description: '精通算术之理，对财政统计、账目管理有超凡天赋。擅长处理钱粮赋税，是理财的好手。',
    cultivation_speed: '1.6x',
    special_effects: ['财政管理+50%', '账目处理+40%', '统计精通'],
    base_multiplier: 1.6,
    talent_cost: 10,
    rarity: 3
  },
  {
    id: 2,
    name: '法学',
    tier: '上品',
    description: '深谙律法之道，对刑名断案有超凡理解。处理案件得心应手，是断案的良才。',
    cultivation_speed: '1.6x',
    special_effects: ['断案能力+50%', '律法精通', '审判公正'],
    base_multiplier: 1.6,
    talent_cost: 10,
    rarity: 3
  },
  {
    id: 3,
    name: '医学',
    tier: '上品',
    description: '精通医理，对民生疾苦有特殊敏感。处理医疗卫生事务事半功倍，深得民心。',
    cultivation_speed: '1.6x',
    special_effects: ['民生处理+50%', '医疗精通', '民心提升'],
    base_multiplier: 1.6,
    talent_cost: 10,
    rarity: 3
  },
  {
    id: 4,
    name: '农学',
    tier: '上品',
    description: '深谙农事桑麻，对农业耕种有超凡理解。处理农业事务得心应手，保障粮食生产。',
    cultivation_speed: '1.6x',
    special_effects: ['农业管理+50%', '粮食增产', '农时精通'],
    base_multiplier: 1.6,
    talent_cost: 10,
    rarity: 3
  },

  // ============== 中品学科 (1.3x, 6点) ==============
  {
    id: 5,
    name: '史学',
    tier: '中品',
    description: '熟读史书，对历史兴衰有深刻理解。从历史中汲取经验，政务处理稳健。',
    cultivation_speed: '1.3x',
    special_effects: ['政务稳健+25%', '历史经验', '借鉴前人'],
    base_multiplier: 1.3,
    talent_cost: 6,
    rarity: 2
  },
  {
    id: 6,
    name: '文学',
    tier: '中品',
    description: '文笔出众，擅长撰写公文。处理文书事务效率高，文化修养深厚。',
    cultivation_speed: '1.3x',
    special_effects: ['文书处理+25%', '文采斐然', '公文精通'],
    base_multiplier: 1.3,
    talent_cost: 6,
    rarity: 2
  },
  {
    id: 7,
    name: '工学',
    tier: '中品',
    description: '精通技艺之理，对工程建设有不错理解。处理建设事务效率较高。',
    cultivation_speed: '1.3x',
    special_effects: ['工程建设+25%', '技艺理解', '施工管理'],
    base_multiplier: 1.3,
    talent_cost: 6,
    rarity: 2
  },
  {
    id: 8,
    name: '商学',
    tier: '中品',
    description: '熟悉商贸流通，对市场运作有不错理解。处理商业事务效率较高。',
    cultivation_speed: '1.3x',
    special_effects: ['商业管理+25%', '市场理解', '税收增加'],
    base_multiplier: 1.3,
    talent_cost: 6,
    rarity: 2
  },

  // ============== 特殊学科 ==============
  {
    id: 9,
    name: '经学',
    tier: '特殊',
    description: '饱读经书，对科举考试有特殊加成。精通经典，仕途晋升更为顺利。',
    cultivation_speed: '科举加成',
    special_effects: ['科举通过率+30%', '经义精通', '考运亨通'],
    base_multiplier: 1.0,
    talent_cost: 8,
    rarity: 4
  },

  // ============== 凡品 ==============
  {
    id: 10,
    name: '平庸',
    tier: '凡品',
    description: '平平无奇的普通才能，没有特别擅长的领域，但也无明显短板。',
    cultivation_speed: '1.0x',
    special_effects: ['平庸之道'],
    base_multiplier: 1.0,
    talent_cost: 0,
    rarity: 1
  },

  // ============== 绝品学科 (2.0x, 15点) ==============
  {
    id: 11,
    name: '神算',
    tier: '绝品',
    description: '万中无一的算学奇才，对数字有超凡敏感。处理财政事务速度极快，是理财的天生奇才。',
    cultivation_speed: '2.0x',
    special_effects: ['算学能力+80%', '神机妙算', '财政精通'],
    base_multiplier: 2.0,
    talent_cost: 15,
    rarity: 4
  },
  {
    id: 12,
    name: '法圣',
    tier: '绝品',
    description: '极为罕见的法学天才，精通律法，明察秋毫。处理刑名案件速度极快，断案如神。',
    cultivation_speed: '2.0x',
    special_effects: ['法学能力+80%', '律法精通', '断案如神'],
    base_multiplier: 2.0,
    talent_cost: 15,
    rarity: 4
  },
  {
    id: 13,
    name: '神医',
    tier: '绝品',
    description: '传说中的医学天才，对医理有超凡理解。处理医疗卫生事务速度极快，妙手回春。',
    cultivation_speed: '2.0x',
    special_effects: ['医学能力+80%', '妙手回春', '民望提升'],
    base_multiplier: 2.0,
    talent_cost: 15,
    rarity: 4
  },
  {
    id: 14,
    name: '农圣',
    tier: '绝品',
    description: '传说中的农学天才，对农事有超凡理解。处理农业事务速度极快，五谷丰登。',
    cultivation_speed: '2.0x',
    special_effects: ['农学能力+80%', '五谷丰登', '粮食增产'],
    base_multiplier: 2.0,
    talent_cost: 15,
    rarity: 4
  },

  // ============== 国士学科 (2.8x+, 25+点) ==============
  {
    id: 15,
    name: '全才',
    tier: '国士',
    description: '传说中的至高全才，文武双全，包容万象。可处理所有政务，触类旁通，但初期进展缓慢，后期一日千里。',
    cultivation_speed: '0.8x(前期) -> 2.8x(后期)',
    special_effects: ['全系政务亲和', '无领域限制', '超常发挥+50%', '升迁概率+30%'],
    base_multiplier: 2.8,
    talent_cost: 25,
    rarity: 5
  },
  {
    id: 16,
    name: '权术',
    tier: '国士',
    description: '传说中的至高权术才能，掌控官场法则，可周旋各方。处理极难但潜力无穷。',
    cultivation_speed: '0.9x(前期) -> 3.0x(后期)',
    special_effects: ['权术精通', '周旋各方', '平衡之道', '制衡之术'],
    base_multiplier: 3.0,
    talent_cost: 25,
    rarity: 5
  },
  {
    id: 17,
    name: '天命',
    tier: '国士',
    description: '最为稀有的传说才能，触及国运机缘。升迁艰难但一旦有成，可逆转局势，掌控时势。',
    cultivation_speed: '0.8x(前期) -> 3.2x(后期)',
    special_effects: ['天命政事精通', '时来运转', '局势推演', '机会把握'],
    base_multiplier: 3.2,
    talent_cost: 28,
    rarity: 5
  },

  // ============== 处世之道 ==============
  {
    id: 18,
    name: '清廉',
    tier: '特殊',
    description: '天生清廉，不爱钱财，升迁速度极为缓慢，常人难以忍受。但一旦厚积薄发，名望无比扎实，政绩远超同阶。',
    cultivation_speed: '0.5x',
    special_effects: ['名望极其稳固', '升迁后实力暴增+100%', '诱惑抗性+80%', '清名远播'],
    base_multiplier: 0.5,
    talent_cost: -5,
    rarity: 4
  },
  {
    id: 19,
    name: '权谋',
    tier: '特殊',
    description: '善于权谋，以权谋为引，处理政务迅速但需要大量资源支撑。容易结党营私，但政绩增长极快。',
    cultivation_speed: '1.8x',
    special_effects: ['权谋能力+70%', '势力扩张', '结党营私', '派系亲和'],
    base_multiplier: 1.8,
    talent_cost: 10,
    rarity: 4
  },
  {
    id: 20,
    name: '酷吏',
    tier: '特殊',
    description: '善于严刑峻法，能够通过威慑维持治安，处理治安事务速度极快，但被百姓所畏惧。',
    cultivation_speed: '1.7x',
    special_effects: ['治安能力+60%', '威慑控制', '恐惧免疫', '严刑天赋'],
    base_multiplier: 1.7,
    talent_cost: 8,
    rarity: 4
  },

  // ============== 下品学科 (1.1x, 3点) ==============
  {
    id: 21,
    name: '文书',
    tier: '下品',
    description: '较为常见的文书才能，虽然资质一般，但胜在细致认真，处理公文迅捷。',
    cultivation_speed: '1.1x',
    special_effects: ['文书处理+15%', '办事速度+20%'],
    base_multiplier: 1.1,
    talent_cost: 3,
    rarity: 1
  },
];

// =======================================================================
//                           本地能力数据 (原天赋数据)
// =======================================================================
export const LOCAL_ABILITIES: Omit<Ability, 'source'>[] = [
  {
    id: 1,
    name: '天命县令',
    description: '福星高照，总是能在绝境中逢生，获得意想不到的机遇。',
    talent_cost: 15,
    rarity: 5,
    effects: [
      { 类型: '县令六司', 目标: '文化', 数值: 8 },
      { 类型: '特殊能力', 名称: '逢凶化吉', 数值: 0.1 }
    ]
  },
  {
    id: 2,
    name: '断案如神',
    description: '天生明察秋毫，任何案子一看便会，且破案率倍增。',
    talent_cost: 12,
    rarity: 5,
    effects: [
      { 类型: '技能加成', 技能: '断案', 数值: 0.2 },
      { 类型: '县令六司', 目标: '政务', 数值: 3 }
    ]
  },
  {
    id: 3,
    name: '理财能手',
    description: '对财政有超凡的领悟力，理政成功率与品质大幅提升。',
    talent_cost: 12,
    rarity: 5,
    effects: [
      { 类型: '技能加成', 技能: '理财', 数值: 0.15 },
      { 类型: '县令六司', 目标: '经济', 数值: 2 }
    ]
  },
  {
    id: 4,
    name: '治世能臣',
    description: '对治理有极高的天赋，处理政务和建设的效率大大提高。',
    talent_cost: 8,
    rarity: 4,
    effects: [
      { 类型: '技能加成', 技能: '治理', 数值: 0.12 },
      { 类型: '县令六司', 目标: '经济', 数值: 2 }
    ]
  },
  {
    id: 5,
    name: '制造专家',
    description: '天生对各种资源有敏锐的感知，制作时更容易出现精品。',
    talent_cost: 8,
    rarity: 4,
    effects: [
      { 类型: '技能加成', 技能: '制作', 数值: 0.1 },
      { 类型: '特殊能力', 名称: '资源感知', 数值: 1 }
    ]
  },
  {
    id: 6,
    name: '多宝之人',
    description: '外出巡查时，更容易发现天材地宝。',
    talent_cost: 7,
    rarity: 4,
    effects: [
      { 类型: '县令六司', 目标: '文化', 数值: 3 },
      { 类型: '特殊能力', 名称: '寻宝天赋', 数值: 0.15 }
    ]
  },
  {
    id: 7,
    name: '武艺高强',
    description: '武力天生强横，气血旺盛，适合武官路线。',
    talent_cost: 5,
    rarity: 3,
    effects: [
      { 类型: '县令六司', 目标: '军事', 数值: 3 },
      { 类型: '特殊能力', 名称: '武学天赋', 数值: 0.1 }
    ]
  },
  {
    id: 8,
    name: '洞察力强',
    description: '天生洞察力强大，不易被蒙骗，施政效果更佳。',
    talent_cost: 5,
    rarity: 3,
    effects: [
      { 类型: '县令六司', 目标: '文化', 数值: 3 },
      { 类型: '特殊能力', 名称: '蒙骗抗性', 数值: 0.1 }
    ]
  },
  {
    id: 9,
    name: '身法敏捷',
    description: '身法敏捷，应对突发事件能力更强。',
    talent_cost: 4,
    rarity: 3,
    effects: [
      { 类型: '县令六司', 目标: '民生', 数值: 2 },
      { 类型: '特殊能力', 名称: '应变天赋', 数值: 0.08 }
    ]
  },
  {
    id: 10,
    name: '农家出身',
    description: '出身农家，心性坚韧，对农业有额外的亲和力。',
    talent_cost: 2,
    rarity: 2,
    effects: [
      { 类型: '县令六司', 目标: '威望', 数值: 1 },
      { 类型: '特殊能力', 名称: '农业亲和', 数值: 0.1 }
    ]
  },
  {
    id: 11,
    name: '过目不忘',
    description: '记忆力超群，学习典籍公文速度加快。',
    talent_cost: 2,
    rarity: 2,
    effects: [
      { 类型: '县令六司', 目标: '文化', 数值: 2 }
    ]
  },
  {
    id: 12,
    name: '老实人',
    description: '与人打交道时，不容易被欺骗。',
    talent_cost: 1,
    rarity: 1,
    effects: [
      { 类型: '特殊能力', 名称: '防欺诈', 数值: 1 }
    ]
  },
  {
    id: 13,
    name: '一诺千金',
    description: '你的承诺极具分量，更容易获得他人的信任与好感。',
    talent_cost: 3,
    rarity: 2,
    effects: [
      { 类型: '县令六司', 目标: '民生', 数值: 2 }
    ]
  },
  {
    id: 14,
    name: '铁面无私',
    description: '执法如山，不畏权贵，能更好地维护法度，但权贵不愿亲近。',
    talent_cost: 6,
    rarity: 4,
    effects: [
      { 类型: '特殊能力', 名称: '不畏权贵', 数值: 1 },
      { 类型: '技能加成', 技能: '执法', 数值: 0.15 },
      { 类型: '县令六司', 目标: '民生', 数值: -2 }
    ]
  },
  {
    id: 15,
    name: '文书精通',
    description: '在处理公文时，有一定几率产生意想不到的效率。',
    talent_cost: 4,
    rarity: 3,
    effects: [
      { 类型: '技能加成', 技能: '文书', 数值: 0.1 },
      { 类型: '特殊能力', 名称: '文书变异', 数值: 0.05 }
    ]
  },
  {
    id: 16,
    name: '顶级魅力',
    description: '天生丽质，气质非凡，魅力超群。无论走到哪里都是众人瞩目的焦点，极容易获得他人的好感与信任。在社交场合如鱼得水，能够以言语和魅力化解大部分冲突。',
    talent_cost: 8,
    rarity: 4,
    effects: [
      { 类型: '县令六司', 目标: '民生', 数值: 5 },
      { 类型: '特殊能力', 名称: '魅力光环', 数值: 0.2 },
      { 类型: '特殊能力', 名称: '社交天赋', 数值: 0.15 }
    ]
  },
  {
    id: 17,
    name: '为官清廉',
    description: '清廉如水，不受贿赂。升迁时更不容易犯错，受到诱惑和陷害的几率大幅降低。',
    talent_cost: 6,
    rarity: 4,
    effects: [
      { 类型: '县令六司', 目标: '威望', 数值: 3 },
      { 类型: '特殊能力', 名称: '贿赂抗性', 数值: 0.3 }
    ]
  },
  {
    id: 18,
    name: '天生神力',
    description: '天生力大无穷，体质远超常人。擅长近战搏杀，气血旺盛。',
    talent_cost: 5,
    rarity: 3,
    effects: [
      { 类型: '县令六司', 目标: '军事', 数值: 4 },
      { 类型: '特殊能力', 名称: '近战增幅', 数值: 0.2 }
    ]
  },
  {
    id: 19,
    name: '洞察敏锐',
    description: '六感超凡，对危险有本能的预感。在政务和突发事件中能够提前感知到威胁。',
    talent_cost: 4,
    rarity: 3,
    effects: [
      { 类型: '县令六司', 目标: '民生', 数值: 3 },
      { 类型: '特殊能力', 名称: '危险感知', 数值: 1 }
    ]
  },
  {
    id: 20,
    name: '夜猫子',
    description: '夜晚精神百倍，办公效率提升。但白天会感到困倦。',
    talent_cost: 1,
    rarity: 2,
    effects: [
      { 类型: '特殊能力', 名称: '夜间办公加速', 数值: 0.3 }
    ]
  },
  {
    id: 21,
    name: '天命眷顾',
    description: '受天命眷顾，升迁时成功率更高，遭遇政敌时威力减弱。',
    talent_cost: 10,
    rarity: 5,
    effects: [
      { 类型: '县令六司', 目标: '文化', 数值: 5 },
      { 类型: '特殊能力', 名称: '升迁成功率', 数值: 0.2 },
      { 类型: '特殊能力', 名称: '政敌削弱', 数值: 0.15 }
    ]
  },
  {
    id: 22,
    name: '刚正不阿',
    description: '天生刚正，不畏权贵。断案威力倍增，积累威望速度极快。',
    talent_cost: 10,
    rarity: 5,
    effects: [
      { 类型: '县令六司', 目标: '军事', 数值: 2 },
      { 类型: '技能加成', 技能: '断案', 数值: 0.25 },
      { 类型: '特殊能力', 名称: '威望积累', 数值: 0.2 }
    ]
  },
  {
    id: 23,
    name: '天生全才',
    description: '天生的全才，对各类政务都有超凡领悟力，施政效率事半功倍。',
    talent_cost: 18,
    rarity: 5,
    effects: [
      { 类型: '县令六司', 目标: '文化', 数值: 4 },
      { 类型: '县令六司', 目标: '民生', 数值: 4 },
      { 类型: '特殊能力', 名称: '政务精通', 数值: 0.3 }
    ]
  },
  {
    id: 24,
    name: '文书奇才',
    description: '对文书有超凡的领悟，处理公文成功率高，效率强大。',
    talent_cost: 7,
    rarity: 4,
    effects: [
      { 类型: '县令六司', 目标: '文化', 数值: 2 },
      { 类型: '技能加成', 技能: '文书', 数值: 0.2 },
      { 类型: '特殊能力', 名称: '文书精通', 数值: 0.15 }
    ]
  },
  {
    id: 25,
    name: '得力助手',
    description: '天生善于培养下属，更容易招募和管理幕僚，部属能力提升。',
    talent_cost: 6,
    rarity: 4,
    effects: [
      { 类型: '县令六司', 目标: '民生', 数值: 2 },
      { 类型: '特殊能力', 名称: '下属契约', 数值: 0.3 },
      { 类型: '特殊能力', 名称: '部属能力', 数值: 0.2 }
    ]
  },
  {
    id: 26,
    name: '权谋之心',
    description: '心性偏向权谋，处理政事速度极快，但容易结党营私。清正为官之道困难。',
    talent_cost: 5,
    rarity: 4,
    effects: [
      { 类型: '县令六司', 目标: '威望', 数值: -2 },
      { 类型: '特殊能力', 名称: '权谋加速', 数值: 0.4 },
      { 类型: '特殊能力', 名称: '结党营私', 数值: 0.15 }
    ]
  },
  {
    id: 27,
    name: '能工巧匠',
    description: '对建设有非凡的天赋，工程品质更高，成功率更高。',
    talent_cost: 9,
    rarity: 4,
    effects: [
      { 类型: '县令六司', 目标: '文化', 数值: 2 },
      { 类型: '技能加成', 技能: '建设', 数值: 0.25 },
      { 类型: '特殊能力', 名称: '精品概率', 数值: 0.1 }
    ]
  },
  {
    id: 28,
    name: '孤僻性格',
    description: '性情孤僻，不善交际。人缘极差，但在逆境中更容易爆发。',
    talent_cost: -3,
    rarity: 3,
    effects: [
      { 类型: '县令六司', 目标: '文化', 数值: -5 },
      { 类型: '特殊能力', 名称: '逆境爆发', 数值: 0.3 }
    ]
  },
  {
    id: 29,
    name: '高瞻远瞩',
    description: '能从蛛丝马迹中推断未来走向，提前规避危险或把握机遇。',
    talent_cost: 8,
    rarity: 5,
    effects: [
      { 类型: '县令六司', 目标: '文化', 数值: 2 },
      { 类型: '县令六司', 目标: '民生', 数值: 3 },
      { 类型: '特殊能力', 名称: '风险洞察', 数值: 1 }
    ]
  },
  {
    id: 30,
    name: '精力充沛',
    description: '天生体格健壮，精力旺盛，能比常人处理更多政务。',
    talent_cost: 12,
    rarity: 5,
    effects: [
      { 类型: '县令六司', 目标: '军事', 数值: 3 },
      { 类型: '特殊能力', 名称: '精力恢复', 数值: 0.3 }
    ]
  }
];
