// 县令 - AI驱动的古代县令模拟器
import type { Region, Background, Aptitude, PostHeaven, Ability } from '@/types';

// =======================================================================
//                           本地地界数据
// =======================================================================
export const LOCAL_REGIONS: Omit<Region, 'source'>[] = [
  {
    id: 1,
    name: '江南水乡',
    era: '大宋年间',
    description: '此方地界名为"江南水乡"，乃是一处水网密布、物产丰饶的富庶之地。其核心法则是"以民为本，为官一任，造福一方"，无论是县令、知州，还是道台、巡抚，皆需以民生为重，为民请命。\n官民之别在此界泾渭分明，宛若天渊。平民百姓日出而作，日落而息，受赋税徭役之苦，终日为生计奔波；而官员一旦踏入仕途，便能享受俸禄，掌管一方百姓，动辄影响千人万户的生计。在百姓眼中，官员是高高在上的"父母官"，一言可定一家兴衰，一念可改全村命运。然而，这种权力并非毫无代价。\n此界奉行"有官必有责"的铁则，朝廷予官员权力，却也降下无尽责任。治安良好、赋税充足、百姓安居，皆是官员之功。但若遇天灾人祸、盗匪横行、民不聊生，便是官员失职，轻则降职罚俸，重则革职查办。官员之间，为求升迁，争斗乃是常态。同僚可能倾轧，上司可能贪腐，送礼行贿、结党营私之事屡见不鲜。这是一个充满机遇与危险的官场世界，你可以选择成为清正廉明的能臣，亦可成为贪赃枉法的污吏，只要你有足够的能力和手腕。但权力的背后，是无处不在的责任，一步踏错，便是万劫不复，身败名裂。\n然朝廷亦有制衡，官员若鱼肉百姓、贪赃枉法，便会与治下百姓结下冤仇。虽无业报加身，却会在日后升迁考核、政绩考评之时，引来更严厉的审查，平添无数变数。故而多数官员选择在任内勤政爱民，或于官场周旋，以求步步高升，位极人臣。政务行政——断案、收税、兴修水利、教化百姓，在此界发展到了极致，共同构筑了一个无比兴盛、却也无比残酷的官场文明。',
  },
  {
    id: 2,
    name: '边陲小镇',
    era: '大宋年间',
    description: '这是一处位于边境的小镇，常年面临外族侵扰，商旅往来频繁。在这里做官，不仅要处理日常政务，还要应对边境突发事件，维护治安稳定。\n在这个特殊的地方，你是朝廷派任的镇守官员。当其他地方的县令还在享受太平盛世时，你必须面对来自外部的威胁——游牧民族的侵扰、走私商队的活动、边境难民的处理。既要维护朝廷利益，又要照顾边境百姓生计。朝廷设立了"边防司"，各国争相加强对边境的控制，而你是这偏远之地的最高长官。这里是官场与边疆的交汇点，传统的为官之道与非常手段在此碰撞。你将在边境风沙中独自治理，探索"守土有责"的奥秘，在夹缝中求生存。',
  },
  {
    id: 3,
    name: '山区穷县',
    era: '大宋年间',
    description: '这是一处地处深山、物产匮乏的贫困县。百姓生活艰辛，赋税难征，盗匪横行。你是朝廷派来治理此地的官员，要在有限的资源下改善民生，维护治安。\n在这个贫困的地方，唯有勤政爱民。你可以选择修桥铺路、兴修水利来改善民生，也可以剿灭盗匪、整顿治安来稳定社会。但每一步都需要银两，而国库空虚，百姓贫困，你必须在夹缝中寻找出路。有人选择向富商借贷，有人选择加征赋税，有人选择开源节流。这是一个考验官员智慧与手腕的时代，你将在穷山恶水之间探索为官之道。',
  },
  {
    id: 4,
    name: '水乡泽国',
    era: '大宋年间',
    description: '这是一处水网密布的泽国，水患频发，百姓靠水为生。作为这里的县令，你需要治理水患，发展渔业，管理水上交通，确保一方安宁。\n在这里，水利是头等大事。修筑堤坝、疏通河道、建设码头，每一项都需要精心规划。同时，水上的盗匪也是心腹之患，你需要组建水师，巡逻河道。这是一个充满挑战的地方，传统的为官之道需要因地制宜。',
  },
  {
    id: 5,
    name: '商贸重镇',
    era: '大宋年间',
    description: '这是一处商贾云集、贸易繁荣的重镇。作为这里的县令，你需要管理商业秩序，征收商税，处理商业纠纷，促进经济发展。\n在这个商贸之地，商人的影响力巨大。你既要维护朝廷利益，确保税收充足，又要照顾商人权益，促进商业繁荣。商会势力强大，富商巨贾往往能够左右地方政务。这是一个需要平衡各方利益的地方，传统的为官之道需要更加灵活。',
  },
  {
    id: 6,
    name: '灾荒之地',
    era: '大宋年间',
    description: '这是一处连年灾荒、民不聊生的苦难之地。作为这里的县令，你需要开仓放粮，组织赈灾，安置流民，恢复生产。\n在这个灾难频发的地方，每一日都有人饿死。朝廷的赈灾粮迟迟不到，富商囤积居奇，百姓流离失所。你必须在有限的资源下做出艰难选择：是开仓放粮救济百姓，还是保留粮食以待来年？是强行征收富商余粮，还是向朝廷请求援助？这是一个考验官员仁心与决断的时代。',
  },
  {
    id: 7,
    name: '文风鼎盛',
    era: '大宋年间',
    description: '这是一处文化昌盛、文人辈出的地方。作为这里的县令，你需要兴办学堂，提倡教育，选拔人才，推动文化发展。\n在这个文风鼎盛的地方，文人影响力巨大。你既要尊重当地士绅，又要为寒门学子提供机会。科举考试是头等大事，考中功名者光宗耀祖。这是一个需要重视教育与文化的地方，传统的为官之道需要更加注重教化。',
  },
  {
    id: 8,
    name: '江湖水寨',
    era: '大宋年间',
    description: '这是一处水匪横行、江湖势力盘根错节的险恶之地。作为这里的县令，你需要剿灭水匪，整顿治安，同时还要应对江湖势力的渗透。\n在这个江湖之地，法律往往难以约束。水匪劫掠商船，江湖势力收保护费，百姓敢怒不敢言。你既要武力剿匪，又要招安安抚，恩威并施。这是一个充满危险的地方，传统的为官之道需要更加铁血。',
  },
  {
    id: 9,
    name: '京城郊县',
    era: '大宋年间',
    description: '这是一处位于京城郊外的县，天高皇帝近，既是机遇也是挑战。作为这里的县令，你既要应对朝廷的频繁检查，又要服务京城贵族，还要照顾本地百姓。\n在这个天子脚下，一举一动都备受关注。朝廷高官、皇亲国戚经常往来，稍有差池便是大祸临头。但同时也意味着更多升迁机会，若能政绩显著，得到上司赏识，便是平步青云。这是一个机遇与挑战并存的地方。',
  },
  {
    id: 10,
    name: '古县遗风',
    era: '大宋年间',
    description: '这是一处历史悠久的古县，保留着古老的官场传统和民间习俗。作为这里的县令，你需要尊重传统，处理旧有矛盾，同时推行新政。\n在这个古老的地方，传统与现代碰撞。老一辈士绅固守传统，新一代官员推行新政。你需要在两者之间寻找平衡，既要尊重传统，又要推动改革。这是一个需要智慧与耐心的地方。',
  },
];

