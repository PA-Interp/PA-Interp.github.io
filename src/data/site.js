export const site = {
  name: "PAI Lab",
  fullName: "Provable. Actionable. Interpretability.",
  tagline: "Make interpretability provable, actionable, and useful in practice.",
  mission:
    "PAI Lab builds provable methods, actionable evidence, and interpretability tools for large models, science, and human-AI workflows.",
  affiliation: "Machine Learning Department, MBZUAI",
  location: "Abu Dhabi, UAE",
  contactEmail: "pai.interp@gmail.com",
  sourceRepo: "https://github.com/PA-Interp/PA-Interp.github.io",
  piHomepage: "https://lijie-hu.github.io/",
  nav: [
    { label: "Home", href: "/" },
    { label: "Research", href: "/research/" },
    { label: "Publications", href: "/publications/" },
    { label: "Team", href: "/team/" },
    { label: "News", href: "/news/" },
    { label: "Join Us", href: "/join-us/" }
  ]
};

export function withBase(path) {
  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/?$/, "/");
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${cleanPath}`;
}
