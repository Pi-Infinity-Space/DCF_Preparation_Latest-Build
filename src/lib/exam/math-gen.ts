import { pick, shuffle } from "@/lib/utils";
import type { Question, Skill, Tier } from "./types";

type Built = {
  stem: string;
  correct: string;
  traps: string[];
  skill: Skill;
  explanation: string;
};

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function simplifyFrac(n: number, d: number): string {
  const g = gcd(n, d);
  n /= g;
  d /= g;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  if (d === 1) return String(n);
  return `${n}/${d}`;
}

function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choice<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function nOptions(correct: string, traps: string[]): [string, string, string, string] {
  const seen = new Set<string>();
  const pool: string[] = [];
  for (const x of [correct, ...traps]) {
    if (!seen.has(x)) {
      seen.add(x);
      pool.push(x);
    }
  }
  let k = 1;
  while (pool.length < 4 && k < 40) {
    const n = Number(correct);
    const cand = Number.isFinite(n) ? String(n + (k % 2 === 0 ? k : -k)) : `${correct}′${k}`;
    if (!seen.has(cand)) {
      seen.add(cand);
      pool.push(cand);
    }
    k++;
  }
  return pool.slice(0, 4) as [string, string, string, string];
}

function assemble(
  id: string,
  difficulty: Tier,
  built: Built,
): Question {
  const opts = nOptions(built.correct, built.traps);
  const shuffled = shuffle(opts.slice()) as [string, string, string, string];
  const correctIndex = shuffled.indexOf(built.correct) as 0 | 1 | 2 | 3;
  return {
    id,
    subject: "maths",
    difficulty,
    skill: built.skill,
    stem: built.stem,
    options: shuffled,
    correctIndex,
    explanation: built.explanation,
  };
}

const EASY_PCT = [5, 10, 20, 25, 40, 50] as const;

function easyPercent(): Built {
  const p = choice(EASY_PCT);
  const base = choice([40, 60, 80, 120, 160, 200, 240, 250, 300, 400, 500]);
  const ans = (p * base) / 100;
  return {
    skill: "percentages",
    stem: `What is ${p}% of ${base}?`,
    correct: String(ans),
    traps: [String(p * base), String(base - ans), String(base / p), String(ans * 2)],
    explanation: `${p}% of ${base} = (${p}/${100}) × ${base} = ${ans}. The trap ${p * base} forgets to divide by 100.`,
  };
}

function easyLinear(): Built {
  const a = choice([2, 3, 4, 5, 6, 8]);
  const x = randInt(2, 12);
  const b = choice([1, 2, 3, 4, 5, 6, 7, 8]);
  const c = a * x + b;
  return {
    skill: "algebra",
    stem: `Solve for x: ${a}x + ${b} = ${c}`,
    correct: String(x),
    traps: [String(c - b), String(c / a), String(x + b), String(a + b)],
    explanation: `Subtract ${b}: ${a}x = ${c - b}. Divide by ${a}: x = ${x}. A common trap is to add instead of subtract.`,
  };
}

function easyRatio(): Built {
  const a = choice([2, 3, 4, 5]);
  const b = choice([3, 4, 5, 6, 7, 8].filter((n) => n !== a));
  const k = choice([4, 5, 6, 8, 10, 12]);
  const aVal = a * k;
  const bVal = b * k;
  return {
    skill: "ratio",
    stem: `The ratio of boys to girls in a class is ${a}:${b}. If there are ${aVal} boys, how many girls are there?`,
    correct: String(bVal),
    traps: [String(aVal), String(a + b), String(b * aVal), String(aVal - b)],
    explanation: `Each part is ${aVal}/${a} = ${k}. Girls = ${b} × ${k} = ${bVal}. The trap ${b * aVal} multiplies the given count by the other ratio number.`,
  };
}