// =======================================================================
//                           本地出身数据 (原天资等级)
// =======================================================================
export const LOCAL_BACKGROUNDS: Omit<Background, 'source'>[] = [
  { id: 1, name: '寒门', description: '出身寒微，毫无背景，仕途艰难。虽有报国之志，奈何门第所限，每一步都需付出常人百倍的努力。', total_points: 10, rarity: 1, color: '#718096' },
  { id: 2, name: '平民', description: '普通百姓出身，不好不坏，有缘可入仕途。若有大机缘，亦可成就一番事业。', total_points: 20, rarity: 2, color: '#E2E8F0' },
  { id: 3, name: '小吏', description: '百里挑一的人才，略有不凡，在衙门中可为得力干吏。能力尚可，勤勉工作有望得到提拔。', total_points: 35, rarity: 3, color: '#63B3ED' },
  { id: 4, name: '士绅', description: '地方名流，注定耀眼，是官场未来的希望。门第不错，升迁速度远超常人，往往能越级晋升。', total_points: 50, rarity: 4, color: '#9F7AEA' },
  { id: 5, name: '权贵', description: '显赫世家，权势滔天，可与当朝权贵比肩。打破常理的存在，朝廷似乎都对其格外优待。', total_points: 70, rarity: 5, color: '#F6E05E' },
  { id: 6, name: '皇族', description: '皇室宗亲，天生尊贵，记忆蒙尘但灵性不昧，升迁一日千里。自带威严，官场法则难以束缚。', total_points: 85, rarity: 6, color: '#F56565' },
  { id: 7, name: '天命之子', description: '天命所归，天生与官场相合，万法皆通，是此时代的应运之人。言出法随，气运逆天，整个官场都在为其让路。', total_points: 100, rarity: 7, color: '#ED8936' },
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
  { id: 6, name: '卧底探子', description: '你出身名门正派，却被派往敌对势力执行卧底任务，心性远超常人。', talent_cost: 1, attribute_modifiers: { 威望: 3 }, rarity: 4 },
  { id: 7, name: '前朝遗臣', description: '你保留着前朝的记忆，虽然官位尽失，但对官场和未来的大事了如指掌。', talent_cost: 5, attribute_modifiers: { 经济: 2, 文化: 1 }, rarity: 5 },
  { id: 8, name: '世家子弟', description: '你的家族中流淌着稀薄的高官血脉，天生威严十足，升迁速度略快于常人。', talent_cost: 6, attribute_modifiers: { 威望: 2, 政务: 1 }, rarity: 5 },
  { id: 9, name: '革职复起', description: '你是一名被革职后重新起用的老臣，虽然占据了新的职位，但灵魂中蕴含着庞大的经验。', talent_cost: 7, attribute_modifiers: { 经济: 3, 威望: -1 }, rarity: 5 },
  { id: 10, name: '庙祝之子', description: '你从小在庙里长大，日夜与香火为伴，神魂受到滋养，对鬼神之事有特殊感应。', talent_cost: 2, attribute_modifiers: { 文化: 2 }, rarity: 3 },
  { id: 11, name: '渔民之后', description: '祖上世代捕鱼为生，水性极佳，体魄强健。', talent_cost: 1, attribute_modifiers: { 政务: 2 }, rarity: 2 },
  { id: 12, name: '皇室宗亲', description: '生于皇家的权力之巅，自幼享受锦衣玉食和最好的教育，但与基层官场的接触较少。', talent_cost: 3, attribute_modifiers: { 民生: 2, 威望: 1 }, rarity: 4 },
  { id: 13, name: '药铺伙计', description: '自幼在药铺长大，日夜与药材为伴，对医理有超常的敏感。', talent_cost: 2, attribute_modifiers: { 民生: 1, 经济: 1 }, rarity: 3 },
  { id: 14, name: '账房学徒', description: '师从账房先生，自小研习账目，对数字极其敏锐。', talent_cost: 3, attribute_modifiers: { 经济: 2, 民生: 1 }, rarity: 4 },
  { id: 15, name: '捕快世家', description: '祖上世代捕快，血脉中蕴含微弱的武学之力，对罪犯极其敏感。', talent_cost: 4, attribute_modifiers: { 军事: 2, 威望: 1 }, rarity: 4 },
  { id: 16, name: '乞丐出身', description: '自幼流落街头，饱经风霜，磨练出超凡的意志和适应能力。', talent_cost: -1, attribute_modifiers: { 威望: 2, 民生: -1 }, rarity: 2 },
  { id: 17, name: '矿工余生', description: '曾是矿工，在暗无天日的矿洞中挣扎求生，体魄强健但缺乏灵性。', talent_cost: 0, attribute_modifiers: { 政务: 3, 文化: -1 }, rarity: 2 },
  { id: 18, name: '画师弟子', description: '师承名家，精通书画之道，对文书有天生的理解力。', talent_cost: 3, attribute_modifiers: { 文化: 1, 民生: 2 }, rarity: 3 },
  { id: 19, name: '守墓人', description: '世代守护祖坟，长期与死者打交道，对鬼道有独特感悟。', talent_cost: 2, attribute_modifiers: { 威望: 2, 文化: 1 }, rarity: 4 },
  { id: 20, name: '戏班出身', description: '自幼学戏，擅长察言观色，魅力非凡，但为官之心不够坚定。', talent_cost: 1, attribute_modifiers: { 民生: 3, 威望: -1 }, rarity: 2 },
  { id: 21, name: '风水世家', description: '家族世代看风水，你自小研习相地之术，对地利有独特理解。', talent_cost: 5, attribute_modifiers: { 经济: 2, 文化: 2 }, rarity: 5 },
  { id: 22, name: '部落首领', description: '出身蛮荒部落，继承了首领的血脉，对统治有天生的亲和。', talent_cost: 4, attribute_modifiers: { 威望: 2, 政务: 1 }, rarity: 4 },
  { id: 23, name: '海岛遗民', description: '生于与世隔绝的海岛，保留着上古时代的原始统治法门。', talent_cost: 3, attribute_modifiers: { 威望: 2, 经济: 1 }, rarity: 4 },
  { id: 24, name: '亡国之臣', description: '国破家亡，历经苦难，心性坚韧如铁，但背负着沉重的仇恨。', talent_cost: 2, attribute_modifiers: { 威望: 3, 民生: -1 }, rarity: 3 }
];

