"use client";

import { FormEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";

type Mode = "home" | "hanzi" | "pinyin" | "math" | "english" | "reading" | "rewards";
type Hanzi = { char: string; pinyin: string; word: string; sentence: string; icon: string };

const hanziLessons: Hanzi[][] = [
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
  { title: "咏鹅", author: "骆宾王", lines: ["鹅，鹅，鹅，", "曲项向天歌。", "白毛浮绿水，", "红掌拨清波。"], icon: "🪿" },
  { title: "静夜思", author: "李白", lines: ["床前明月光，", "疑是地上霜。", "举头望明月，", "低头思故乡。"], icon: "🌙" },
  { title: "春晓", author: "孟浩然", lines: ["春眠不觉晓，", "处处闻啼鸟。", "夜来风雨声，", "花落知多少。"], icon: "🌸" },
  { title: "悯农（其二）", author: "李绅", lines: ["锄禾日当午，", "汗滴禾下土。", "谁知盘中餐，", "粒粒皆辛苦。"], icon: "🌾" },
];

const rewards = [{ name: "美味小零食", stars: 10, icon: "🍪" }, { name: "心愿小玩具", stars: 20, icon: "🧸" }, { name: "儿童乐园", stars: 30, icon: "🎡" }];
const storeKey = "xiaoya-free-learning-v2";

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
  const [pinyinIndex, setPinyinIndex] = useState(0);
  const [mathIndex, setMathIndex] = useState(0);
  const [englishTarget, setEnglishTarget] = useState(englishWords[0]);
  const [englishCards, setEnglishCards] = useState(englishWords.slice(0, 6));
  const [feedback, setFeedback] = useState("");
  const [customTasks, setCustomTasks] = useState<string[]>([]);
  const [taskText, setTaskText] = useState("");
  const [doneTasks, setDoneTasks] = useState<string[]>([]);
  const [installed, setInstalled] = useState(false);
  const [ready, setReady] = useState(false);

  const currentChar = hanziLessons[lesson][charIndex];
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
      setStars(saved.stars || 0); setLearned(saved.learned || []);
      setCustomTasks(saved.customTasks || []); setDoneTasks(saved.doneTasks || []);
    } catch { /* Begin with a fresh local profile. */ }
    const initialCards = shuffle(englishWords).slice(0, 6);
    setEnglishCards(initialCards);
    setEnglishTarget(initialCards[0]);
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(storeKey, JSON.stringify({ stars, learned, customTasks, doneTasks }));
  }, [stars, learned, customTasks, doneTasks, ready]);

  function go(next: Mode) { setFeedback(""); setMode(next); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function reward(message: string, amount = 1) { setStars((value) => value + amount); setFeedback(`${message}  +${amount} ⭐`); }
  function nextChar() {
    if (!learned.includes(currentChar.char)) { setLearned((items) => [...items, currentChar.char]); reward("学会一个新字！"); }
    else setFeedback("这个字已经学会啦 ✓");
    window.setTimeout(() => { setFeedback(""); setCharIndex((index) => (index + 1) % hanziLessons[lesson].length); }, 850);
  }
  function answerPinyin(choice: string) {
    if (feedback) return;
    const right = choice === pinyinQuestions[pinyinIndex].answer;
    if (right) reward("拼对啦！"); else setFeedback(`再读一遍：${pinyinQuestions[pinyinIndex].answer}`);
    window.setTimeout(() => { setFeedback(""); setPinyinIndex((i) => (i + 1) % pinyinQuestions.length); }, 1000);
  }
  function answerMath(choice: number) {
    if (feedback) return;
    if (choice === mathQuestions[mathIndex].answer) reward("算对啦！"); else setFeedback("再数一数，你可以的");
    window.setTimeout(() => { setFeedback(""); setMathIndex((i) => (i + 1) % mathQuestions.length); }, 900);
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
  function addTask(event: FormEvent) { event.preventDefault(); const value = taskText.trim(); if (!value) return; setCustomTasks((items) => [...items, value]); setTaskText(""); }

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

    {mode === "home" && <HomeScreen stars={stars} learned={learned.length} installed={installed} go={go} customTasks={customTasks} doneTasks={doneTasks} taskText={taskText} setTaskText={setTaskText} addTask={addTask} toggleTask={(task) => setDoneTasks((items) => items.includes(task) ? items.filter((x) => x !== task) : [...items, task])} removeTask={(task) => { setCustomTasks((items) => items.filter((x) => x !== task)); setDoneTasks((items) => items.filter((x) => x !== task)); }} />}

    {mode !== "home" && <section className="lesson-shell">
      <button className="back" onClick={() => go("home")}>← 返回学习岛</button>
      {mode === "hanzi" && <>
        <div className="lesson-top"><div><span className="kicker">汉字探险 · 第 {lesson + 1} 课</span><h1>听一听，认一认，写一写</h1></div><div className="step-dots">{hanziLessons[lesson].map((_, i) => <span className={i <= charIndex ? "on" : ""} key={i} />)}</div></div>
        <div className="hanzi-layout">
          <article className="learn-card"><span className="scene-icon">{currentChar.icon}</span><button className="sound" onClick={() => speak(`${currentChar.char}，${currentChar.word}。${currentChar.sentence}`)}>🔊 点我朗读</button><div className="big-char">{currentChar.char}</div><div className="char-pinyin">{currentChar.pinyin}</div><b>{currentChar.word}</b><p>{currentChar.sentence}</p><button className="primary" onClick={nextChar}>我认识了</button></article>
          <TracePad character={currentChar.char} />
        </div>
        <div className="lesson-switch">{hanziLessons.map((items, i) => <button key={i} className={lesson === i ? "active" : ""} onClick={() => { setLesson(i); setCharIndex(0); setFeedback(""); }}>第 {i + 1} 课 <small>{items.map((x) => x.char).join(" · ")}</small></button>)}</div>
      </>}
      {mode === "pinyin" && <QuizFrame icon={pinyinQuestions[pinyinIndex].icon} label={`拼音对对碰 · ${pinyinIndex + 1}/${pinyinQuestions.length}`} title={pinyinQuestions[pinyinIndex].prompt} instruction="找出正确的拼音" choices={pinyinQuestions[pinyinIndex].choices} onAnswer={answerPinyin} />}
      {mode === "math" && <QuizFrame icon={mathQuestions[mathIndex].icon} label={`数学能量站 · ${mathIndex + 1}/${mathQuestions.length}`} title={`${mathQuestions[mathIndex].text} = ?`} instruction="动动小脑筋，选出答案" choices={mathQuestions[mathIndex].choices.map(String)} onAnswer={(answer) => answerMath(Number(answer))} />}
      {mode === "english" && <>
        <div className="lesson-top"><div><span className="kicker">ENGLISH GAME</span><h1>英语单词抓大鹅</h1></div></div>
        <article className="goose-stage"><button className="target-word" onClick={() => speak(englishTarget.en, "en-US")}><small>请抓住“{englishTarget.zh}”</small><b>{englishTarget.en}</b><span>🔊 听发音</span></button><div className="goose-grid">{englishCards.map((word) => <button key={word.en} onClick={() => catchWord(word)}><span>{word.icon}</span><b>{word.en}</b><small>🪿</small></button>)}</div></article>
      </>}
      {mode === "reading" && <>
        <div className="lesson-top"><div><span className="kicker">每日国学</span><h1>古诗阅读馆</h1><p>先听一遍，再跟着大声读。</p></div></div>
        <div className="poem-grid">{poems.map((poem) => <article className="poem-card" key={poem.title}><span>{poem.icon}</span><h2>{poem.title}</h2><small>〔唐〕{poem.author}</small>{poem.lines.map((line) => <p key={line}>{line}</p>)}<button onClick={() => speak(`${poem.title}，${poem.author}。${poem.lines.join("")}`)}>🔊 朗读全诗</button></article>)}</div>
      </>}
      {mode === "rewards" && <ParentCenter stars={stars} setStars={setStars} learned={learned.length} />}
      {feedback && <div className="feedback" role="status">{feedback}</div>}
    </section>}
    <footer><span>🌱 小芽学习屋</span><b>永久免费 · 无广告 · 数据保存在本机</b></footer>
  </main>;
}

function HomeScreen({ stars, learned, installed, go, customTasks, doneTasks, taskText, setTaskText, addTask, toggleTask, removeTask }: { stars: number; learned: number; installed: boolean; go: (mode: Mode) => void; customTasks: string[]; doneTasks: string[]; taskText: string; setTaskText: (value: string) => void; addTask: (event: FormEvent) => void; toggleTask: (task: string) => void; removeTask: (task: string) => void }) {
  const date = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date());
  return <>
    <section className="home-hero"><div><span className="date-pill">🌤️ {date}</span><h1>出发吧，小小探索家！</h1><p>今天想先去哪个学习岛？</p><div className="hero-badges"><span>已认识 <b>{learned}</b> 个字</span><span>收集 <b>{stars}</b> 颗星</span></div></div><div className="mascot" aria-hidden="true"><span>🌱</span><i>今天也要加油呀！</i></div></section>
    {!installed && <section className="install-tip"><span>📲</span><div><b>装到 iPad 主屏幕</b><p>Safari 打开后，点“分享” →“添加到主屏幕”→ 打开“作为网页 App”。</p></div></section>}
    <section className="islands"><div className="section-title"><div><small>TODAY&apos;S ADVENTURE</small><h2>今日学习冒险</h2></div><span>每次答对都能获得 ⭐</span></div>
      <div className="course-grid">
        <CourseCard color="coral" icon="字" title="汉字探险" note="识字 · 组词 · 书写" progress={`${learned}/30`} onClick={() => go("hanzi")} featured />
        <CourseCard color="blue" icon="ɑ" title="拼音城堡" note="听音 · 拼读 · 对对碰" progress="5关" onClick={() => go("pinyin")} />
        <CourseCard color="yellow" icon="＋" title="数学能量站" note="20以内加减法" progress="5题" onClick={() => go("math")} />
        <CourseCard color="green" icon="A" title="英语大鹅岛" note="听单词 · 抓大鹅" progress="12词" onClick={() => go("english")} />
        <CourseCard color="purple" icon="诗" title="古诗阅读馆" note="听读 · 跟读 · 背诵" progress="4首" onClick={() => go("reading")} />
      </div>
    </section>
    <section className="daily-box"><div className="daily-heading"><div><span>✅</span><div><h2>我的每日任务</h2><p>完成后点一下，养成好习惯</p></div></div><b>{doneTasks.length}/{customTasks.length}</b></div>
      <form onSubmit={addTask}><input value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="添加任务，如：朗读绘本10分钟" maxLength={28} /><button>添加</button></form>
      {customTasks.length ? <div className="personal-tasks">{customTasks.map((task) => <div key={task} className={doneTasks.includes(task) ? "done" : ""}><button onClick={() => toggleTask(task)}>{doneTasks.includes(task) ? "✓" : ""}</button><span>{task}</span><button onClick={() => removeTask(task)}>×</button></div>)}</div> : <p className="empty">还没有自定义任务，先加一个吧。</p>}
    </section>
  </>;
}

