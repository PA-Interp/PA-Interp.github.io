export const site = {
  name: "PAI Lab",
  mission:
    "PAI Lab at MBZUAI, led by Lijie Hu, studies the interpretability of machine learning models, with a focus on large language and multimodal models.",
  affiliation: "Machine Learning Department, MBZUAI",
  location: "Abu Dhabi, UAE",
  contactEmail: "pai.interp@gmail.com",
  sourceRepo: "https://github.com/PA-Interp/PA-Interp.github.io",
  piName: "Lijie Hu",
  piHomepage: "https://lijie-hu.github.io/",
  nav: [
    { label: "Research", href: "/research/" },
    { label: "Publications", href: "/publications/" },
    { label: "Projects", href: "/projects/" },
    { label: "People", href: "/team/" },
    { label: "News", href: "/news/" },
    { label: "Join Us", href: "/join-us/" }
  ]
};

export function withBase(path) {
  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/?$/, "/");
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${cleanPath}`;
}
