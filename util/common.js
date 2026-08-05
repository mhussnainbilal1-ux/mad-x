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
  " Ironclad",
  " Savage",
  " Reign",
  " Berserker",
  " Velocity",
  " Prime",
];

export function getProductSeries(index) {
  return productSeries[index - 1] ?? "";
}