function easyAverage(): Built {
  for (let n = 0; n < 24; n++) {
    const a = randInt(6, 18);
    const b = randInt(6, 18);
    const c = randInt(6, 18);
    const d = randInt(6, 18);
    const sum = a + b + c + d;
    if (sum % 4 !== 0) continue;
    const mean = sum / 4;
    return {
      skill: "data",
      stem: `The mean of ${a}, ${b}, ${c} and ${d} is`,
      correct: String(mean),
      traps: [String(sum), String(sum / 3), String((a + d) / 2), String(mean + 1)],
      explanation: `Sum = ${sum}. Mean = ${sum}/4 = ${mean}. Dividing by 3 (the number of gaps, not items) is a common trap.`,
    };
  }
  return {
    skill: "data",
    stem: "The mean of 8, 10, 12 and 14 is",
    correct: "11",
    traps: ["44", "10", "12", "9"],
    explanation: "Sum = 44. Mean = 44/4 = 11.",
  };
}

function easySeq(): Built {
  const d = choice([2, 3, 4, 5, 6, 7]);
  const a1 = randInt(3, 15);
  const terms = [a1, a1 + d, a1 + 2 * d, a1 + 3 * d];
  const next = a1 + 4 * d;
  return {
    skill: "sequences",
    stem: `Find the next term: ${terms.join(", ")}, …`,
    correct: String(next),
    traps: [String(next + d), String(a1 * 5), String(terms[3]! + terms[2]!), String(next - 1)],
    explanation: `Common difference is ${d}, so the next term is ${terms[3]} + ${d} = ${next}. Multiplying instead of adding is the trap.`,
  };
}

function easyArea(): Built {
  const l = choice([6, 8, 10, 12, 14, 15, 16]);
  const w = choice([3, 4, 5, 6, 8].filter((n) => n < l));
  const area = l * w;
  const peri = 2 * (l + w);
  return {
    skill: "geometry",
    stem: `A rectangle measures ${l} cm by ${w} cm. What is its area in cm²?`,
    correct: String(area),
    traps: [String(peri), String(l + w), String(l * l), String(2 * l * w)],
    explanation: `Area = length × width = ${l} × ${w} = ${area}. ${peri} is the perimeter — the classic trap.`,
  };
}

function easyDice(): Built {
  const kind = choice(["even", "odd", "prime", "greater than 4"] as const);
  const map = {
    even: { ans: 3, label: "an even number" },
    odd: { ans: 3, label: "an odd number" },
    prime: { ans: 3, label: "a prime number" },
    "greater than 4": { ans: 2, label: "a number greater than 4" },
  };
  const { ans, label } = map[kind];
  return {
    skill: "probability",
    stem: `A fair six-sided die is rolled once. What is the probability of getting ${label}?`,
    correct: simplifyFrac(ans, 6),
    traps: [simplifyFrac(ans, 5), String(ans), simplifyFrac(1, 6), simplifyFrac(ans, 12)],
    explanation: `Favourable outcomes = ${ans} out of 6, so P = ${simplifyFrac(ans, 6)}. Writing just ${ans} forgets that probability is a fraction of the sample space.`,
  };
}

function easyFraction(): Built {
  const n = choice([1, 2, 3]);
  const d = choice([2, 3, 4, 5, 8].filter((x) => x > n));
  const whole = d * choice([6, 8, 10, 12, 15, 20]);
  const ans = (n * whole) / d;
  return {
    skill: "ratio",
    stem: `What is ${n}/${d} of ${whole}?`,
    correct: String(ans),
    traps: [String(whole / n), String(whole - n), String(n * whole), String(whole / d)],
    explanation: `${n}/${d} of ${whole} = ${n} × (${whole}/${d}) = ${n} × ${whole / d} = ${ans}.`,
  };
}

function easySpeed(): Built {
  const s = choice([20, 30, 40, 50, 60, 80]);
  const t = choice([2, 3, 4, 5, 6]);
  const d = s * t;
  const ask = choice(["distance", "time", "speed"] as const);
  if (ask === "distance") {
    return {
      skill: "word-problems",
      stem: `A bus travels at ${s} km/h for ${t} hours. How far does it go?`,
      correct: `${d} km`,
      traps: [`${s + t} km`, `${s * t * 2} km`, `${d / 2} km`, `${s} km`],
      explanation: `Distance = speed × time = ${s} × ${t} = ${d} km. Adding speed and time is the careless trap.`,
    };
  }
  if (ask === "time") {
    return {
      skill: "word-problems",
      stem: `A car covers ${d} km at a steady ${s} km/h. How many hours does the journey take?`,
      correct: String(t),
      traps: [String(d - s), String(s / d), String(t * 2), String(d + s)],
      explanation: `Time = distance / speed = ${d}/${s} = ${t} hours.`,
    };
  }
  return {
    skill: "word-problems",
    stem: `A cyclist covers ${d} km in ${t} hours at a constant speed. What is that speed?`,
    correct: `${s} km/h`,
    traps: [`${d * t} km/h`, `${d + t} km/h`, `${t} km/h`, `${d / 2} km/h`],
    explanation: `Speed = distance / time = ${d}/${t} = ${s} km/h.`,
  };
}

