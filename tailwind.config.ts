import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{astro,ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        canvas: "var(--canvas)",
        cream: "var(--cream)",
        mist: "var(--mist)",
        sage: "var(--sage)",
        "sage-tint": "var(--sage-tint)",
        "cream-2": "var(--cream-2)",
        ink: { DEFAULT: "var(--ink)", soft: "var(--ink-soft)" },
        muted: { DEFAULT: "var(--muted)", d: "var(--muted-d)" },
        prima: {
          DEFAULT: "var(--prima)",
          l: "var(--prima-l)",
          d: "var(--prima-d)",
          soft: "var(--prima-soft)",
          tint: "var(--prima-tint)",
        },
        coral: {
          DEFAULT: "var(--coral)",
          d: "var(--coral-d)",
          soft: "var(--coral-soft)",
        },
        teal: { DEFAULT: "var(--teal)", d: "var(--teal-d)" },
        line: { DEFAULT: "var(--line)", 2: "var(--line-2)" },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "Inter", "system-ui", "sans-serif"],
        body: ['Inter', "system-ui", "sans-serif"],
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        serif: ['"Fraunces Variable"', "Georgia", "serif"],
      },
      boxShadow: {
        sm: "var(--sh-sm)",
        DEFAULT: "var(--sh)",
        lg: "var(--sh-lg)",
        card: "var(--sh-card)",
        "card-hover": "var(--sh-card-hover)",
      },
      maxWidth: {
        wrap: "1240px",
      },
    },
  },
  plugins: [],
};

export default config;