function CourseCard({ color, icon, title, note, progress, onClick, featured = false }: { color: string; icon: string; title: string; note: string; progress: string; onClick: () => void; featured?: boolean }) {
  return <button className={`course-card ${color} ${featured ? "featured" : ""}`} onClick={onClick}><span className="course-icon">{icon}</span><span className="course-copy"><small>{progress}</small><b>{title}</b><em>{note}</em></span><span className="course-go">开始学习 →</span></button>;
}

function QuizFrame({ icon, label, title, instruction, choices, onAnswer }: { icon: string; label: string; title: string; instruction: string; choices: string[]; onAnswer: (answer: string) => void }) {
  return <article className="quiz-card"><span className="kicker">{label}</span><p>{instruction}</p><div className="quiz-prompt"><span>{icon}</span><b>{title}</b></div><div className="quiz-choices">{choices.map((choice) => <button key={choice} onClick={() => onAnswer(choice)}>{choice}</button>)}</div></article>;
}

function TracePad({ character }: { character: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  function point(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current; if (!canvas) return; const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) };
  }
  function start(event: PointerEvent<HTMLCanvasElement>) { drawing.current = true; event.currentTarget.setPointerCapture(event.pointerId); const p = point(event); const ctx = canvasRef.current?.getContext("2d"); if (p && ctx) { ctx.beginPath(); ctx.moveTo(p.x, p.y); } }
  function move(event: PointerEvent<HTMLCanvasElement>) { if (!drawing.current) return; const p = point(event); const ctx = canvasRef.current?.getContext("2d"); if (p && ctx) { ctx.lineWidth = 14; ctx.lineCap = "round"; ctx.strokeStyle = "#f27848"; ctx.lineTo(p.x, p.y); ctx.stroke(); } }
  function clear() { const canvas = canvasRef.current; canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height); }
  return <article className="trace-card"><div><h2>我来写一写</h2><button onClick={clear}>擦除重写</button></div><div className="trace-box"><span>{character}</span><canvas ref={canvasRef} width="420" height="420" onPointerDown={start} onPointerMove={move} onPointerUp={() => drawing.current = false} onPointerCancel={() => drawing.current = false} /></div><p>用手指沿着灰色字描一描</p></article>;
}

