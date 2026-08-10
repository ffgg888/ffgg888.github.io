"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Task = {
  id: string;
  title: string;
  note: string;
  minutes: number;
  icon: string;
  subject: "语文" | "数学" | "自定义";
};

const chineseTasks: Task[] = [
  { id: "poem", title: "背一首古诗", note: "《咏鹅》· 骆宾王", minutes: 5, icon: "📜", subject: "语文" },
  { id: "idiom", title: "成语故事", note: "今日：守株待兔", minutes: 5, icon: "📖", subject: "语文" },
  { id: "chars", title: "认识 10 个生字", note: "天、地、人、你、我、他…", minutes: 5, icon: "🀄", subject: "语文" },
  { id: "writing", title: "控笔训练", note: "横线、波浪线各 2 行", minutes: 5, icon: "✏️", subject: "语文" },
  { id: "pinyin", title: "拼音练习题", note: "声母 b p m f", minutes: 5, icon: "🔤", subject: "语文" },
  { id: "reading", title: "每日绘本阅读", note: "大声读给家人听", minutes: 5, icon: "🌈", subject: "语文" },
];

const mathTasks: Task[] = [
  { id: "count", title: "数与运算", note: "20 以内加减法", minutes: 20, icon: "➕", subject: "数学" },
  { id: "shape", title: "图形认知", note: "找找身边的立体图形", minutes: 15, icon: "🔷", subject: "数学" },
  { id: "problem", title: "应用题", note: "读题、圈重点、列算式", minutes: 15, icon: "🧩", subject: "数学" },
  { id: "challenge", title: "思维挑战", note: "完成今日规律小题", minutes: 10, icon: "💡", subject: "数学" },
];

const pinyinRounds = [
  { word: "月亮", icon: "🌙", choices: ["yuè liang", "yè liàng", "yù lián"], answer: "yuè liang" },
  { word: "苹果", icon: "🍎", choices: ["píng guǒ", "pín guō", "bīng guǒ"], answer: "píng guǒ" },
  { word: "蝴蝶", icon: "🦋", choices: ["hú dié", "fú tié", "hǔ diē"], answer: "hú dié" },
  { word: "火车", icon: "🚂", choices: ["huǒ chē", "hǔo cē", "fǒ chē"], answer: "huǒ chē" },
];

const gooseWords = [
  { en: "apple", zh: "苹果", icon: "🍎" },
  { en: "star", zh: "星星", icon: "⭐" },
  { en: "cat", zh: "小猫", icon: "🐱" },
  { en: "book", zh: "书", icon: "📕" },
  { en: "fish", zh: "鱼", icon: "🐟" },
  { en: "sun", zh: "太阳", icon: "☀️" },
];

const rewards = [
  { name: "美味小零食", points: 10, icon: "🍪", color: "peach" },
  { name: "心愿小玩具", points: 20, icon: "🧸", color: "blue" },
  { name: "儿童乐园游玩", points: 30, icon: "🎡", color: "purple" },
];

const storageKey = "youxiao-workbench-v1";