// =======================================================================
//                           本地后天数据 (原才能/天赋数据)
// =======================================================================
export const LOCAL_POST_HEAVENS: Omit<PostHeaven, 'source'>[] = [
  // 上品后天 - 基础六项
  {
    id: 1,
    name: '断案之才',
    tier: '上品',
    description: '天生明察秋毫，断案如神，是审案判案的天赋。处理刑名案件事半功倍，是天生的神探胚子。',
    cultivation_speed: '1.6x',
    special_effects: ['断案能力+50%', '案件侦破+30%', '识破谎言'],
    base_multiplier: 1.6,
    talent_cost: 10,
    rarity: 3
  },
  {
    id: 2,
    name: '治理之才',
    tier: '上品',
    description: '天生善于治理，亲和民生，处理政务如鱼得水。擅长治理一方，处理行政事务极快。',
    cultivation_speed: '1.6x',
    special_effects: ['治理能力+50%', '民心提升+40%', '民生感知'],
    base_multiplier: 1.6,
    talent_cost: 10,
    rarity: 3
  },
  {
    id: 3,
    name: '理财之才',
    tier: '上品',
    description: '天生善于理财，精通赋税，财政管理绵延不绝。处理财政事务，收入源源不断。',
    cultivation_speed: '1.6x',
    special_effects: ['理财能力+50%', '税收增加+40%', '商业感知'],
    base_multiplier: 1.6,
    talent_cost: 10,
    rarity: 3
  },
  {
    id: 4,
    name: '用人之才',
    tier: '上品',
    description: '天生善于识人用人，管理下属，驾驭群臣。处理人事事务，威力绝伦，爆发力强。',
    cultivation_speed: '1.6x',
    special_effects: ['用人能力+50%', '下属忠诚+60%', '识人辨才'],
    base_multiplier: 1.6,
    talent_cost: 10,
    rarity: 3
  },
  {
    id: 5,
    name: '行政之才',
    tier: '上品',
    description: '天生善于行政，精通公文，处理文书稳如泰山。是天生的行政官员，处理繁杂政务得心应手。',
    cultivation_speed: '1.6x',
    special_effects: ['行政能力+50%', '文书处理+40%', '组织协调'],
    base_multiplier: 1.6,
    talent_cost: 10,
    rarity: 3
  },

  // 中品后天 - 常见选择
  {
    id: 9,
    name: '断案之才',
    tier: '中品',
    description: '断案资质尚可，处理刑名案件有一定天赋，虽不及上品，但也远超常人。',
    cultivation_speed: '1.3x',
    special_effects: ['断案能力+25%', '案件侦破+15%'],
    base_multiplier: 1.3,
    talent_cost: 6,
    rarity: 2
  },
  {
    id: 10,
    name: '理财之才',
    tier: '中品',
    description: '理财资质良好，对财政事务有不错的亲和力，能够顺利地处理政务。',
    cultivation_speed: '1.3x',
    special_effects: ['理财能力+25%', '税收增加+30%'],
    base_multiplier: 1.3,
    talent_cost: 6,
    rarity: 2
  },

  // 极品后天 - 稀有特质
  {
    id: 11,
    name: '神探天赋',
    tier: '极品',
    description: '万中无一的断案奇才，天生神探，明察秋毫。处理刑名案件速度极快，破案率极高，是百姓的青天大老爷。',
    cultivation_speed: '2.0x',
    special_effects: ['断案能力+80%', '识破谎言', '威望+50%', '破案加速'],
    base_multiplier: 2.0,
    talent_cost: 15,
    rarity: 4
  },
  {
    id: 12,
    name: '刑名专家',
    tier: '极品',
    description: '极为罕见的刑法专家，精通律法，明察秋毫。处理刑名案件，控制力超凡，能令罪犯无所遁形。',
    cultivation_speed: '2.0x',
    special_effects: ['刑名能力+80%', '审判效果+100%', '律法精通', '威慑罪犯'],
    base_multiplier: 2.0,
    talent_cost: 15,
    rarity: 4
  },

  // 神品后天 - 传说级别
  {
    id: 6,
    name: '全能之才',
    tier: '神品',
    description: '传说中的至高全才，文武双全，包容万象。可处理所有政务，无瓶颈，但初期进展缓慢，后期一日千里。',
    cultivation_speed: '0.8x(前期) -> 2.8x(后期)',
    special_effects: ['全系政务亲和', '无领域限制', '越阶处理+50%', '升迁概率+30%'],
    base_multiplier: 2.8,
    talent_cost: 25,
    rarity: 5
  },

  // 特殊后天
  {
    id: 7,
    name: '清廉之体',
    tier: '特殊',
    description: '天生清廉，不爱钱财，升迁速度极为缓慢，常人难以忍受。但一旦突破，根基无比扎实，政绩远超同阶。',
    cultivation_speed: '0.5x',
    special_effects: ['根基极其稳固', '升迁后实力暴增+100%', '诱惑抗性+80%', '清名远播'],
    base_multiplier: 0.5,
    talent_cost: -5,
    rarity: 4
  },

  // 凡品和下品后天
  {
    id: 8,
    name: '平庸之辈',
    tier: '凡品',
    description: '最常见的平庸之辈，五项皆有，却驳杂不堪，处理政务慢如龟爬，仕途渺茫。',
    cultivation_speed: '1.0x',
    special_effects: ['平庸之道', '大器晚成'],
    base_multiplier: 1.0,
    talent_cost: 0,
    rarity: 1
  },
  {
    id: 13,
    name: '文书之才',
    tier: '下品',
    description: '较为常见的文书才能，虽然资质一般，但胜在细致认真，处理公文迅捷。',
    cultivation_speed: '1.1x',
    special_effects: ['文书处理+15%', '办事速度+20%'],
    base_multiplier: 1.1,
    talent_cost: 3,
    rarity: 1
  },
  {
    id: 14,
    name: '密探天赋',
    tier: '极品',
    description: '极为罕见的情报才能，善于收集情报，掌控暗流。处理情报事务速度极快，擅长探听和策反。',
    cultivation_speed: '2.0x',
    special_effects: ['情报能力+80%', '隐秘行动', '暗处增幅+50%', '渗透'],
    base_multiplier: 2.0,
    talent_cost: 15,
    rarity: 4
  },
  {
    id: 15,
    name: '教化之才',
    tier: '极品',
    description: '传说中的教化才能，天生亲和百姓，教化民众事半功倍，对恶习有天然克制。',
    cultivation_speed: '2.0x',
    special_effects: ['教化能力+80%', '恶习克制+100%', '民风改善', '德行庇护'],
    base_multiplier: 2.0,
    talent_cost: 15,
    rarity: 4
  },
  {
    id: 16,
    name: '权谋之才',
    tier: '特殊',
    description: '善于权谋，以权谋为引，处理政务迅速但需要大量资源支撑。容易结党营私，但政绩增长极快。',
    cultivation_speed: '1.8x',
    special_effects: ['权谋能力+70%', '势力扩张', '结党营私', '派系亲和'],
    base_multiplier: 1.8,
    talent_cost: 10,
    rarity: 4
  },
  {
    id: 17,
    name: '酷吏天赋',
    tier: '特殊',
    description: '善于严刑峻法，能够通过威慑维持治安，处理治安事务速度极快，但被百姓所畏惧。',
    cultivation_speed: '1.7x',
    special_effects: ['治安能力+60%', '威慑控制', '恐惧免疫', '严刑天赋'],
    base_multiplier: 1.7,
    talent_cost: 8,
    rarity: 4
  },
  {
    id: 18,
    name: '治理之才',
    tier: '中品',
    description: '治理资质尚可，对政务有不错的亲和力，能够顺利地处理地方事务。',
    cultivation_speed: '1.3x',
    special_effects: ['治理能力+25%', '民心提升+20%'],
    base_multiplier: 1.3,
    talent_cost: 6,
    rarity: 2
  },
  {
    id: 19,
    name: '理财之才',
    tier: '中品',
    description: '理财资质良好，财政管理能力不错，适应性强，处理政务较为顺畅。',
    cultivation_speed: '1.3x',
    special_effects: ['理财能力+25%', '税收增加+20%'],
    base_multiplier: 1.3,
    talent_cost: 6,
    rarity: 2
  },
  {
    id: 20,
    name: '行政之才',
    tier: '中品',
    description: '行政资质不错，组织力强，稳扎稳打，是行政官员的良好资质。',
    cultivation_speed: '1.3x',
    special_effects: ['行政能力+25%', '文书处理+20%'],
    base_multiplier: 1.3,
    talent_cost: 6,
    rarity: 2
  },
  {
    id: 21,
    name: '御吏之才',
    tier: '极品',
    description: '极为罕见的御吏才能，天生善于管理下属，统率部下，是治吏能臣梦寐以求的体质。',
    cultivation_speed: '2.0x',
    special_effects: ['御吏能力+80%', '下属敬畏', '威严倍增', '统率力强'],
    base_multiplier: 2.0,
    talent_cost: 15,
    rarity: 4
  },
  {
    id: 22,
    name: '双才并举',
    tier: '极品',
    description: '万中无一的双才能人才，同时拥有两种基础才能的力量。可处理两类政务，但初期进展缓慢。',
    cultivation_speed: '1.8x',
    special_effects: ['双类政务亲和', '融合处理+30%', '双修加成'],
    base_multiplier: 1.8,
    talent_cost: 14,
    rarity: 4
  },
  {
    id: 23,
    name: '权术之才',
    tier: '神品',
    description: '传说中的至高权术才能，掌控官场法则，可周旋各方。处理极难但潜力无穷。',
    cultivation_speed: '0.9x(前期) -> 3.0x(后期)',
    special_effects: ['权术精通', '周旋各方', '平衡之道', '制衡之术'],
    base_multiplier: 3.0,
    talent_cost: 25,
    rarity: 5
  },
  {
    id: 24,
    name: '天命之才',
    tier: '神品',
    description: '最为稀有的传说才能，触及国运机缘。升迁艰难但一旦有成，可逆转局势，掌控时势。',
    cultivation_speed: '0.8x(前期) -> 3.2x(后期)',
    special_effects: ['天命政事精通', '时来运转', '因果推演', '机会把握'],
    base_multiplier: 3.2,
    talent_cost: 28,
    rarity: 5
  },
  {
    id: 25,
    name: '民望之才',
    tier: '神品',
    description: '吸纳民望的稀世才能，与民意共鸣。处理缓慢但根基稳固，可借民望之力突破瓶颈。',
    cultivation_speed: '0.85x(前期) -> 2.9x(后期)',
    special_effects: ['民望之力', '声名演化', '民意庇护', '拥戴之术'],
    base_multiplier: 2.9,
    talent_cost: 26,
    rarity: 5
  },
  {
    id: 26,
    name: '阴阳之才',
    tier: '神品',
    description: '至高双生才能，阴阳调和，刚柔并济。可同时使用两种为官风格，融合后威力倍增。',
    cultivation_speed: '0.9x(前期) -> 3.1x(后期)',
    special_effects: ['刚柔并济', '恩威并施', '宽严得当', '阴阳逆转'],
    base_multiplier: 3.1,
    talent_cost: 27,
    rarity: 5
  },
];

