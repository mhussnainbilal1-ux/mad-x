import "server-only";

import boxingGlovesProducts from "@/data/boxingGloves.json";
import focusPad from "@/data/boxingFocusPad.json";
import headGaurd from "@/data/boxingHeadGaurd.json";
import shinGuard from "@/data/boxingShinGuard.json";
import punchBags from "@/data/boxingPunchBag.json";
import chestguard from "@/data/boxingChestguard.json";
import shorts from "@/data/boxingshorts.json";
import shirts from "@/data/boxingShirts.json";
import rashguard from "@/data/boxingRashguard.json";
import mmaSparingGloves from "@/data/mmaSparingGloves.json";
import mmaGloves from "@/data/mmaGloves.json";
import mmaGrapplingGloves from "@/data/mmaGrapplingGloves.json";
import mmaShorts from "@/data/mmaShorts.json";
import weightLiftingBelt from "@/data/fitnessWeightLiftingBelt.json";
import fitnessGymGloves from "@/data/fitnessGymGloves.json";
import activewearCompressionTShirts from "@/data/activewearCompressionTShirts.json";
import activewearGymTShirts from "@/data/activewearGymTShirts.json";
import activewearPerformanceTShirts from "@/data/activewearPerformanceTShirts.json";
import activewearSleevelessTrainingShirts from "@/data/activewearSleevelessTrainingShirts.json";
import activewearStringerVests from "@/data/activewearStringerVests.json";
import activewearTankTops from "@/data/activewearTankTops.json";
import activewearCropTops from "@/data/activewearCropTops.json";
import activewearLongSleeveTrainingTops from "@/data/activewearLongSleeveTrainingTops.json";
import activewearHoodies from "@/data/activewearHoodies.json";
import activewearBottoms from "@/data/activewearBottoms.json";
import leatherBikerJackets from "@/data/leatherBikerJackets.json";
import leatherBomberJackets from "@/data/leatherBomberJackets.json";
import bjjProducts from "@/data/bjjProducts.json";
const productCollections = [
  bjjProducts,
  leatherBikerJackets,
  leatherBomberJackets,
  activewearHoodies,
  activewearLongSleeveTrainingTops,
  activewearCropTops,
  activewearTankTops,
  activewearStringerVests,
  activewearSleevelessTrainingShirts,
  activewearPerformanceTShirts,
  activewearGymTShirts,
  activewearCompressionTShirts,
  activewearBottoms,
  weightLiftingBelt,
  fitnessGymGloves,
  mmaSparingGloves,
  mmaGloves,
  mmaGrapplingGloves,
  mmaShorts,
  boxingGlovesProducts,
  focusPad,
  headGaurd,
  shinGuard,
  chestguard,
  shorts,
  shirts,
  rashguard,
  punchBags,
];

export const allProducts = productCollections.flat();

export const previewProducts = productCollections.flatMap((collection) =>
  collection.slice(0, 3),
);

export function isApparelProduct(product) {
  return (
    String(product?.category || "")
      .trim()
      .toLowerCase() === "apparel"
  );
}

export function isBjjProduct(product) {
  return (
    String(product?.category || "")
      .trim()
      .toLowerCase() === "bjj & no-gi"
  );
}

export function isPublicProduct(product) {
  return isApparelProduct(product) || isBjjProduct(product);
}

export const publicProducts = Array.from(
  new Map(
    [...previewProducts, ...allProducts.filter(isPublicProduct)].map(
      (product) => [product.slug, product],
    ),
  ).values(),
);
