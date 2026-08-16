const productSeries = [
  "Apex",
  " Vortex",
  " Inferno",
  " Tornado",
  " Race",
  " Brutal",
  " Rampage",
  " Havoc",
  " Onyx",
  " Titan",
  " Rogue",
  " Dominion",
  " Eclipse",
  " Tempest",
  " Nemesis",
  " MADX Sports",
  " Savage",
  " Reign",
  " Berserker",
  " Velocity",
  " Prime",
];

export function getProductSeries(index) {
  return productSeries[index - 1] ?? "";
}