// =======================================================================
//                           本地能力数据 (原天赋数据)
// =======================================================================
export const LOCAL_ABILITIES: Omit<Ability, 'source'>[] = [
  {
    id: 1,
    name: '天命县令',
    description: '气运惊人，总是能在绝境中逢生，获得意想不到的机遇。',
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
    description: '天生刚正，不畏权贵。断案威力倍增，领悟正气速度极快。',
    talent_cost: 10,
    rarity: 5,
    effects: [
      { 类型: '县令六司', 目标: '军事', 数值: 2 },
      { 类型: '技能加成', 技能: '断案', 数值: 0.25 },
      { 类型: '特殊能力', 名称: '正气感悟', 数值: 0.2 }
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
    name: '孤星命格',
    description: '天煞孤星，注定孤独一生。气运极低，但在绝境中更容易突破。',
    talent_cost: -3,
    rarity: 3,
    effects: [
      { 类型: '县令六司', 目标: '文化', 数值: -5 },
      { 类型: '特殊能力', 名称: '绝境突破', 数值: 0.3 }
    ]
  },
  {
    id: 29,
    name: '先知梦境',
    description: '偶尔能在梦中窥见未来的片段，提前规避危险或把握机遇。',
    talent_cost: 8,
    rarity: 5,
    effects: [
      { 类型: '县令六司', 目标: '文化', 数值: 2 },
      { 类型: '县令六司', 目标: '民生', 数值: 3 },
      { 类型: '特殊能力', 名称: '预知危险', 数值: 1 }
    ]
  },
  {
    id: 30,
    name: '长寿体格',
    description: '天生体格健壮，比常人更不易衰老，有更多时间追求政绩。',
    talent_cost: 12,
    rarity: 5,
    effects: [
      { 类型: '县令六司', 目标: '军事', 数值: 3 },
      { 类型: '特殊能力', 名称: '寿命延长', 数值: 0.3 }
    ]
  }
];