function easyOrder(): Built {
  const a = choice([2, 3, 4]);
  const b = choice([5, 6, 8]);
  const c = choice([2, 3, 4]);
  const correct = a + b * c;
  const leftToRight = (a + b) * c;
  return {
    skill: "algebra",
    stem: `Evaluate: ${a} + ${b} × ${c}`,
    correct: String(correct),
    traps: [String(leftToRight), String(a * b + c), String(a + b + c), String(b * c)],
    explanation: `Multiplication before addition: ${b} × ${c} = ${b * c}, then + ${a} = ${correct}. ${leftToRight} is the left-to-right trap.`,
  };
}

function easyAngle(): Built {
  const x = choice([20, 30, 35, 40, 45, 50, 55, 60, 70]);
  const ans = 180 - x;
  return {
    skill: "geometry",
    stem: `Two angles on a straight line measure x° and ${x}°. What is x?`,
    correct: String(ans),
    traps: [String(90 - x), String(180 + x), String(360 - x), String(x)],
    explanation: `Angles on a straight line sum to 180°, so x = 180 − ${x} = ${ans}. Subtracting from 90° confuses this with a right angle.`,
  };
}

function easySimpleInterest(): Built {
  const p = choice([200, 400, 500, 800, 1000, 1200]);
  const r = choice([5, 10, 20, 25]);
  const t = choice([1, 2, 4]);
  const i = (p * r * t) / 100;
  return {
    skill: "percentages",
    stem: `Find the simple interest on ₦${p} at ${r}% per year for ${t} year${t === 1 ? "" : "s"}.`,
    correct: `₦${i}`,
    traps: [`₦${p + i}`, `₦${(p * r) / 100}`, `₦${p * r * t}`, `₦${i * 2}`],
    explanation: `I = PRT/100 = ${p}×${r}×${t}/100 = ₦${i}. ₦${p + i} is the amount, not the interest.`,
  };
}

const EASY = [
  easyPercent,
  easyLinear,
  easyRatio,
  easyAverage,
  easySeq,
  easyArea,
  easyDice,
  easyFraction,
  easySpeed,
  easyOrder,
  easyAngle,
  easySimpleInterest,
];

function hardSimul(): Built {
  const x = randInt(2, 8);
  const y = randInt(2, 8);
  const a1 = choice([1, 2, 3]);
  const b1 = choice([1, 2, 3]);
  const a2 = choice([1, 2, 4]);
  const b2 = a2 === a1 ? b1 + 1 : choice([1, 2, 3, 4]);
  const c1 = a1 * x + b1 * y;
  const c2 = a2 * x + b2 * y;
  return {
    skill: "algebra",
    stem: `Solve the pair: ${a1}x + ${b1}y = ${c1} and ${a2}x + ${b2}y = ${c2}. What is x + y?`,
    correct: String(x + y),
    traps: [String(x), String(y), String(x * y), String(c1 + c2)],
    explanation: `The unique solution is x = ${x}, y = ${y}, so x + y = ${x + y}. Reporting only x or only y is the incomplete-read trap.`,
  };
}

