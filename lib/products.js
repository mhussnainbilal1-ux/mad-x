import boxingGlovesProducts from "@/data/boxingGloves.json";
import focusPad from "@/data/boxingFocusPad.json";
import headGaurd from "@/data/boxingHeadGaurd.json";
import shinGuard from "@/data/boxingShinGuard.json";
import punchBags from "@/data/boxingPunchBag.json"
import chestguard from "@/data/boxingChestguard.json"
import shorts from "@/data/boxingshorts.json"
export const products = [
  ...boxingGlovesProducts,
  ...focusPad,
  ...headGaurd,
  ...shinGuard,
  ...chestguard,
  ...shorts
].concat(punchBags);