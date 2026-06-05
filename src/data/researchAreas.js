export const researchAreas = [
  {
    id: "theory",
    title: "Theoretical Foundations of Usable XAI",
    shortTitle: "Foundations",
    question: "When is an explanation provable, useful, and theoretically justified?",
    why:
      "Provable interpretability needs explicit assumptions, guarantees, and visible failure modes before it can guide action.",
    approach:
      "We study stability, faithfulness, controllability, consistency, influence, and evaluation criteria for actionable explanations.",
    tags: ["proof", "faithfulness", "stability", "guarantees"],
    connectsTo: ["large-models", "interactive"]
  },
  {
    id: "large-models",
    title: "Useful XAI in Large Models",
    shortTitle: "Large Models",
    question: "How can we understand and intervene in language, vision, and multimodal models?",
    why:
      "Foundation models are increasingly used as decision systems, but their internal computations and failure modes remain hard to inspect.",
    approach:
      "We develop mechanistic analyses, representation interventions, model editing, unlearning, and steering methods that make model behavior actionable.",
    tags: ["LLM", "MLLM", "circuits", "steering"],
    connectsTo: ["theory", "systems", "science"]
  },
  {
    id: "systems",
    title: "Systems for XAI",
    shortTitle: "Systems",
    question: "What infrastructure makes interpretability scalable, reproducible, and deployable?",
    why:
      "Interpretability becomes actionable only when researchers and practitioners can run, compare, and extend methods in repeatable workflows.",
    approach:
      "We build benchmarks, pipelines, tooling, and service patterns for repeatable explanation workflows and interpretable model monitoring.",
    tags: ["tooling", "benchmarks", "reproducibility", "deployment"],
    connectsTo: ["large-models", "interactive"]
  },
  {
    id: "interactive",
    title: "Interactive XAI",
    shortTitle: "Interaction",
    question: "How should humans query, evaluate, refine, and act on explanations?",
    why:
      "Explanations should support decisions, debugging, and co-adaptation rather than remain static model artifacts.",
    approach:
      "We design human-in-the-loop interfaces, feedback protocols, evaluation tasks, and decision workflows that turn interpretability into action.",
    tags: ["human feedback", "decision support", "interfaces", "evaluation"],
    connectsTo: ["theory", "systems", "science"]
  },
  {
    id: "science",
    title: "XAI for Science",
    shortTitle: "Science",
    question: "How can interpretability support scientific discovery and hypothesis generation?",
    why:
      "Scientific users need explanations that can become evidence, guide experiments, and expose model-supported hypotheses.",
    approach:
      "We apply PAI methods to protein language models, healthcare, autonomous systems, material science, and other discovery settings.",
    tags: ["protein", "healthcare", "discovery", "hypotheses"],
    connectsTo: ["large-models", "interactive"]
  }
];