function hardWork(): Built {
  const a = choice([6, 8, 10, 12]);
  const b = choice([4, 5, 6, 8, 15].filter((n) => n !== a));
  const rate = 1 / a + 1 / b;
  const together = 1 / rate;
  const nice = Number.isInteger(together) ? String(together) : simplifyFrac(a * b, b + a);
  const hoursWord = Number.isInteger(together)
    ? `${together} hours`
    : `${nice} hours`;
  return {
    skill: "word-problems",
    stem: `Ama can finish a job in ${a} hours and Kwame can finish the same job in ${b} hours. How long do they take working together?`,
    correct: hoursWord,
    traps: [`${a + b} hours`, `${Math.abs(a - b)} hours`, `${(a + b) / 2} hours`, `${a * b} hours`],
    explanation: `Combined rate = 1/${a} + 1/${b} = ${simplifyFrac(a + b, a * b)}. Time = ${hoursWord}. Averaging the two times is the trap.`,
  };
}

function hardReversePct(): Built {
  const p = choice([10, 20, 25, 50]);
  const original = choice([80, 120, 160, 200, 240, 400]);
  const now = original * (1 + p / 100);
  return {
    skill: "percentages",
    stem: `A price increased by ${p}% and is now ₦${now}. What was the original price?`,
    correct: `₦${original}`,
    traps: [`₦${now - (now * p) / 100}`, `₦${now - p}`, `₦${now * (1 - p / 100)}`, `₦${now / (p / 100)}`],
    explanation: `Let original be x. x × (1 + ${p}/100) = ${now}, so x = ${now} / ${1 + p / 100} = ${original}. Subtracting ${p}% of the new price is the trap.`,
  };
}

function hardWithoutReplacement(): Built {
  const red = choice([3, 4, 5]);
  const blue = choice([4, 5, 6, 7]);
  const total = red + blue;
  const num = red * (red - 1);
  const den = total * (total - 1);
  const ans = simplifyFrac(num, den);
  const withRep = simplifyFrac(red * red, total * total);
  return {
    skill: "probability",
    stem: `A bag holds ${red} red and ${blue} blue counters. Two counters are drawn at random without replacement. What is the probability both are red?`,
    correct: ans,
    traps: [withRep, simplifyFrac(red, total), simplifyFrac(2, total), simplifyFrac(red, total * 2)],
    explanation: `P = (${red}/${total}) × (${red - 1}/${total - 1}) = ${ans}. ${withRep} is the with-replacement trap.`,
  };
}

function hardIdentity(): Built {
  const k = choice([3, 4, 5, 6]);
  const sq = k * k - 2;
  return {
    skill: "identities",
    stem: `If x + 1/x = ${k}, what is x² + 1/x²?`,
    correct: String(sq),
    traps: [String(k * k), String(k * k + 2), String(2 * k), String(k * 2 - 2)],
    explanation: `(x + 1/x)² = x² + 2 + 1/x², so x² + 1/x² = ${k}² − 2 = ${sq}. Forgetting to subtract 2 gives ${k * k}.`,
  };
}

function hardQuadraticSeq(): Built {
  const a = choice([1, 2]);
  const b = choice([1, 2, 3]);
  const c = choice([1, 2, 3]);
  const term = (n: number) => a * n * n + b * n + c;
  const shown = [1, 2, 3, 4].map(term);
  const next = term(5);
  return {
    skill: "sequences",
    stem: `The first four terms of a sequence are ${shown.join(", ")}. The nth term is ${a === 1 ? "" : a}n² ${b === 1 ? "+ n" : `+ ${b}n`} + ${c}. What is the 5th term?`,
    correct: String(next),
    traps: [String(shown[3]! + (shown[3]! - shown[2]!)), String(term(4) * 2), String(a * 25), String(next + b)],
    explanation: `t₅ = ${a}(25) + ${b}(5) + ${c} = ${next}. Extending the first differences as if the sequence were linear is the trap.`,
  };
}

