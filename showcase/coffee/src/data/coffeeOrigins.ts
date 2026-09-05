export interface OriginStep {
  label: string;
  value: string;
}

export const ORIGIN_SECTION = {
  eyebrow: "From origin to cup",
  headingLines: ["Traced back to", "one single farm."],
  body: "Every bag names the region it came from and the process it went through — not as a marketing line, but because it changes what's in the cup.",
  image: "/assets/coffee/origin/origin-map.jpg",
};

export const ORIGIN_STEPS: OriginStep[] = [
  { label: "Origin", value: "Yirgacheffe, Ethiopia" },
  { label: "Altitude", value: "1,900–2,200 masl" },
  { label: "Process", value: "Washed, sun-dried on raised beds" },
  { label: "Roast", value: "Light — city roast, 9–10 days rest" },
  { label: "Cup score", value: "87.5 / 100 (Q-grader panel)" },
];
