"use client";

import { FormEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";

type Mode = "home" | "hanzi" | "review" | "pinyin" | "math" | "english" | "reading" | "rewards";
type HanziStage = "play" | "learn" | "practice" | "write" | "speak" | "done";
type Hanzi = { char: string; pinyin: string; word: string; sentence: string; icon: string };

const starterHanziLessons: Hanzi[][] = [
  [
    { char: "日", pinyin: "rì", word: "日出", sentence: "红日从东方升起。", icon: "☀️" },
    { char: "月", pinyin: "yuè", word: "月亮", sentence: "月亮弯弯像小船。", icon: "🌙" },
    { char: "山", pinyin: "shān", word: "高山", sentence: "远处有一座高山。", icon: "⛰️" },
    { char: "水", pinyin: "shuǐ", word: "河水", sentence: "清清的河水向前流。", icon: "💧" },
    { char: "火", pinyin: "huǒ", word: "火苗", sentence: "小火苗暖暖的。", icon: "🔥" },
  ],
  [
    { char: "人", pinyin: "rén", word: "大人", sentence: "大人和小孩一起笑。", icon: "🧑" },
    { char: "口", pinyin: "kǒu", word: "门口", sentence: "小狗坐在门口。", icon: "👄" },
    { char: "手", pinyin: "shǒu", word: "小手", sentence: "勤洗小手讲卫生。", icon: "🖐️" },
    { char: "目", pinyin: "mù", word: "目光", sentence: "他的目光看向远方。", icon: "👀" },
    { char: "足", pinyin: "zú", word: "足球", sentence: "我们一起踢足球。", icon: "⚽" },
  ],
  [
    { char: "天", pinyin: "tiān", word: "天空", sentence: "蓝蓝的天空真美。", icon: "🌤️" },
    { char: "地", pinyin: "dì", word: "大地", sentence: "春天的大地绿了。", icon: "🌱" },
    { char: "云", pinyin: "yún", word: "白云", sentence: "白云在天空飘。", icon: "☁️" },
    { char: "雨", pinyin: "yǔ", word: "下雨", sentence: "下雨了，带好雨伞。", icon: "🌧️" },
    { char: "风", pinyin: "fēng", word: "春风", sentence: "春风轻轻吹过来。", icon: "🍃" },
  ],
  [
    { char: "一", pinyin: "yī", word: "一个", sentence: "我有一个苹果。", icon: "1️⃣" },
    { char: "二", pinyin: "èr", word: "二月", sentence: "二月迎来新春天。", icon: "2️⃣" },
    { char: "三", pinyin: "sān", word: "三只", sentence: "三只小鸟在唱歌。", icon: "3️⃣" },
    { char: "四", pinyin: "sì", word: "四方", sentence: "我们来自四面八方。", icon: "4️⃣" },
    { char: "五", pinyin: "wǔ", word: "五月", sentence: "五月的花开了。", icon: "5️⃣" },
  ],
  [
    { char: "上", pinyin: "shàng", word: "上学", sentence: "我背着书包去上学。", icon: "⬆️" },
    { char: "下", pinyin: "xià", word: "下车", sentence: "到站以后再下车。", icon: "⬇️" },
    { char: "大", pinyin: "dà", word: "大象", sentence: "大象有长长的鼻子。", icon: "🐘" },
    { char: "小", pinyin: "xiǎo", word: "小鸟", sentence: "小鸟在枝头唱歌。", icon: "🐦" },
    { char: "中", pinyin: "zhōng", word: "中间", sentence: "小猫坐在中间。", icon: "🎯" },
  ],
  [
    { char: "花", pinyin: "huā", word: "花朵", sentence: "花朵向着太阳开。", icon: "🌸" },
    { char: "草", pinyin: "cǎo", word: "小草", sentence: "小草从土里钻出来。", icon: "🌿" },
    { char: "树", pinyin: "shù", word: "大树", sentence: "大树撑起绿绿的伞。", icon: "🌳" },
    { char: "鸟", pinyin: "niǎo", word: "小鸟", sentence: "小鸟飞回家了。", icon: "🐤" },
    { char: "鱼", pinyin: "yú", word: "小鱼", sentence: "小鱼在水里游。", icon: "🐟" },
  ],
];

const gradeOneExtra: Hanzi[] = [
  ["我", "wǒ", "我们", "我们一起快乐学习。", "🙋"], ["你", "nǐ", "你好", "你好，很高兴见到你。", "👋"],
  ["他", "tā", "他们", "他们在操场上跑步。", "👦"], ["她", "tā", "她们", "她们一起画画。", "👧"],
  ["们", "men", "我们", "我们都是好朋友。", "👫"], ["爸", "bà", "爸爸", "爸爸陪我读书。", "👨"],
  ["妈", "mā", "妈妈", "妈妈笑得很开心。", "👩"], ["父", "fù", "父母", "父母关心我的成长。", "👪"],
  ["母", "mǔ", "母亲", "母亲给我温暖的拥抱。", "🤱"], ["家", "jiā", "回家", "放学后我按时回家。", "🏠"],
  ["有", "yǒu", "没有", "树上有一只小鸟。", "✨"], ["爱", "ài", "爱心", "我爱美丽的家乡。", "❤️"],
  ["好", "hǎo", "好人", "我们要做诚实的好孩子。", "👍"], ["吃", "chī", "吃饭", "吃饭前要洗手。", "🍚"],
  ["喝", "hē", "喝水", "运动后要记得喝水。", "🥛"], ["米", "mǐ", "大米", "大米煮成香香的饭。", "🍚"],
  ["饭", "fàn", "米饭", "我不浪费一粒米饭。", "🥣"], ["果", "guǒ", "水果", "水果香甜又好吃。", "🍎"],
  ["牛", "niú", "小牛", "小牛在草地上散步。", "🐮"], ["羊", "yáng", "山羊", "山羊爱吃青草。", "🐑"],
  ["马", "mǎ", "白马", "白马在草原上奔跑。", "🐴"], ["猫", "māo", "小猫", "小猫轻轻地走路。", "🐱"],
  ["狗", "gǒu", "小狗", "小狗摇着尾巴欢迎我。", "🐶"], ["虫", "chóng", "小虫", "小虫藏在叶子下面。", "🐛"],
  ["田", "tián", "田野", "春天的田野绿油油。", "🌾"], ["土", "tǔ", "泥土", "种子从泥土里发芽。", "🟫"],
  ["石", "shí", "石头", "河边有圆圆的石头。", "🪨"], ["木", "mù", "木头", "木头可以做成桌椅。", "🪵"],
  ["禾", "hé", "禾苗", "田里的禾苗长高了。", "🌱"], ["竹", "zhú", "竹子", "熊猫喜欢吃竹子。", "🎋"],
  ["春", "chūn", "春天", "春天来了，花儿开了。", "🌸"], ["夏", "xià", "夏天", "夏天可以听见蝉鸣。", "🌞"],
  ["秋", "qiū", "秋天", "秋天的果园真热闹。", "🍂"], ["冬", "dōng", "冬天", "冬天的雪花洁白美丽。", "❄️"],
  ["东", "dōng", "东方", "太阳从东方升起。", "➡️"], ["西", "xī", "西方", "傍晚太阳落向西方。", "⬅️"],
  ["南", "nán", "南方", "燕子飞向温暖的南方。", "🧭"], ["北", "běi", "北方", "北方的冬天会下雪。", "🧭"],
  ["前", "qián", "前面", "老师站在教室前面。", "⏩"], ["后", "hòu", "后来", "放学后我们一起回家。", "⏪"],
  ["左", "zuǒ", "左手", "我用左手扶住本子。", "👈"], ["右", "yòu", "右边", "书包放在桌子右边。", "👉"],
  ["多", "duō", "多少", "篮子里有多少苹果？", "➕"], ["少", "shǎo", "少数", "杯子里的水变少了。", "➖"],
  ["长", "cháng", "长大", "小树慢慢长大。", "📏"], ["早", "zǎo", "早上", "早上起来读一首诗。", "🌅"],
  ["晚", "wǎn", "晚上", "晚上睡前整理书包。", "🌆"], ["年", "nián", "新年", "新年里大家互相祝福。", "🧨"],
  ["生", "shēng", "学生", "我是爱学习的小学生。", "🎒"], ["见", "jiàn", "看见", "我看见天边的彩虹。", "🌈"],
  ["听", "tīng", "听见", "我听见小鸟唱歌。", "👂"], ["说", "shuō", "说话", "上课发言要大声说话。", "💬"],
  ["读", "dú", "读书", "每天读书让我更聪明。", "📖"], ["写", "xiě", "写字", "我一笔一画认真写字。", "✍️"],
  ["画", "huà", "画画", "我画了一朵红花。", "🎨"], ["书", "shū", "书本", "书本是我们的好朋友。", "📚"],
  ["本", "běn", "本子", "我把名字写在本子上。", "📒"], ["笔", "bǐ", "铅笔", "铅笔可以用来写字。", "✏️"],
  ["纸", "zhǐ", "白纸", "我在白纸上画太阳。", "📄"], ["校", "xiào", "学校", "我们在学校学习知识。", "🏫"],
  ["老", "lǎo", "老师", "老师教我们读书写字。", "🧑‍🏫"], ["师", "shī", "老师", "我向老师问好。", "👩‍🏫"],
  ["同", "tóng", "同学", "我和同学一起做游戏。", "🤝"], ["学", "xué", "学习", "认真学习，每天进步。", "🎓"],
  ["朋", "péng", "朋友", "朋友之间互相帮助。", "🫶"], ["友", "yǒu", "友好", "大家友好地一起玩。", "😊"],
  ["来", "lái", "回来", "春天跟着燕子一起来。", "🛬"], ["去", "qù", "出去", "我们排好队出去活动。", "🛫"],
  ["走", "zǒu", "走路", "过马路要走斑马线。", "🚶"], ["跑", "pǎo", "跑步", "每天跑步让身体更健康。", "🏃"],
].map(([char, pinyin, word, sentence, icon]) => ({ char, pinyin, word, sentence, icon }));

const allGradeOneHanzi = [...starterHanziLessons.flat(), ...gradeOneExtra];
const hanziLessons: Hanzi[][] = Array.from(
  { length: Math.ceil(allGradeOneHanzi.length / 10) },
  (_, index) => allGradeOneHanzi.slice(index * 10, index * 10 + 10),
);

const pinyinQuestions = [
  { prompt: "月亮", icon: "🌙", choices: ["yuè liang", "yè liàng", "yù lián"], answer: "yuè liang" },
  { prompt: "苹果", icon: "🍎", choices: ["píng guǒ", "pín guō", "bīng guǒ"], answer: "píng guǒ" },
  { prompt: "蝴蝶", icon: "🦋", choices: ["hú dié", "fú tié", "hǔ diē"], answer: "hú dié" },
  { prompt: "火车", icon: "🚂", choices: ["huǒ chē", "hǔo cē", "fǒ chē"], answer: "huǒ chē" },
  { prompt: "白云", icon: "☁️", choices: ["bái yún", "pái yǔn", "bǎi yún"], answer: "bái yún" },
];

const englishWords = [
  { en: "apple", zh: "苹果", icon: "🍎" }, { en: "cat", zh: "小猫", icon: "🐱" },
  { en: "book", zh: "书", icon: "📕" }, { en: "fish", zh: "鱼", icon: "🐟" },
  { en: "sun", zh: "太阳", icon: "☀️" }, { en: "star", zh: "星星", icon: "⭐" },
  { en: "dog", zh: "小狗", icon: "🐶" }, { en: "bird", zh: "小鸟", icon: "🐦" },
  { en: "moon", zh: "月亮", icon: "🌙" }, { en: "flower", zh: "花", icon: "🌸" },
  { en: "milk", zh: "牛奶", icon: "🥛" }, { en: "ball", zh: "球", icon: "⚽" },
];

const poems = [
  { title: "咏鹅", author: "唐·骆宾王", lines: ["鹅，鹅，鹅，", "曲项向天歌。", "白毛浮绿水，", "红掌拨清波。"], icon: "🪿" },
  { title: "静夜思", author: "唐·李白", lines: ["床前明月光，", "疑是地上霜。", "举头望明月，", "低头思故乡。"], icon: "🌙" },
  { title: "春晓", author: "唐·孟浩然", lines: ["春眠不觉晓，", "处处闻啼鸟。", "夜来风雨声，", "花落知多少。"], icon: "🌸" },
  { title: "悯农（其二）", author: "唐·李绅", lines: ["锄禾日当午，", "汗滴禾下土。", "谁知盘中餐，", "粒粒皆辛苦。"], icon: "🌾" },
  { title: "画", author: "佚名", lines: ["远看山有色，", "近听水无声。", "春去花还在，", "人来鸟不惊。"], icon: "🖼️" },
  { title: "江南", author: "汉乐府", lines: ["江南可采莲，", "莲叶何田田。", "鱼戏莲叶间。", "鱼戏莲叶东，鱼戏莲叶西。"], icon: "🪷" },
  { title: "古朗月行（节选）", author: "唐·李白", lines: ["小时不识月，", "呼作白玉盘。", "又疑瑶台镜，", "飞在青云端。"], icon: "🌕" },
  { title: "风", author: "唐·李峤", lines: ["解落三秋叶，", "能开二月花。", "过江千尺浪，", "入竹万竿斜。"], icon: "🍃" },
];

const idioms = [
  { title: "一心一意", meaning: "专心做一件事，不分心。", example: "小芽一心一意地练习写字。", icon: "🎯" },
  { title: "井井有条", meaning: "形容整齐、有次序。", example: "她把书桌收拾得井井有条。", icon: "🧺" },
  { title: "助人为乐", meaning: "把帮助别人当作快乐的事。", example: "同学摔倒了，我扶他起来。", icon: "🤝" },
  { title: "天天向上", meaning: "每天努力，不断取得进步。", example: "认真学习，天天向上。", icon: "🚀" },
  { title: "五颜六色", meaning: "形容颜色很多，非常好看。", example: "花园里开满五颜六色的花。", icon: "🌈" },
  { title: "欢声笑语", meaning: "欢乐地说笑，气氛很开心。", example: "操场上充满了欢声笑语。", icon: "😄" },
  { title: "春暖花开", meaning: "春天气候温暖，百花开放。", example: "春暖花开时，我们去郊游。", icon: "🌼" },
  { title: "山清水秀", meaning: "山水清丽，风景优美。", example: "我的家乡山清水秀。", icon: "🏞️" },
];

const rewards = [{ name: "美味小零食", stars: 10, icon: "🍪" }, { name: "心愿小玩具", stars: 20, icon: "🧸" }, { name: "儿童乐园", stars: 30, icon: "🎡" }];
const storeKey = "xiaoya-free-learning-v2";

function localDateKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function shuffle<T>(items: T[]) { return [...items].sort(() => Math.random() - 0.5); }
function speak(text: string, lang = "zh-CN") {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang; utterance.rate = lang === "en-US" ? 0.72 : 0.8;
  window.speechSynthesis.speak(utterance);
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("home");
  const [stars, setStars] = useState(0);
  const [learned, setLearned] = useState<string[]>([]);
  const [lesson, setLesson] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [hanziStage, setHanziStage] = useState<HanziStage>("play");
  const [sayCountdown, setSayCountdown] = useState(0);
  const [sayPracticed, setSayPracticed] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [pinyinIndex, setPinyinIndex] = useState(0);
  const [mathIndex, setMathIndex] = useState(0);
  const [englishTarget, setEnglishTarget] = useState(englishWords[0]);
  const [englishCards, setEnglishCards] = useState(englishWords.slice(0, 6));
  const [feedback, setFeedback] = useState("");
  const [customTasks, setCustomTasks] = useState<string[]>([]);
  const [taskText, setTaskText] = useState("");
  const [doneTasks, setDoneTasks] = useState<string[]>([]);
  const [attendanceDate, setAttendanceDate] = useState("");
  const [installed, setInstalled] = useState(false);
  const [ready, setReady] = useState(false);

  const currentChar = hanziLessons[lesson][charIndex];
  const currentGlobalIndex = lesson * 10 + charIndex;
  const stageDistractors = allGradeOneHanzi.filter((item) => item.char !== currentChar.char);
  const playChoices = [
    currentChar.char,
    stageDistractors[(currentGlobalIndex * 3 + 11) % stageDistractors.length].char,
    stageDistractors[(currentGlobalIndex * 7 + 23) % stageDistractors.length].char,
  ];
  playChoices.unshift(...playChoices.splice(currentGlobalIndex % playChoices.length));
  const practiceChoices = [
    currentChar.word,
    stageDistractors[(currentGlobalIndex * 5 + 17) % stageDistractors.length].word,
    stageDistractors[(currentGlobalIndex * 9 + 31) % stageDistractors.length].word,
  ];
  practiceChoices.unshift(...practiceChoices.splice((currentGlobalIndex + 1) % practiceChoices.length));
  const reviewPool = learned.length
    ? allGradeOneHanzi.filter((item) => learned.includes(item.char))
    : allGradeOneHanzi.slice(0, 10);
  const reviewChar = reviewPool[reviewIndex % reviewPool.length];
  const reviewDistractors = allGradeOneHanzi.filter((item) => item.char !== reviewChar.char);
  const reviewChoices = [
    reviewChar.char,
    reviewDistractors[(reviewIndex * 3 + 7) % reviewDistractors.length].char,
    reviewDistractors[(reviewIndex * 5 + 19) % reviewDistractors.length].char,
  ];
  reviewChoices.unshift(...reviewChoices.splice(reviewIndex % reviewChoices.length));
  const mathQuestions = useMemo(() => [
    { text: "3 + 4", choices: [6, 7, 8], answer: 7, icon: "🍎" },
    { text: "9 - 5", choices: [3, 4, 5], answer: 4, icon: "🐟" },
    { text: "6 + 8", choices: [12, 13, 14], answer: 14, icon: "⭐" },
    { text: "15 - 7", choices: [7, 8, 9], answer: 8, icon: "🎈" },
    { text: "10 + 9", choices: [18, 19, 20], answer: 19, icon: "🌼" },
  ], []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey) || "{}");
      // This one-time hydration restores the child's local-only profile.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStars(saved.stars || 0); setLearned(saved.learned || []);
      setCustomTasks(saved.customTasks || []); setDoneTasks(saved.doneTasks || []);
      setAttendanceDate(saved.attendanceDate || "");
    } catch { /* Begin with a fresh local profile. */ }
    const initialCards = shuffle(englishWords).slice(0, 6);
    setEnglishCards(initialCards);
    setEnglishTarget(initialCards[0]);
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(storeKey, JSON.stringify({ stars, learned, customTasks, doneTasks, attendanceDate }));
  }, [stars, learned, customTasks, doneTasks, attendanceDate, ready]);

  useEffect(() => {
    if (sayCountdown <= 0) return;
    const timer = window.setTimeout(() => {
      if (sayCountdown === 1) {
        setSayCountdown(0);
        setSayPracticed(true);
        setFeedback("跟读完成，声音真响亮！🌟");
        window.setTimeout(() => setFeedback(""), 900);
      } else setSayCountdown((value) => value - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [sayCountdown]);

  function go(next: Mode) { setFeedback(""); setMode(next); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function reward(message: string, amount = 1) { setStars((value) => value + amount); setFeedback(`${message}  +${amount} ⭐`); }
  function answerPlay(choice: string) {
    if (feedback || hanziStage !== "play") return;
    if (choice === currentChar.char) {
      setFeedback("找对啦！来认识它 👀");
      setHanziStage("learn");
    } else setFeedback("再找找，看看图和词语");
    window.setTimeout(() => setFeedback(""), 850);
  }
  function finishLearning() {
    if (hanziStage !== "learn") return;
    setHanziStage("practice");
    setFeedback("认识了！下面来练一练 🎯");
    window.setTimeout(() => setFeedback(""), 850);
  }
  function answerPractice(choice: string) {
    if (feedback || hanziStage !== "practice") return;
    if (choice === currentChar.word) {
      setFeedback("选对词语啦！现在写一写 ✍️");
      setHanziStage("write");
    } else setFeedback(`再想想，“${currentChar.char}”能组成哪个词？`);
    window.setTimeout(() => setFeedback(""), 950);
  }
  function finishWriting() {
    if (hanziStage !== "write") return;
    setSayPracticed(false);
    setSayCountdown(0);
    setHanziStage("speak");
    setFeedback("写好啦！最后大声说一句 🗣️");
    window.setTimeout(() => setFeedback(""), 900);
  }
  function completeCharacter() {
    if (hanziStage !== "speak") return;
    setHanziStage("done");
    const firstTime = !learned.includes(currentChar.char);
    if (firstTime) {
      setLearned((items) => [...items, currentChar.char]);
      reward("认读和书写都完成啦！");
    } else setFeedback("又认真练习了一遍 ✓");
    const isLastCharacter = charIndex === hanziLessons[lesson].length - 1;
    const nextLesson = isLastCharacter ? (lesson + 1) % hanziLessons.length : lesson;
    window.setTimeout(() => {
      setFeedback("");
      setLesson(nextLesson);
      setCharIndex(isLastCharacter ? 0 : charIndex + 1);
      setHanziStage("play");
      setSayPracticed(false);
    }, 1050);
  }
  function startSayChallenge() {
    if (sayCountdown > 0 || sayPracticed) return;
    setFeedback("准备好，大声跟读吧！");
    setSayCountdown(3);
  }
  function answerPinyin(choice: string) {
    if (feedback) return;
    const right = choice === pinyinQuestions[pinyinIndex].answer;
    if (right) {
      reward("拼对啦！");
      window.setTimeout(() => { setFeedback(""); setPinyinIndex((i) => (i + 1) % pinyinQuestions.length); }, 1000);
    } else {
      setFeedback(`再读一遍：${pinyinQuestions[pinyinIndex].answer}`);
      window.setTimeout(() => setFeedback(""), 1100);
    }
  }
  function answerMath(choice: number) {
    if (feedback) return;
    if (choice === mathQuestions[mathIndex].answer) {
      reward("算对啦！");
      window.setTimeout(() => { setFeedback(""); setMathIndex((i) => (i + 1) % mathQuestions.length); }, 900);
    } else {
      setFeedback("再数一数，你可以的");
      window.setTimeout(() => setFeedback(""), 950);
    }
  }
  function answerReview(choice: string) {
    if (feedback) return;
    if (choice === reviewChar.char) {
      reward("复习答对啦！");
      window.setTimeout(() => {
        setFeedback("");
        setReviewIndex((index) => (index + 1) % reviewPool.length);
      }, 950);
    } else {
      setFeedback(`再想一想，正确答案是“${reviewChar.char}”`);
      window.setTimeout(() => setFeedback(""), 1100);
    }
  }
  function catchWord(word: typeof englishWords[number]) {
    if (feedback) return;
    if (word.en === englishTarget.en) {
      reward("抓到大鹅啦！");
      window.setTimeout(() => {
        const next = englishWords[Math.floor(Math.random() * englishWords.length)];
        setEnglishTarget(next); setEnglishCards(shuffle([next, ...shuffle(englishWords.filter((item) => item.en !== next.en)).slice(0, 5)])); setFeedback("");
      }, 900);
    } else { setFeedback("不是这只，再找找 👀"); window.setTimeout(() => setFeedback(""), 700); }
  }
  function addTask(event: FormEvent) {
    event.preventDefault();
    const value = taskText.trim();
    if (!value) return;
    if (customTasks.includes(value)) {
      setFeedback("这个任务已经添加过啦");
      window.setTimeout(() => setFeedback(""), 1000);
      return;
    }
    setCustomTasks((items) => [...items, value]);
    setTaskText("");
  }
  function toggleTask(task: string) {
    const wasDone = doneTasks.includes(task);
    const next = wasDone ? doneTasks.filter((item) => item !== task) : [...doneTasks, task];
    setDoneTasks(next);
    const allDone = customTasks.length > 0 && customTasks.every((item) => next.includes(item));
    const today = localDateKey();
    if (!wasDone && allDone && attendanceDate !== today) {
      setAttendanceDate(today);
      reward("今日任务全勤！");
      window.setTimeout(() => setFeedback(""), 1300);
    }
  }

  return <main className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => go("home")}><span className="brand-mark">芽</span><span><b>小芽学习屋</b><small>永久免费 · 快乐成长</small></span></button>
      <nav aria-label="主要导航">
        <button className={mode === "home" ? "active" : ""} onClick={() => go("home")}>学习岛</button>
        <button className={mode === "reading" ? "active" : ""} onClick={() => go("reading")}>阅读馆</button>
        <button className={mode === "rewards" ? "active" : ""} onClick={() => go("rewards")}>家长中心</button>
      </nav>
      <button className="stars" onClick={() => go("rewards")}><span>⭐</span><b>{stars}</b></button>
    </header>

    {mode === "home" && <HomeScreen stars={stars} learned={learned.length} installed={installed} go={go} customTasks={customTasks} doneTasks={doneTasks} taskText={taskText} setTaskText={setTaskText} addTask={addTask} toggleTask={toggleTask} attendanceComplete={attendanceDate === localDateKey()} removeTask={(task) => { setCustomTasks((items) => items.filter((x) => x !== task)); setDoneTasks((items) => items.filter((x) => x !== task)); }} />}

    {mode !== "home" && <section className="lesson-shell">
      <button className="back" onClick={() => go("home")}>← 返回学习岛</button>
      {mode === "hanzi" && <>
        <div className="lesson-top"><div><span className="kicker">一年级识字 · 第 {lesson + 1} 课 · 第 {charIndex + 1}/10 字</span><h1>玩、认、练、写、说，闯过五关</h1></div><div className="step-dots" aria-label={`本课进度 ${charIndex + 1}/10`}>{hanziLessons[lesson].map((_, i) => <span className={i <= charIndex ? "on" : ""} key={i} />)}</div></div>
        <div className="learning-steps" aria-label="识字步骤">{([['play','🎮 玩'],['learn','👀 认'],['practice','🎯 练'],['write','✍️ 写'],['speak','🗣️ 说']] as [HanziStage,string][]).map(([key, label], index) => { const order = ["play", "learn", "practice", "write", "speak", "done"]; const currentOrder = order.indexOf(hanziStage); return <span key={key} className={hanziStage === key ? "active" : currentOrder > index ? "complete" : ""}>{currentOrder > index ? "✓" : index + 1} {label}</span>; })}</div>
        <div className="hanzi-stage-wrap">
          {hanziStage === "play" && <article className="stage-card game-stage"><MascotGuide name="小芽兔" text={`${currentChar.word}里藏着“${currentChar.char}”，快帮我找到它！`} /><div className="story-scene"><span className="scene-spark">✨</span><span className="stage-emoji">{currentChar.icon}</span><span className="scene-spark">✨</span></div><span className="kicker">第一关 · 玩一玩</span><h2>找到“{currentChar.word}”里的字</h2><div className="character-choices">{playChoices.map((choice, index) => <button className={`float-${index + 1}`} key={choice} disabled={Boolean(feedback)} onClick={() => answerPlay(choice)}><small>⭐</small>{choice}</button>)}</div><p>看一看图片和词语，点出正确的汉字</p></article>}
          {hanziStage === "learn" && <article className="learn-card stage-card"><MascotGuide name="虎教练" text="点一下喇叭，和我读两遍！" /><span className="scene-icon">{currentChar.icon}</span><button className="sound pulse-button" onClick={() => speak(`${currentChar.char}，${currentChar.word}。${currentChar.sentence}`)}>🔊 点我朗读</button><div className="big-char reveal-char">{currentChar.char}</div><div className="char-pinyin">{currentChar.pinyin}</div><b>{currentChar.word}</b><p>{currentChar.sentence}</p><button className="primary" onClick={finishLearning}>我认识了，去练一练 →</button></article>}
          {hanziStage === "practice" && <article className="stage-card practice-stage"><MascotGuide name="虎教练" text={`把含有“${currentChar.char}”的词语投进能量箱！`} /><span className="kicker">第三关 · 练一练</span><div className="practice-char">{currentChar.char}</div><h2>哪个词语能点亮星星？</h2><div className="word-choices">{practiceChoices.map((choice) => <button key={choice} disabled={Boolean(feedback)} onClick={() => answerPractice(choice)}><span>🍯</span>{choice}</button>)}</div><div className="energy-chest">🎁 汉字能量箱</div></article>}
          {(hanziStage === "write") && <TracePad character={currentChar.char} active onComplete={finishWriting} />}
          {(hanziStage === "speak" || hanziStage === "done") && <article className={`stage-card speak-stage ${hanziStage === "done" ? "completed-card celebration" : ""}`}><MascotGuide name="小芽兔和虎教练" text={hanziStage === "done" ? "五关通关！送你一颗闪亮星星！" : "最后一关，大声说出来吧！"} /><span className="stage-emoji">{hanziStage === "done" ? "🏆" : "🗣️"}</span><span className="kicker">第五关 · 说一说</span><h2>{currentChar.sentence}</h2><p>先听一遍，再点击挑战并大声跟读</p><div className="speak-actions"><button className="listen-sentence" onClick={() => speak(currentChar.sentence)}>🔊 听句子</button><button className={`say-challenge ${sayPracticed ? "ready" : ""}`} disabled={sayCountdown > 0 || hanziStage === "done"} onClick={startSayChallenge}>{sayPracticed ? "✓ 跟读完成" : sayCountdown > 0 ? `${sayCountdown}… 大声说` : "🎙️ 开始跟读"}</button></div><button className="primary" disabled={!sayPracticed || hanziStage === "done"} onClick={completeCharacter}>{hanziStage === "done" ? "✓ 五关全部完成" : sayPracticed ? "领取星星，学习下一个字 →" : "完成跟读后领取星星"}</button>{hanziStage === "done" && <div className="star-burst" aria-hidden="true">⭐ ✨ ⭐ ✨ ⭐</div>}</article>}
        </div>
        <div className="lesson-switch">{hanziLessons.map((items, i) => <button key={i} className={lesson === i ? "active" : ""} onClick={() => { setLesson(i); setCharIndex(0); setHanziStage("play"); setSayPracticed(false); setSayCountdown(0); setFeedback(""); }}>第 {i + 1} 课 <small>{items.map((x) => x.char).join(" · ")}</small></button>)}</div>
      </>}
      {mode === "review" && <QuizFrame icon={reviewChar.icon} label={`一年级复习 · 第 ${reviewIndex + 1} 题`} title={`${reviewChar.pinyin} · ${reviewChar.word}`} instruction={learned.length ? "找出今天学过的汉字" : "先试试第一课的基础汉字"} choices={reviewChoices} onAnswer={answerReview} busy={Boolean(feedback)} />}
      {mode === "pinyin" && <QuizFrame icon={pinyinQuestions[pinyinIndex].icon} label={`拼音对对碰 · ${pinyinIndex + 1}/${pinyinQuestions.length}`} title={pinyinQuestions[pinyinIndex].prompt} instruction="找出正确的拼音" choices={pinyinQuestions[pinyinIndex].choices} onAnswer={answerPinyin} busy={Boolean(feedback)} />}
      {mode === "math" && <QuizFrame icon={mathQuestions[mathIndex].icon} label={`数学能量站 · ${mathIndex + 1}/${mathQuestions.length}`} title={`${mathQuestions[mathIndex].text} = ?`} instruction="动动小脑筋，选出答案" choices={mathQuestions[mathIndex].choices.map(String)} onAnswer={(answer) => answerMath(Number(answer))} busy={Boolean(feedback)} />}
      {mode === "english" && <>
        <div className="lesson-top"><div><span className="kicker">ENGLISH GAME</span><h1>英语单词抓大鹅</h1></div></div>
        <article className="goose-stage"><button className="target-word" onClick={() => speak(englishTarget.en, "en-US")}><small>请抓住“{englishTarget.zh}”</small><b>{englishTarget.en}</b><span>🔊 听发音</span></button><div className="goose-grid">{englishCards.map((word) => <button key={word.en} disabled={Boolean(feedback)} onClick={() => catchWord(word)}><span>{word.icon}</span><b>{word.en}</b><small>🪿</small></button>)}</div></article>
      </>}
      {mode === "reading" && <>
        <div className="lesson-top"><div><span className="kicker">一年级阅读与国学</span><h1>古诗与成语馆</h1><p>先听一遍，再跟着大声读，并试着说说意思。</p></div></div>
        <div className="poem-grid">{poems.map((poem) => <article className="poem-card" key={poem.title}><span>{poem.icon}</span><h2>{poem.title}</h2><small>{poem.author}</small>{poem.lines.map((line) => <p key={line}>{line}</p>)}<button onClick={() => speak(`${poem.title}，${poem.author}。${poem.lines.join("")}`)}>🔊 朗读全诗</button></article>)}</div>
        <h2 className="reward-title">每日成语故事</h2>
        <div className="poem-grid">{idioms.map((item) => <article className="poem-card" key={item.title}><span>{item.icon}</span><h2>{item.title}</h2><p>{item.meaning}</p><small>{item.example}</small><button onClick={() => speak(`${item.title}。${item.meaning}${item.example}`)}>🔊 听成语</button></article>)}</div>
      </>}
      {mode === "rewards" && <ParentCenter stars={stars} setStars={setStars} learned={learned.length} />}
    </section>}
    {feedback && <div className="feedback" role="status" aria-live="polite">{feedback}</div>}
    <footer><span>🌱 小芽学习屋</span><b>永久免费 · 无广告 · 数据保存在本机</b></footer>
  </main>;
}

function HomeScreen({ stars, learned, installed, go, customTasks, doneTasks, taskText, setTaskText, addTask, toggleTask, removeTask, attendanceComplete }: { stars: number; learned: number; installed: boolean; go: (mode: Mode) => void; customTasks: string[]; doneTasks: string[]; taskText: string; setTaskText: (value: string) => void; addTask: (event: FormEvent) => void; toggleTask: (task: string) => void; removeTask: (task: string) => void; attendanceComplete: boolean }) {
  // Format the date after hydration so WebKit and the server cannot disagree
  // about locale spacing or timezone and trigger React's error overlay.
  const [date, setDate] = useState("今天");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDate(new Intl.DateTimeFormat("zh-CN", {
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(new Date()));
  }, []);
  return <>
    <section className="home-hero"><div><span className="date-pill">🌤️ {date} · 一年级基础版</span><h1>出发吧，小小探索家！</h1><p>和小芽兔、虎教练一起，玩着学会100个字。</p><div className="hero-badges"><span>已认识 <b>{learned}</b>/100 个字</span><span>收集 <b>{stars}</b> 颗星</span></div></div><div className="mascot mascot-duo" aria-hidden="true"><img src="/mascot-duo.png" alt="" /><i>今天一起闯关吧！</i></div></section>
    {!installed && <section className="install-tip"><span>📲</span><div><b>装到 iPad 主屏幕</b><p>Safari 打开后，点“分享” →“添加到主屏幕”→ 打开“作为网页 App”。</p></div></section>}
    <section className="islands"><div className="section-title"><div><small>TODAY&apos;S ADVENTURE</small><h2>今日学习冒险</h2></div><span>每次答对都能获得 ⭐</span></div>
      <div className="course-grid">
        <CourseCard color="coral" icon="字" title="一年级识字" note="100字 · 玩认练写说" progress={`${learned}/100`} onClick={() => go("hanzi")} featured />
        <CourseCard color="green" icon="✓" title="复习小测" note="拼音 · 词语 · 认字" progress={learned ? `${learned}字` : "第一课"} onClick={() => go("review")} />
        <CourseCard color="blue" icon="ɑ" title="拼音城堡" note="听音 · 拼读 · 对对碰" progress="5关" onClick={() => go("pinyin")} />
        <CourseCard color="yellow" icon="＋" title="数学能量站" note="20以内加减法" progress="5题" onClick={() => go("math")} />
        <CourseCard color="green" icon="A" title="英语大鹅岛" note="听单词 · 抓大鹅" progress="12词" onClick={() => go("english")} />
        <CourseCard color="purple" icon="诗" title="古诗与成语馆" note="8首古诗 · 8个成语" progress="16篇" onClick={() => go("reading")} />
      </div>
    </section>
    <section className="daily-box"><div className="daily-heading"><div><span>✅</span><div><h2>我的每日任务</h2><p>{attendanceComplete ? "今日已全勤，明天继续加油" : "全部完成可得 1 颗星"}</p></div></div><b>{attendanceComplete ? "已全勤 ⭐" : `${doneTasks.length}/${customTasks.length}`}</b></div>
      <form onSubmit={addTask}><input value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="添加任务，如：朗读绘本10分钟" maxLength={28} /><button>添加</button></form>
      {customTasks.length ? <div className="personal-tasks">{customTasks.map((task) => <div key={task} className={doneTasks.includes(task) ? "done" : ""}><button aria-label={`${doneTasks.includes(task) ? "取消完成" : "完成"}任务：${task}`} onClick={() => toggleTask(task)}>{doneTasks.includes(task) ? "✓" : ""}</button><span>{task}</span><button aria-label={`删除任务：${task}`} onClick={() => removeTask(task)}>×</button></div>)}</div> : <p className="empty">还没有自定义任务，先加一个吧。</p>}
    </section>
  </>;
}

function CourseCard({ color, icon, title, note, progress, onClick, featured = false }: { color: string; icon: string; title: string; note: string; progress: string; onClick: () => void; featured?: boolean }) {
  return <button className={`course-card ${color} ${featured ? "featured" : ""}`} onClick={onClick}><span className="course-icon">{icon}</span><span className="course-copy"><small>{progress}</small><b>{title}</b><em>{note}</em></span><span className="course-go">开始学习 →</span></button>;
}

function QuizFrame({ icon, label, title, instruction, choices, onAnswer, busy = false }: { icon: string; label: string; title: string; instruction: string; choices: string[]; onAnswer: (answer: string) => void; busy?: boolean }) {
  return <article className="quiz-card"><span className="kicker">{label}</span><p>{instruction}</p><div className="quiz-prompt"><span>{icon}</span><b>{title}</b></div><div className="quiz-choices">{choices.map((choice) => <button key={choice} disabled={busy} onClick={() => onAnswer(choice)}>{choice}</button>)}</div></article>;
}

function MascotGuide({ name, text }: { name: string; text: string }) {
  return <div className="mascot-guide"><img src="/mascot-duo.png" alt="小芽兔和虎教练" /><div><b>{name}</b><span>{text}</span></div></div>;
}

function TracePad({ character, active, onComplete }: { character: string; active: boolean; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);
  function point(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current; if (!canvas) return; const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) };
  }
  function start(event: PointerEvent<HTMLCanvasElement>) { if (!active) return; drawing.current = true; setHasInk(true); event.currentTarget.setPointerCapture(event.pointerId); const p = point(event); const ctx = canvasRef.current?.getContext("2d"); if (p && ctx) { ctx.beginPath(); ctx.moveTo(p.x, p.y); } }
  function move(event: PointerEvent<HTMLCanvasElement>) { if (!drawing.current) return; const p = point(event); const ctx = canvasRef.current?.getContext("2d"); if (p && ctx) { ctx.lineWidth = 14; ctx.lineCap = "round"; ctx.strokeStyle = "#f27848"; ctx.lineTo(p.x, p.y); ctx.stroke(); } }
  function clear() { const canvas = canvasRef.current; canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height); setHasInk(false); }
  return <article className="trace-card active"><MascotGuide name="小芽兔" text="沿着灰色字描一描，我来陪你写！" /><div className="trace-heading"><h2>第四关 · 写一写“{character}”</h2><button disabled={!hasInk} onClick={clear}>擦除重写</button></div><div className="trace-box"><span>{character}</span><canvas aria-label={`在田字格中描写“${character}”`} ref={canvasRef} width="420" height="420" onPointerDown={start} onPointerMove={move} onPointerUp={() => drawing.current = false} onPointerCancel={() => drawing.current = false} /></div><p>{hasInk ? "写得真认真！确认后去挑战说一说" : "用手指沿着灰色字描一描"}</p><button className="confirm-write" disabled={!hasInk} onClick={onComplete}>{hasInk ? "写好了，确认完成 →" : "请先写一写"}</button></article>;
}