function hardMixture(): Built {
  for (let n = 0; n < 24; n++) {
    const a = choice([2, 3, 4]);
    const b = choice([1, 2, 3].filter((x) => x !== a));
    const total = choice([24, 30, 36, 48]);
    const part = total / (a + b);
    if (!Number.isInteger(part)) continue;
    const first = a * part;
    return {
      skill: "ratio",
      stem: `A mixture is made in the ratio ${a}:${b}. If the total mass is ${total} kg, what is the mass of the larger part?`,
      correct: `${Math.max(first, total - first)} kg`,
      traps: [`${Math.min(first, total - first)} kg`, `${a + b} kg`, `${total / a} kg`, `${a * b} kg`],
      explanation: `Parts = ${a + b}, each = ${part} kg. Larger part = ${Math.max(a, b)} × ${part} = ${Math.max(first, total - first)} kg. Giving the smaller part is the trap.`,
    };
  }
  return {
    skill: "ratio",
    stem: "A mixture is made in the ratio 3:1. If the total mass is 24 kg, what is the mass of the larger part?",
    correct: "18 kg",
    traps: ["6 kg", "4 kg", "8 kg", "3 kg"],
    explanation: "Parts = 4, each = 6 kg. Larger part = 18 kg.",
  };
}

function hardCompound(): Built {
  const p = choice([200, 400, 500, 1000]);
  const r = choice([10, 20]);
  const amount = p * (1 + r / 100) * (1 + r / 100);
  const simple = p + (p * r * 2) / 100;
  return {
    skill: "percentages",
    stem: `₦${p} is invested for 2 years at ${r}% per year, compounded annually. What is the amount at the end of 2 years?`,
    correct: `₦${amount}`,
    traps: [`₦${simple}`, `₦${p * (1 + r / 100)}`, `₦${p + r}`, `₦${p * r}`],
    explanation: `Amount = ${p} × (1.${r === 10 ? "1" : "2"})² = ₦${amount}. ₦${simple} is simple interest over 2 years — the trap.`,
  };
}

function hardInequality(): Built {
  for (let n = 0; n < 24; n++) {
    const a = choice([2, 3, 4, 5]);
    const k = choice([6, 8, 9, 10, 12, 15, 16]);
    if (k % a !== 0) continue;
    const bound = k / a;
    if (bound <= 1) continue;
    return {
      skill: "algebra",
      stem: `Find the largest integer x that satisfies ${a}x < ${k}.`,
      correct: String(bound - 1),
      traps: [String(bound), String(bound + 1), String(k - a), String(a)],
      explanation: `x < ${bound}, so the largest integer is ${bound - 1}. Taking x = ${bound} ignores that the inequality is strict.`,
    };
  }
  return {
    skill: "algebra",
    stem: "Find the largest integer x that satisfies 3x < 12.",
    correct: "3",
    traps: ["4", "5", "9", "2"],
    explanation: "x < 4, so the largest integer is 3.",
  };
}

function hardTwoPeople(): Built {
  const s1 = choice([30, 40, 50, 60]);
  const s2 = choice([20, 30, 40, 50].filter((n) => n !== s1));
  const t = choice([2, 3, 4]);
  const gap = Math.abs(s1 - s2) * t;
  return {
    skill: "word-problems",
    stem: `Two cyclists leave the same point at the same time in opposite directions at ${s1} km/h and ${s2} km/h. How far apart are they after ${t} hours?`,
    correct: `${(s1 + s2) * t} km`,
    traps: [`${gap} km`, `${s1 * t} km`, `${(s1 + s2) / t} km`, `${s1 + s2} km`],
    explanation: `Opposite directions: relative speed = ${s1 + s2} km/h. Distance = ${s1 + s2} × ${t} = ${(s1 + s2) * t} km. ${gap} km is the same-direction trap.`,
  };
}

function hardProfit(): Built {
  const cost = choice([200, 250, 400, 500, 800]);
  const p = choice([10, 20, 25, 50]);
  const sp = cost * (1 + p / 100);
  return {
    skill: "percentages",
    stem: `An item bought for ₦${cost} is sold at a profit of ${p}%. What is the selling price?`,
    correct: `₦${sp}`,
    traps: [`₦${(cost * p) / 100}`, `₦${cost - (cost * p) / 100}`, `₦${cost + p}`, `₦${cost * p}`],
    explanation: `SP = CP × (1 + ${p}/100) = ₦${sp}. ₦${(cost * p) / 100} is the profit, not the selling price.`,
  };
}

