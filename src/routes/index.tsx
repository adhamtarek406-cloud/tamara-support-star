import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "تحدي السوشال ميديا — تمارا" },
      { name: "description", content: "لعبة تفاعلية لتدريب فريق السوشال ميديا على اختيار الرد الصحيح." },
      { property: "og:title", content: "تحدي السوشال ميديا — تمارا" },
      { property: "og:description", content: "اسحب كل تعليق على الماكرو الصحيح وأكمل التحدي." },
    ],
  }),
  component: TamaraChallenge,
});

type Pair = { id: number; comment: string; macro: string };

const PAIRS: Pair[] = [
  { id: 1, comment: "عندي مشكلة في التطبيق ومو راضي يخليني أدفع، وش الحل؟", macro: "يا هلا! لخدمتك بشكل أفضل، سجّل دخولك على تطبيق تمارا، روح لمركز المساعدة واضغط \"تواصل مع الدعم\" وشاركنا تفاصيل مشكلتك 💜" },
  { id: 2, comment: "ليش انرفض طلبي في تمارا؟ مع إن حسابي فيه فلوس!", macro: "يا هلا 💜 خيار تمارا وقت الدفع يعتمد على عدة عوامل مثل إعدادات المتجر، التقييم الائتماني، وحد الشراء" },
  { id: 3, comment: "أبي أغير طريقة الدفع من 3 شهور إلى 6 شهور بعد ما طلبت، كيف؟", macro: "يا هلا 💜 خطة الدفع تُحدد تلقائيًا لكل طلب، ولا يمكن تعديلها بعد اختيارها" },
  { id: 4, comment: "أقدر أشتري من متجر ثاني وأنا للحين ما سددت قسطي الأول؟", macro: "يا هلا 💜 تقدر تسوي أكثر من طلب، بشرط إن طلبك الأول ما يكون باقي عليه دفعات مستحقة" },
  { id: 5, comment: "هل تمارا حصري للموظفين فقط؟ والطلاب يمديهم؟", macro: "تمارا متاحة للجميع مو شرط تكون موظف. فقط إذا حاب تقسّم حتى 24 شهر، يشترط يكون الحد الأدنى للراتب 2500 ريال 💳" },
  { id: 6, comment: "عمري 17 سنة أقدر أسجل بتمارا وأطلب؟", macro: "تقدر تستخدم تمارا إذا كان عمرك 18 سنة أو أكبر 💜✨" },
  { id: 7, comment: "أقدر أدفع ببطاقة فيزا مسبقة الدفع (Prepaid)؟", macro: "💜 تقدر تدفع باستخدام بطاقة مدى أو البطاقات الائتمانية، لكن البطاقات مسبقة الدفع غير مدعومة ✨" },
  { id: 8, comment: "كنسلت طلبي من المتجر، متى ترجعون لي فلوسي؟", macro: "يا هلا 💜 بعد ما يكتمل إلغاء الطلب، بيرجع المبلغ لحسابك البنكي تلقائيًا 💳" },
  { id: 9, comment: "المتجر قالي رفعنا لكم طلب استرجاع بس ما شفت شيء بالتطبيق.", macro: "يا هلا 💜 الاسترداد يبدأ إذا حدّث المتجر حالة طلبك، وتقدر تتابع حالة الاسترداد من خانة \"مشترياتي\" في صفحة تفاصيل الطلب على تطبيق تمارا 💳" },
  { id: 10, comment: "هل نظامكم حلال وفيه فوايد أو رسوم تأخير إذا تأخرت؟", macro: "تمارا بدون رسوم تأخير، وسدادك في الوقت يحافظ على تقريرك الائتماني ويضمن لك استخدام خدماتنا دائمًا 💜 خدمات تمارا متوافقة مع الشريعة الإسلامية في جميع معاملاتها، تحت إشراف لجنة شرعية تشرف على كل العقود والمنتجات قبل إطلاقها. اعرف أكثر: https://tamara.co/ar-sa/shariah-compliance" },
  { id: 11, comment: "وين ألقى أكواد الخصم والعروض القوية حقتكم؟", macro: "يا هلا 💜 ادخل على خانة \"عروض\" واكتشف خصومات حصرية مع متاجرك اللي تحبها" },
  { id: 12, comment: "لي أسبوع محد رد علي بخصوص مشكلتي والطلب معلق!", macro: "ولا يهمك، بنرفع الموضوع للفريق المختص عشان تنحل مشكلتك بسرعة⚡💜. تطمّن، فريقنا متابع كل التفاصيل وبيتم حلها بالشكل اللي يرضيك 💜" },
  { id: 13, comment: "أنا صاحب متجر إلكتروني وأبي أفعل تمارا عندي لعملائي، كيف الطريقة؟", macro: "نرحّب بالشراكات، تقدر نضم كتاجر من خلال الرابط التالي: https://partners.tamara.co/ 💜" },
  { id: 14, comment: "أفضل تطبيق دفع! فكيتوا لي أزمة وصرت أشتري كل اللي نفسي فيه.", macro: "شكرًا لك 💜 رضاك أكبر دافع نستمر ونخليك تحقق حلمك بيدك ✨ 🫰🏻💜" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Screen = "welcome" | "game" | "done";

function TamaraChallenge() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [playerName, setPlayerName] = useState("");
  const [order, setOrder] = useState<number[]>(() => shuffle(PAIRS.map((p) => p.id)));
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [wrongIds, setWrongIds] = useState<Set<number>>(new Set());
  const [justCorrect, setJustCorrect] = useState(false);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [triedThisRound, setTriedThisRound] = useState(false);

  const total = PAIRS.length;
  const currentPair = useMemo(
    () => PAIRS.find((p) => p.id === order[index])!,
    [order, index]
  );
  // Macro choices: shuffled once per question, includes correct + 3 distractors
  const macroOptions = useMemo(() => {
    const correct = currentPair;
    const distractors = shuffle(PAIRS.filter((p) => p.id !== correct.id)).slice(0, 3);
    return shuffle([correct, ...distractors]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPair.id]);

  const start = (name?: string) => {
    if (name !== undefined) setPlayerName(name);
    setOrder(shuffle(PAIRS.map((p) => p.id)));
    setIndex(0);
    setAttempts(0);
    setFirstTryCorrect(0);
    setWrongIds(new Set());
    setTriedThisRound(false);
    setScreen("game");
  };

  const handleSelect = (macroId: number) => {
    if (justCorrect) return;
    setAttempts((a) => a + 1);
    if (macroId === currentPair.id) {
      if (!triedThisRound) setFirstTryCorrect((n) => n + 1);
      setJustCorrect(true);
      // mini confetti burst
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#7c3aed", "#a855f7", "#ec4899", "#ffffff"],
      });
      setTimeout(() => {
        setJustCorrect(false);
        setTriedThisRound(false);
        setWrongIds(new Set());
        if (index + 1 >= total) {
          setScreen("done");
        } else {
          setIndex((i) => i + 1);
        }
      }, 850);
    } else {
      setTriedThisRound(true);
      setWrongIds((s) => new Set(s).add(macroId));
      setShakeId(macroId);
      setTimeout(() => setShakeId(null), 500);
    }
  };

  // Done screen confetti
  useEffect(() => {
    if (screen !== "done") return;
    const end = Date.now() + 1500;
    const colors = ["#7c3aed", "#a855f7", "#ec4899", "#ffffff", "#fde68a"];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [screen]);

  if (screen === "welcome") return <Welcome onStart={start} />;
  if (screen === "done")
    return <Done name={playerName} score={firstTryCorrect} total={total} attempts={attempts} onRetry={() => start(playerName)} />;

  return (
    <main className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        <Header index={index} total={total} firstTryCorrect={firstTryCorrect} name={playerName} />

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Comment card (draggable) */}
          <div className="order-1">
            <h2 className="mb-3 text-sm font-bold text-muted-foreground">تعليق العميل</h2>
            <article
              draggable
              onDragStart={(e) => {
                setDragging(true);
                e.dataTransfer.setData("text/plain", String(currentPair.id));
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragEnd={() => setDragging(false)}
              key={currentPair.id}
              className={`animate-pop-in cursor-grab active:cursor-grabbing rounded-3xl bg-card p-6 sm:p-7 ring-1 ring-border select-none transition-transform ${
                dragging ? "opacity-70 scale-[0.98]" : "hover:-translate-y-0.5"
              }`}
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground font-bold">
                  ع
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">عميل</p>
                  <p className="text-sm font-bold text-foreground">سؤال #{index + 1}</p>
                </div>
                <span className="ms-auto rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  اسحب للرد
                </span>
              </div>
              <p className="text-base sm:text-lg leading-relaxed text-foreground">
                {currentPair.comment}
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                💡 على الجوال: اضغط على الرد الصحيح مباشرة.
              </p>
            </article>
          </div>

          {/* Macro options (drop targets / clickable) */}
          <div className="order-2">
            <h2 className="mb-3 text-sm font-bold text-muted-foreground">
              الردود الجاهزة (الماكرو) — اختر الأنسب
            </h2>
            <ul className="space-y-3">
              {macroOptions.map((opt) => {
                const isWrong = wrongIds.has(opt.id);
                const isCorrectFlash = justCorrect && opt.id === currentPair.id;
                const isHover = hoverId === opt.id && dragging;
                return (
                  <li key={opt.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(opt.id)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        if (hoverId !== opt.id) setHoverId(opt.id);
                      }}
                      onDragLeave={() => setHoverId((h) => (h === opt.id ? null : h))}
                      onDrop={(e) => {
                        e.preventDefault();
                        setHoverId(null);
                        setDragging(false);
                        handleSelect(opt.id);
                      }}
                      disabled={isWrong || justCorrect}
                      className={`group block w-full text-right rounded-2xl p-4 sm:p-5 ring-1 transition-all
                        ${
                          isCorrectFlash
                            ? "ring-2 ring-[var(--success)] bg-[color-mix(in_oklab,var(--success)_15%,white)]"
                            : isWrong
                            ? "ring-destructive/40 bg-destructive/5 opacity-60"
                            : isHover
                            ? "ring-2 ring-primary bg-primary/5 scale-[1.01]"
                            : "ring-border bg-card hover:ring-primary/40 hover:-translate-y-0.5"
                        }
                        ${shakeId === opt.id ? "animate-shake" : ""}
                      `}
                      style={{ boxShadow: "var(--shadow-card)" }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black
                            ${
                              isCorrectFlash
                                ? "bg-[var(--success)] text-white"
                                : isWrong
                                ? "bg-destructive text-white"
                                : "bg-primary text-primary-foreground"
                            }`}
                        >
                          {isCorrectFlash ? "✓" : isWrong ? "✕" : "↩"}
                        </span>
                        <p className="min-w-0 text-sm sm:text-[15px] leading-relaxed text-foreground">
                          {opt.macro}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}

function Header({
  index,
  total,
  firstTryCorrect,
}: {
  index: number;
  total: number;
  firstTryCorrect: number;
}) {
  const pct = (index / total) * 100;
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <TamaraLogo className="h-9 w-9 shrink-0" />
        <div className="min-w-0">
          <p className="truncate text-base font-black text-foreground sm:text-lg">
            تحدي خدمة العملاء
          </p>
          <p className="truncate text-xs text-muted-foreground">تدريب تفاعلي — تمارا</p>
        </div>
      </div>
      <div className="col-span-2 sm:col-auto sm:min-w-[260px]">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
          <span>
            {index + 1} / {total}
          </span>
          <span className="text-primary">صحيحة من أول محاولة: {firstTryCorrect}</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: "var(--gradient-hero)" }}
          />
        </div>
      </div>
    </header>
  );
}

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <main
      className="relative grid min-h-screen place-items-center overflow-hidden px-4"
      style={{ background: "var(--gradient-soft)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl opacity-50"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-[28px] bg-card p-7 sm:p-10 text-center ring-1 ring-border"
        style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div className="mx-auto mb-5 flex items-center justify-center gap-2">
          <TamaraLogo className="h-12 w-12" />
          <span className="text-2xl font-black tracking-tight text-foreground">tamara.</span>
        </div>
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          تدريب فريق خدمة العملاء
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-black leading-tight text-foreground">
          تحدي خدمة العملاء
        </h1>
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground">
          أهلاً بك في تحدي خدمة العملاء! قم بسحب كل تعليق وإسقاطه على الماكرو (الرد)
          الصحيح والمناسب له.
        </p>
        <ul className="mt-6 grid gap-3 text-right text-sm sm:grid-cols-3">
          <Feature icon="🎯" title="14 موقف" desc="تعليقات عملاء حقيقية" />
          <Feature icon="⚡" title="ردود فورية" desc="تغذية راجعة لحظية" />
          <Feature icon="🏆" title="شهادة" desc="عند إكمال التحدي" />
        </ul>
        <button
          onClick={onStart}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-black text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}
        >
          ابدأ التحدي ←
        </button>
      </div>
    </main>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <li className="rounded-2xl bg-secondary p-3 ring-1 ring-border">
      <div className="text-xl">{icon}</div>
      <p className="mt-1 text-sm font-black text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </li>
  );
}

function Done({
  score,
  total,
  attempts,
  onRetry,
}: {
  score: number;
  total: number;
  attempts: number;
  onRetry: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const message =
    pct === 100
      ? "أداء مثالي! أنت سفير حقيقي لخدمة عملاء تمارا 💜"
      : pct >= 80
      ? "أداء ممتاز! جاهز للتعامل مع العملاء بثقة."
      : pct >= 60
      ? "أداء جيد، راجع بعض الردود وحاول مرة أخرى."
      : "لا بأس، التدريب يصنع الفرق — جرّب مرة أخرى.";

  const certRef = useRef<HTMLDivElement>(null);
  const today = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const certId = useMemo(
    () => "TM-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    []
  );

  return (
    <main className="min-h-screen px-4 py-10" style={{ background: "var(--gradient-soft)" }}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 rounded-3xl bg-card p-6 sm:p-8 text-center ring-1 ring-border"
          style={{ boxShadow: "var(--shadow-elegant)" }}>
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full text-3xl text-primary-foreground"
            style={{ background: "var(--gradient-hero)" }}>
            🏆
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-black text-foreground">
            أحسنت! أكملت التحدي
          </h2>
          <p className="mt-2 text-muted-foreground">{message}</p>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <Stat label="النتيجة" value={`${pct}%`} highlight />
            <Stat label="صحيحة من أول مرة" value={`${score}/${total}`} />
            <Stat label="إجمالي المحاولات" value={String(attempts)} />
          </div>
        </div>

        {/* Certificate */}
        <div
          ref={certRef}
          className="relative overflow-hidden rounded-[28px] bg-card p-6 sm:p-10 ring-1 ring-border"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{ background: "var(--gradient-hero)" }}
          />
          <div className="absolute inset-3 rounded-[22px] ring-2 ring-primary/30 ring-offset-2 ring-offset-card pointer-events-none" />
          <div className="relative text-center">
            <div className="flex items-center justify-center gap-2">
              <TamaraLogo className="h-10 w-10" />
              <span className="text-xl font-black text-foreground">tamara.</span>
            </div>
            <p className="mt-6 text-xs font-bold tracking-widest text-primary">
              شهادة إتمام
            </p>
            <h3 className="mt-2 text-2xl sm:text-3xl font-black text-foreground">
              تحدي خدمة العملاء
            </h3>
            <p className="mt-6 text-sm text-muted-foreground">تُمنح هذه الشهادة تقديراً لإتمام</p>
            <p className="mt-1 text-lg sm:text-xl font-black text-foreground">
              تدريب الردود الجاهزة (الماكرو) لخدمة عملاء تمارا
            </p>
            <div className="mx-auto my-6 h-px w-32 bg-border" />
            <div className="grid grid-cols-3 gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-muted-foreground">النتيجة</p>
                <p className="mt-1 text-2xl font-black text-primary">{pct}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">التاريخ</p>
                <p className="mt-1 font-bold text-foreground">{today}</p>
              </div>
              <div>
                <p className="text-muted-foreground">رقم الشهادة</p>
                <p className="mt-1 font-mono font-bold text-foreground">{certId}</p>
              </div>
            </div>
            <p className="mt-8 text-[11px] text-muted-foreground">
              أكاديمية تمارا لخدمة العملاء — Tamara Customer Care Academy
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black text-primary-foreground transition-transform hover:scale-[1.02]"
            style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}
          >
            إعادة المحاولة
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-card px-6 py-3 text-sm font-black text-foreground ring-1 ring-border hover:bg-secondary"
          >
            طباعة الشهادة
          </button>
        </div>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-3 ring-1 ${
        highlight ? "ring-primary/30 bg-primary/5" : "ring-border bg-secondary"
      }`}
    >
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-lg font-black ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TamaraLogo({ className }: { className?: string }) {
  // Stylized "T" mark in Tamara purple gradient
  return (
    <div
      className={`grid place-items-center rounded-2xl text-primary-foreground font-black ${className ?? ""}`}
      style={{ background: "var(--gradient-hero)" }}
      aria-label="Tamara"
    >
      <span className="text-lg leading-none">t.</span>
    </div>
  );
}