function ParentCenter({ stars, setStars, learned }: { stars: number; setStars: (change: (value: number) => number) => void; learned: number }) {
  const [message, setMessage] = useState("");
  function redeem(name: string, cost: number) { if (stars < cost) return; setStars((value) => value - cost); setMessage(`已兑换“${name}”，请家长兑现约定 🎉`); }
  return <><div className="lesson-top"><div><span className="kicker">PARENT CENTER</span><h1>家长中心</h1><p>所有学习数据仅保存在这台设备，不上传云端。</p></div></div><div className="parent-stats"><article><span>⭐</span><b>{stars}</b><small>可用星星</small></article><article><span>🀄</span><b>{learned}</b><small>已学汉字</small></article><article><span>🛡️</span><b>0</b><small>广告与付费</small></article></div><h2 className="reward-title">星星奖励商店</h2><div className="reward-grid">{rewards.map((item) => <article key={item.name}><span>{item.icon}</span><h3>{item.name}</h3><p>{item.stars} 颗星</p><button disabled={stars < item.stars} onClick={() => redeem(item.name, item.stars)}>{stars >= item.stars ? "兑换奖励" : `还差 ${item.stars - stars} 颗`}</button></article>)}</div>{message && <div className="parent-message">{message}</div>}<div className="privacy-note"><span>💡</span><div><b>家长建议</b><p>每天控制在30–60分钟，中途远眺休息。兑换奖励后及时兑现，更能帮助孩子建立坚持学习的好习惯。</p></div></div></>;
}