function hardTriangle(): Built {
  const a = choice([3, 5, 6, 8]);
  const b = choice([4, 12, 8, 15].filter((n) => n !== a));
  const scale = choice([2, 3]);
  return {
    skill: "geometry",
    stem: `Two similar triangles have corresponding sides ${a} cm and ${a * scale} cm. If another side of the smaller triangle is ${b} cm, the corresponding side of the larger is`,
    correct: `${b * scale} cm`,
    traps: [`${b + scale} cm`, `${a * b} cm`, `${b * a} cm`, `${(b * scale) / a} cm`],
    explanation: `Scale factor = ${scale}. Corresponding side = ${b} × ${scale} = ${b * scale} cm. Adding the scale factor is the trap.`,
  };
}

function hardData(): Built {
  const w = [12, 15, 18, 21, 24];
  const shift = randInt(0, 4);
  const vals = w.map((n) => n + shift * 2);
  const median = vals[2]!;
  const mean = vals.reduce((s, n) => s + n, 0) / 5;
  return {
    skill: "data",
    stem: `Five test scores: ${vals.join(", ")}. What is the median?`,
    correct: String(median),
    traps: [String(mean), String(vals[4]! - vals[0]!), String(vals[0]!), String((vals[0]! + vals[4]!) / 2)],
    explanation: `Ordered already, the middle (3rd) value is ${median}. ${mean} is the mean — a neighbouring-concept trap.`,
  };
}

const HARD = [
  hardSimul,
  hardWork,
  hardReversePct,
  hardWithoutReplacement,
  hardIdentity,
  hardQuadraticSeq,
  hardMixture,
  hardCompound,
  hardInequality,
  hardTwoPeople,
  hardProfit,
  hardTriangle,
  hardData,
];

function diffAtLeast(): Built {
  const n = choice([4, 5, 6]);
  const pFail = 1 / 2;
  const none = Math.pow(pFail, n);
  const atLeast = 1 - none;
  const frac = simplifyFrac(Math.round(atLeast * 2 ** n), 2 ** n);
  return {
    skill: "probability",
    stem: `A fair coin is tossed ${n} times. What is the probability of getting at least one head?`,
    correct: frac,
    traps: [simplifyFrac(n, 2 ** n), simplifyFrac(1, 2), simplifyFrac(n, 2 * n), "1"],
    explanation: `P(at least one) = 1 − P(no heads) = 1 − (1/2)${toSup(n)} = ${frac}. Counting n/2^n counts exactly the single-head cases and misses the rest.`,
  };
}

function toSup(n: number) {
  const map: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶" };
  return String(n)
    .split("")
    .map((d) => map[d] ?? d)
    .join("");
}

function diffFunction(): Built {
  const k = choice([2, 3, 4, 5]);
  const x = choice([3, 4, 5, 6, 8]);
  return {
    skill: "functions",
    stem: `A function satisfies f(x + y) = f(x) + f(y) for all real x, y, and f(1) = ${k}. What is f(${x})?`,
    correct: String(k * x),
    traps: [String(k + x), String(k * k), String(x), String(k ** x)],
    explanation: `Additive functions of this form on the reals (in exam practice) are f(t) = ${k}t, so f(${x}) = ${k * x}. Adding ${k}+${x} treats f as a translation.`,
  };
}

function diffMod(): Built {
  const n = choice([5, 6, 7, 8, 9]);
  const m = 9;
  const rem = n % m;
  return {
    skill: "number-theory",
    stem: `What is the remainder when ${n}${toSup(5)} is divided by 9? (Hint: a number and the sum of its digits share the same remainder mod 9; also 10 ≡ 1 mod 9.)`,
    correct: String((rem ** 5) % 9 || (rem === 0 ? 0 : (rem ** 5) % 9)),
    traps: [String(n % 9), String(5), String(9), String((n * 5) % 9)],
    explanation: `${n} ≡ ${rem} (mod 9), so ${n}⁵ ≡ ${rem}⁵ ≡ ${(rem ** 5) % 9} (mod 9). Computing ${n}%9 and stopping is the trap.`,
  };
}