function todayKey() {
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export default function Home() {
  const [tab, setTab] = useState<"today" | "games" | "rewards">("today");
  const [checked, setChecked] = useState<string[]>([]);
  const [customTasks, setCustomTasks] = useState<Task[]>([]);
  const [customTitle, setCustomTitle] = useState("");
  const [customMinutes, setCustomMinutes] = useState(10);
  const [points, setPoints] = useState(0);
  const [awardedDates, setAwardedDates] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [ready, setReady] = useState(false);
  const [pinyinIndex, setPinyinIndex] = useState(0);
  const [pinyinFeedback, setPinyinFeedback] = useState("");
  const [pinyinScore, setPinyinScore] = useState(0);
  const [gooseTarget, setGooseTarget] = useState(gooseWords[0]);
  const [gooseCards, setGooseCards] = useState(gooseWords);
  const [gooseScore, setGooseScore] = useState(0);
  const [gooseFeedback, setGooseFeedback] = useState("");

  const baseTasks = [...chineseTasks, ...mathTasks];
  const allTasks = [...baseTasks, ...customTasks];
  const completedBase = baseTasks.filter((task) => checked.includes(task.id)).length;
  const totalMinutes = allTasks.filter((task) => checked.includes(task.id)).reduce((sum, task) => sum + task.minutes, 0);
  const chineseMinutes = chineseTasks.filter((task) => checked.includes(task.id)).reduce((sum, task) => sum + task.minutes, 0);
  const mathMinutes = mathTasks.filter((task) => checked.includes(task.id)).reduce((sum, task) => sum + task.minutes, 0);
  const progress = Math.round((completedBase / baseTasks.length) * 100);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.date === todayKey()) setChecked(data.checked ?? []);
        setCustomTasks(data.customTasks ?? []);
        setPoints(data.points ?? 0);
        setAwardedDates(data.awardedDates ?? []);
      }
    } catch { /* Keep a fresh workspace if stored data is unavailable. */ }
    setGooseCards(shuffle(gooseWords));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(storageKey, JSON.stringify({ date: todayKey(), checked, customTasks, points, awardedDates }));
  }, [checked, customTasks, points, awardedDates, ready]);

  useEffect(() => {
    if (!ready || completedBase !== baseTasks.length || awardedDates.includes(todayKey())) return;
    setPoints((value) => value + 1);
    setAwardedDates((dates) => [...dates, todayKey()]);
    showToast("全勤打卡成功！奖励 1 积分 ⭐");
  }, [completedBase, awardedDates, ready, baseTasks.length]);

  const dateLabel = useMemo(() => new Intl.DateTimeFormat("zh-CN", {
    month: "long", day: "numeric", weekday: "long",
  }).format(new Date()), []);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function toggleTask(id: string) {
    setChecked((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  }

  function addTask(event: FormEvent) {
    event.preventDefault();
    const title = customTitle.trim();
    if (!title) return;
    setCustomTasks((items) => [...items, {
      id: `custom-${Date.now()}`, title, note: "我的专属任务", minutes: customMinutes, icon: "🚀", subject: "自定义",
    }]);
    setCustomTitle("");
    showToast("新任务已加入今日计划");
  }

  function answerPinyin(choice: string) {
    if (pinyinFeedback) return;
    const correct = choice === pinyinRounds[pinyinIndex].answer;
    setPinyinFeedback(correct ? "答对啦！真棒 ✨" : `再记一记：${pinyinRounds[pinyinIndex].answer}`);
    if (correct) setPinyinScore((score) => score + 1);
    window.setTimeout(() => {
      setPinyinFeedback("");
      setPinyinIndex((index) => (index + 1) % pinyinRounds.length);
    }, 1300);
  }

  function catchGoose(word: typeof gooseWords[number]) {
    if (gooseFeedback) return;
    if (word.en === gooseTarget.en) {
      setGooseScore((score) => score + 1);
      setGooseFeedback("抓到啦！+1 🪿");
      window.setTimeout(() => {
        const next = gooseWords[Math.floor(Math.random() * gooseWords.length)];
        setGooseTarget(next);
        setGooseCards(shuffle(gooseWords));
        setGooseFeedback("");
      }, 900);
    } else {
      setGooseFeedback("这只不是，再找找 👀");
      window.setTimeout(() => setGooseFeedback(""), 800);
    }
  }

  function redeem(name: string, cost: number) {
    if (points < cost) return;
    setPoints((value) => value - cost);
    showToast(`兑换成功：${name}！请找家长领取 🎉`);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="幼小衔接工作台首页">
          <span className="brand-mark">芽</span>
          <span><b>小芽学习屋</b><small>幼小衔接工作台</small></span>
        </a>
        <nav aria-label="主要导航">
          <button className={tab === "today" ? "active" : ""} onClick={() => setTab("today")}>今日学习</button>
          <button className={tab === "games" ? "active" : ""} onClick={() => setTab("games")}>趣味闯关</button>
          <button className={tab === "rewards" ? "active" : ""} onClick={() => setTab("rewards")}>积分奖励</button>
        </nav>
        <button className="points-pill" onClick={() => setTab("rewards")} aria-label={`当前 ${points} 积分`}><span>⭐</span><b>{points}</b> 积分</button>
      </header>

      <section id="top" className="hero">
        <div>
          <span className="date-pill">🌤️ {dateLabel}</span>
          <h1>{completedBase === baseTasks.length ? "今日任务全部完成！" : "今天也要元气满满！"}</h1>
          <p>{completedBase === baseTasks.length ? "太了不起啦，明天也一起坚持。" : "每一次认真，都是成长的小脚印。"}</p>
        </div>
        <div className="hero-progress" aria-label={`今日基础任务完成 ${progress}%`}>
          <div className="ring" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}><span><b>{progress}%</b><small>今日进度</small></span></div>
          <div><b>{completedBase}/{baseTasks.length}</b><span>项任务完成</span><small>已学习 {totalMinutes} 分钟</small></div>
        </div>
      </section>

      {tab === "today" && <section className="content-section" aria-label="今日学习任务">
        <div className="section-heading">
          <div><span className="eyebrow">TODAY&apos;S PLAN</span><h2>今日学习计划</h2></div>
          <span className="hint">完成全部基础任务，自动获得 1 积分</span>
        </div>
        <div className="subject-grid">
          <TaskPanel title="语文 · 30 分钟" icon="📚" color="orange" current={chineseMinutes} goal={30} tasks={chineseTasks} checked={checked} onToggle={toggleTask} />
          <TaskPanel title="数学 · 60 分钟" icon="🧮" color="blue" current={mathMinutes} goal={60} tasks={mathTasks} checked={checked} onToggle={toggleTask} />
        </div>

        <div className="custom-panel">
          <div className="custom-copy"><span className="custom-icon">➕</span><div><h3>我的自定义任务</h3><p>把需要练习的内容也加入今天吧</p></div></div>
          <form onSubmit={addTask} className="task-form">
            <label><span className="sr-only">任务名称</span><input value={customTitle} onChange={(event) => setCustomTitle(event.target.value)} placeholder="例如：跳绳 100 个" maxLength={24} /></label>
            <label><span className="sr-only">任务时长</span><select value={customMinutes} onChange={(event) => setCustomMinutes(Number(event.target.value))}><option value={5}>5 分钟</option><option value={10}>10 分钟</option><option value={15}>15 分钟</option><option value={20}>20 分钟</option><option value={30}>30 分钟</option></select></label>
            <button type="submit">添加任务</button>
          </form>
          {customTasks.length > 0 && <div className="custom-list">{customTasks.map((task) => <div className={`task-row ${checked.includes(task.id) ? "done" : ""}`} key={task.id}><button className="check" onClick={() => toggleTask(task.id)} aria-label={`${checked.includes(task.id) ? "取消完成" : "完成"}${task.title}`}>{checked.includes(task.id) ? "✓" : ""}</button><span className="task-icon">{task.icon}</span><div><b>{task.title}</b><small>{task.minutes} 分钟 · {task.note}</small></div><button className="remove" onClick={() => { setCustomTasks((items) => items.filter((item) => item.id !== task.id)); setChecked((items) => items.filter((item) => item !== task.id)); }} aria-label={`删除${task.title}`}>×</button></div>)}</div>}
        </div>
      </section>}

      {tab === "games" && <section className="content-section games-section">
        <div className="section-heading"><div><span className="eyebrow">LEARNING GAMES</span><h2>趣味闯关岛</h2></div><span className="hint">玩一玩，也能学得牢</span></div>
        <div className="game-grid">
          <article className="game-card pinyin-game">
            <div className="game-title"><span>🔡</span><div><small>第 {pinyinIndex + 1}/{pinyinRounds.length} 关</small><h3>拼音对对碰</h3></div><b>得分 {pinyinScore}</b></div>
            <p className="game-instruction">给下面的词语找到正确拼音</p>
            <div className="word-card"><span>{pinyinRounds[pinyinIndex].icon}</span><b>{pinyinRounds[pinyinIndex].word}</b></div>
            <div className="choice-list">{pinyinRounds[pinyinIndex].choices.map((choice) => <button key={choice} onClick={() => answerPinyin(choice)}>{choice}</button>)}</div>
            <div className="feedback" aria-live="polite">{pinyinFeedback || "选一个答案，开始闯关吧！"}</div>
          </article>

          <article className="game-card goose-game">
            <div className="game-title"><span>🪿</span><div><small>词汇捕手</small><h3>英语单词抓大鹅</h3></div><b>抓到 {gooseScore}</b></div>
            <div className="target-banner">请抓住 <strong>{gooseTarget.zh}</strong>：<b>{gooseTarget.en}</b></div>
            <div className="goose-grid">{gooseCards.map((word) => <button key={word.en} onClick={() => catchGoose(word)} aria-label={`${word.en} ${word.zh}`}><span>{word.icon}</span><b>{word.en}</b><small>🪿</small></button>)}</div>
            <div className="feedback" aria-live="polite">{gooseFeedback || "看准单词，点中正确的大鹅！"}</div>
          </article>
        </div>
      </section>}

      {tab === "rewards" && <section className="content-section reward-section">
        <div className="section-heading"><div><span className="eyebrow">MY REWARDS</span><h2>坚持有奖励</h2></div><span className="hint">全勤一天 = 1 积分</span></div>
        <div className="reward-summary"><div><span>⭐</span><small>我的积分</small><b>{points}</b></div><div><h3>离下一个奖励还有多远？</h3><p>{points >= 30 ? "所有奖励都可以兑换啦！" : `再积 ${points < 10 ? 10 - points : points < 20 ? 20 - points : 30 - points} 分，就能兑换${points < 10 ? "小零食" : points < 20 ? "小玩具" : "儿童乐园游玩"}。`}</p><div className="reward-track"><span style={{ width: `${Math.min(100, (points / 30) * 100)}%` }} /></div><div className="track-labels"><span>0</span><span>10 🍪</span><span>20 🧸</span><span>30 🎡</span></div></div></div>
        <div className="reward-grid">{rewards.map((reward) => <article className={`reward-card ${reward.color}`} key={reward.name}><span>{reward.icon}</span><h3>{reward.name}</h3><p><b>{reward.points}</b> 积分兑换</p><button disabled={points < reward.points} onClick={() => redeem(reward.name, reward.points)}>{points >= reward.points ? "立即兑换" : `还差 ${reward.points - points} 分`}</button></article>)}</div>
        <div className="parent-note"><span>💬</span><div><b>给家长的小提示</b><p>兑换后请及时兑现约定，让孩子感受到坚持的价值。积分只保存在当前设备中。</p></div></div>
      </section>}

      <footer><span>🌱</span><p><b>每天进步一点点</b><small>让学习成为一件快乐的事</small></p><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>回到顶部 ↑</button></footer>
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

function TaskPanel({ title, icon, color, current, goal, tasks, checked, onToggle }: { title: string; icon: string; color: string; current: number; goal: number; tasks: Task[]; checked: string[]; onToggle: (id: string) => void }) {
  return <article className={`subject-panel ${color}`}>
    <div className="panel-head"><div><span>{icon}</span><div><h3>{title}</h3><small>{current}/{goal} 分钟</small></div></div><div className="mini-progress"><span style={{ width: `${Math.min(100, (current / goal) * 100)}%` }} /></div></div>
    <div className="task-list">{tasks.map((task) => {
      const done = checked.includes(task.id);
      return <button className={`task-row ${done ? "done" : ""}`} key={task.id} onClick={() => onToggle(task.id)} aria-pressed={done}><span className="check">{done ? "✓" : ""}</span><span className="task-icon">{task.icon}</span><span><b>{task.title}</b><small>{task.note}</small></span><em>{task.minutes} 分钟</em></button>;
    })}</div>
  </article>;
}