function ParentCenter({ stars, setStars, learned }: { stars: number; setStars: (change: (value: number) => number) => void; learned: number }) {
  const [message, setMessage] = useState("");
  function redeem(name: string, cost: number) { if (stars < cost) return; setStars((value) => value - cost); setMessage(`已兑换“${name}”，请家长兑现约定 🎉`); }
  return <><div className="lesson-top"><div><span className="kicker">PARENT CENTER</span><h1>家长中心</h1><p>所有学习数据仅保存在这台设备，不上传云端。</p></div></div><div className="parent-stats"><article><span>⭐</span><b>{stars}</b><small>可用星星</small></article><article><span>🀄</span><b>{learned}</b><small>已学汉字</small></article><article><span>🛡️</span><b>0</b><small>广告与付费</small></article></div><h2 className="reward-title">星星奖励商店</h2><div className="reward-grid">{rewards.map((item) => <article key={item.name}><span>{item.icon}</span><h3>{item.name}</h3><p>{item.stars} 颗星</p><button disabled={stars < item.stars} onClick={() => redeem(item.name, item.stars)}>{stars >= item.stars ? "兑换奖励" : `还差 ${item.stars - stars} 颗`}</button></article>)}</div>{message && <div className="parent-message">{message}</div>}<div className="privacy-note"><span>💡</span><div><b>家长建议</b><p>每天控制在30–60分钟，中途远眺休息。兑换奖励后及时兑现，更能帮助孩子建立坚持学习的好习惯。</p></div></div></>;
}