function diffPigeon(): Built {
  const boxes = choice([7, 12, 30, 31]);
  const label =
    boxes === 7
      ? "days of the week"
      : boxes === 12
        ? "months of the year"
        : boxes === 30
          ? "days in April"
          : "days in July";
  const people = boxes + 1;
  return {
    skill: "reasoning",
    stem: `There are ${people} students, and each was born on one of the ${boxes} ${label}. What is the smallest number that must share the same ${boxes === 7 ? "weekday" : boxes === 12 ? "birth month" : "day of the month"}?`,
    correct: "2",
    traps: [String(people), String(boxes), "1", String(people - boxes)],
    explanation: `Pigeonhole principle: ${people} pigeons into ${boxes} holes ⇒ at least one hole has 2. The trap is to answer ${boxes} or ${people}.`,
  };
}

function diffCircle(): Built {
  const r = choice([5, 6, 8, 10, 13]);
  const d = 2 * r;
  return {
    skill: "geometry",
    stem: `A triangle is inscribed in a circle of radius ${r} cm so that one side of the triangle is a diameter. What is the angle opposite that diameter?`,
    correct: "90°",
    traps: ["45°", "60°", "180°", `${d}°`],
    explanation: `Angle in a semicircle is a right angle (Thales). 45° is the isosceles-trap if someone halves 90°.`,
  };
}

function diffSquares(): Built {
  const n = choice([48, 50, 98, 99, 102, 199]);
  const a = n + 2;
  const b = n - 2;
  // (n+2)(n-2) = n^2 - 4
  const ans = n * n - 4;
  return {
    skill: "identities",
    stem: `Compute ${a} × ${b}.`,
    correct: String(ans),
    traps: [String(n * n), String(a * b + 4), String((n + 2) * n), String(n * n + 4)],
    explanation: `${a} × ${b} = (n+2)(n−2) = n² − 4 with n = ${n}, so ${n * n} − 4 = ${ans}. Expanding slowly is possible; the difference-of-squares shortcut is the intended 20-second path.`,
  };
}

