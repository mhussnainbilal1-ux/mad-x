import { getCategory, getGroup, getItem } from "./rdxCategories";

export const products = [
  {
    slug: "pro-competition-bjj-gi",
    name: "Pro Competition BJJ Gi",

    category: getCategory("collections").name,

    subCategory: getGroup("collections", "Ranges").name,

    type: getItem("collections", "Ranges", "BJJ Gi"),

    summary:
      "Lightweight pearl-weave gi engineered for competition and private-label programs.",

    materials: "450 GSM pearl weave cotton, ripstop pants",

    moq: "50 pieces",

    lead: "4–6 weeks",

    image:
      "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1400&q=85",

    features: [
      "Pre-shrunk fabric",
      "Reinforced stress points",
      "Custom embroidery and woven labels",
      "Men, women and youth sizing",
    ],
  },

  {
    slug: "elite-rash-guard",
    name: "Elite No-Gi Rash Guard",

    category: getCategory("apparel").name,

    subCategory: getGroup("apparel", "Compression Wear & Shorts").name,

    type: getItem(
      "apparel",
      "Compression Wear & Shorts",
      "Compression Shorts & Pants",
    ),

    summary:
      "Four-way stretch compression rash guard with sublimated graphics and flatlock seams.",

    materials: "Polyester-spandex performance knit",

    moq: "50 pieces",

    lead: "3–5 weeks",

    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=85",

    features: [
      "Full sublimation printing",
      "Flatlock stitching",
      "Silicone waist gripper",
      "Custom packaging",
    ],
  },

  {
    slug: "premium-boxing-gloves",
    name: "Premium Leather Boxing Gloves",

    category: getCategory("boxing").name,

    subCategory: getGroup("boxing", "Boxing Gloves").name,

    type: getItem("boxing", "Boxing Gloves", "Training Gloves"),

    summary:
      "Multi-layer impact protection with genuine or synthetic leather options.",

    materials: "Cowhide or premium synthetic leather",

    moq: "100 pairs",

    lead: "5–7 weeks",

    image:
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1400&q=85",

    features: [
      "Multi-density foam",
      "Attached thumb",
      "Hook-and-loop or lace closure",
      "Custom molds, patches and prints",
    ],
  },

  {
    slug: "mma-training-shorts",
    name: "MMA Training Shorts",

    category: getCategory("mma").name,

    subCategory: getGroup("mma", "Apparel").name,

    type: getItem("mma", "Apparel", "MMA Shorts"),

    summary:
      "Flexible fight shorts designed for grappling, striking and hybrid training.",

    materials: "Micro-stretch polyester with reinforced panels",

    moq: "50 pieces",

    lead: "3–5 weeks",

    image:
      "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1400&q=85",

    features: [
      "Four-way stretch crotch",
      "Secure waistband",
      "Sublimation or screen print",
      "Custom fit and length",
    ],
  },

  {
    slug: "mma-sparring-gloves",
    name: "MMA Sparring Gloves",

    category: getCategory("mma").name,

    subCategory: getGroup("mma", "MMA Gloves").name,

    type: getItem("mma", "MMA Gloves", "Sparring Gloves"),

    summary:
      "Protective open-palm gloves for striking, grappling and sparring sessions.",

    materials: "Cowhide or synthetic leather, molded foam",

    moq: "100 pairs",

    lead: "5–7 weeks",

    image:
      "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1400&q=85",

    features: [
      "Pre-curved padding",
      "Open-palm grip",
      "Adjustable wrist support",
      "Custom colorways",
    ],
  },

  {
    slug: "muay-thai-shin-guards",
    name: "Muay Thai Shin Guards",

    category: getCategory("mma").name,

    subCategory: getGroup("mma", "Protective Gear").name,

    type: getItem("mma", "Protective Gear", "Shin Guards"),

    summary:
      "Anatomical shin protection with secure straps and impact-absorbing foam.",

    materials: "Synthetic or genuine leather, layered foam",

    moq: "100 pairs",

    lead: "5–7 weeks",

    image:
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1400&q=85",

    features: [
      "Raised shin ridge",
      "Instep protection",
      "Reinforced straps",
      "Private-label packaging",
    ],
  },

  {
    slug: "boxing-head-guard",
    name: "Boxing Head Guard",

    category: getCategory("boxing").name,

    subCategory: getGroup("boxing", "Protective Gear").name,

    type: getItem("boxing", "Protective Gear", "Head Gear"),

    summary: "Training headgear with cheek protection and broad visibility.",

    materials: "Leather shell, shock-absorbing foam",

    moq: "100 pieces",

    lead: "5–7 weeks",

    image:
      "https://images.unsplash.com/photo-1517438322307-e67111335449?auto=format&fit=crop&w=1400&q=85",

    features: [
      "Adjustable crown and chin",
      "Cheek protection",
      "Moisture-wicking lining",
      "Custom branding zones",
    ],
  },

  {
    slug: "custom-hand-wraps",
    name: "Custom Hand Wraps",

    category: getCategory("boxing").name,

    subCategory: getGroup("boxing", "Protective Gear").name,

    type: getItem("boxing", "Protective Gear", "Hand Wraps & Inner Gloves"),

    summary:
      "Elastic cotton wraps with branded wrist closures and retail-ready packaging.",

    materials: "Cotton-elastane blend",

    moq: "250 pairs",

    lead: "3–4 weeks",

    image:
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1400&q=85",

    features: [
      "Multiple lengths",
      "Custom woven label",
      "Printed hook-and-loop tab",
      "Individual packaging",
    ],
  },
];

export const categories = [
  "All",
  ...new Set(products.map((product) => product.category)),
];