function diffQuadraticTrap(): Built {
  const r1 = choice([-3, -2, 2, 3, 4, 5]);
  const r2 = choice([-4, -1, 1, 2, 6].filter((n) => n !== r1));
  const b = -(r1 + r2);
  const c = r1 * r2;
  const bStr = b === 0 ? "" : b > 0 ? ` + ${b}x` : ` − ${-b}x`;
  const cStr = c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${-c}`;
  const sum = r1 + r2;
  return {
    skill: "algebra",
    stem: `The equation x²${bStr}${cStr} = 0 has two real roots. What is the product of the roots?`,
    correct: String(c),
    traps: [String(sum), String(-b), String(r1), String(Math.abs(r1 * r2) + 1)],
    explanation: `For x² − (sum)x + (product) = 0, product = ${c}. ${sum} is the sum of the roots — the neighbouring-formula trap. Do not stop after finding one root.`,
  };
}

function diffSurd(): Built {
  const a = choice([8, 12, 18, 20, 27, 32, 50, 75]);
  const map: Record<number, string> = {
    8: "2√2",
    12: "2√3",
    18: "3√2",
    20: "2√5",
    27: "3√3",
    32: "4√2",
    50: "5√2",
    75: "5√3",
  };
  return {
    skill: "algebra",
    stem: `Simplify √${a}.`,
    correct: map[a]!,
    traps: [`√${a / 2}`, String(a / 2), `√${a} / 2`, `${a}`],
    explanation: `Pull out the largest square factor. √${a} = ${map[a]}. Leaving it unsimplified or halving under the root are the traps.`,
  };
}

function diffCombinatorics(): Built {
  const n = choice([5, 6, 7, 8]);
  const r = choice([2, 3]);
  const fact = (k: number): number => (k <= 1 ? 1 : k * fact(k - 1));
  const nCr = fact(n) / (fact(r) * fact(n - r));
  const nPr = fact(n) / fact(n - r);
  return {
    skill: "number-theory",
    stem: `In how many ways can ${r} students be chosen from a group of ${n} if order does not matter?`,
    correct: String(nCr),
    traps: [String(nPr), String(n * r), String(n + r), String(2 ** r)],
    explanation: `Combinations C(${n},${r}) = ${nCr}. ${nPr} is the permutation count (order matters) — the trap.`,
  };
}

function diffExtraNumber(): Built {
  const speed = choice([40, 50, 60]);
  const hours = choice([3, 4, 5]);
  const decoy = choice([12, 15, 18, 25]);
  const dist = speed * hours;
  return {
    skill: "word-problems",
    stem: `A train travels at ${speed} km/h for ${hours} hours. The train has ${decoy} carriages. How far does it travel?`,
    correct: `${dist} km`,
    traps: [`${dist + decoy} km`, `${speed * decoy} km`, `${hours * decoy} km`, `${dist / decoy} km`],
    explanation: `Distance = ${speed} × ${hours} = ${dist} km. The ${decoy} carriages are irrelevant — inserted to catch skimming.`,
  };
}

function diffExcept(): Built {
  const n = choice([12, 18, 20, 24, 30]);
  const factors: number[] = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) factors.push(i);
  const odd = factors.filter((f) => f % 2 === 1);
  const decoy = factors.find((f) => f % 2 === 0 && f !== n) ?? 2;
  return {
    skill: "number-theory",
    stem: `Which of the following is NOT a factor of ${n}?`,
    correct: String(n + 1),
    traps: [String(odd[odd.length - 1] ?? 1), String(decoy), String(n), String(factors[1] ?? 1)],
    explanation: `${n + 1} does not divide ${n}. Every other listed option does. NOT/except questions punish anyone who picks a true factor.`,
  };
}

function diffSuccessive(): Built {
  const p = 20;
  const original = choice([125, 250, 500]);
  // up 20% then down 20% → 0.8 * 1.2 = 0.96 of original
  const final = original * 0.96;
  const trapSame = original;
  const trapMinus = original * 0.8;
  return {
    skill: "percentages",
    stem: `A price of ₦${original} is increased by ${p}% and then decreased by ${p}%. What is the final price?`,
    correct: `₦${final}`,
    traps: [`₦${trapSame}`, `₦${trapMinus}`, `₦${original * 1.2}`, `₦${original * 0.6}`],
    explanation: `×1.2 then ×0.8 = ×0.96, so ₦${final}. The traps are “they cancel” (₦${trapSame}) and applying only one change.`,
  };
}

function diffComposition(): Built {
  const a = choice([2, 3, 4]);
  const b = choice([1, 2, 5]);
  const x = choice([2, 3, 4, 5]);
  const inner = a * x + b;
  const outer = a * inner + b;
  return {
    skill: "functions",
    stem: `If f(x) = ${a}x + ${b}, what is f(f(${x}))?`,
    correct: String(outer),
    traps: [String(inner), String(a * a * x + b), String(2 * inner), String(a * x + 2 * b)],
    explanation: `f(${x}) = ${inner}, then f(${inner}) = ${a}(${inner})+${b} = ${outer}. Stopping at f(${x}) is the trap.`,
  };
}

const DIFFICULT = [
  diffAtLeast,
  diffFunction,
  diffMod,
  diffPigeon,
  diffCircle,
  diffSquares,
  diffQuadraticTrap,
  diffSurd,
  diffCombinatorics,
  diffExtraNumber,
  diffExcept,
  diffSuccessive,
  diffComposition,
];

const BY_TIER: Record<Tier, Array<() => Built>> = {
  easy: EASY,
  hard: HARD,
  difficult: DIFFICULT,
};

export function generateMathQuestion(difficulty: Tier, used: Set<string>): Question {
  const gens = BY_TIER[difficulty];
  for (let i = 0; i < 80; i++) {
    const gen = pick(gens);
    const built = gen();
    const id = `m|${difficulty}|${built.skill}|${hashStem(built.stem)}`;
    if (!used.has(id)) return assemble(id, difficulty, built);
  }
  const built = pick(gens)();
  const id = `m|${difficulty}|${built.skill}|${hashStem(built.stem)}|r${Math.random().toString(36).slice(2, 7)}`;
  return assemble(id, difficulty, built);
}

function hashStem(stem: string) {
  let h = 2166136261;
  for (let i = 0; i < stem.length; i++) {
    h ^= stem.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export function generateMathMany(difficulty: Tier, count: number, used: Set<string>): Question[] {
  const out: Question[] = [];
  for (let i = 0; i < count; i++) {
    const q = generateMathQuestion(difficulty, used);
    used.add(q.id);
    out.push(q);
  }
  return out;
}
