const spellingAliases = {
  tshirt: "shirt",
  tshirts: "shirt",
  tee: "shirt",
  tees: "shirt",
  top: "shirt",
  tops: "shirt",
  nikker: "shorts",
  nikkers: "shorts",
  nicker: "shorts",
  nickers: "shorts",
  knicker: "shorts",
  knickers: "shorts",
  pant: "pants",
  trouser: "pants",
  trousers: "pants",
  glove: "glove",
  mitt: "mitt",
  colour: "color",
  gray: "grey",
  maroon: "burgundy",
  crimson: "red",
  scarlet: "red",
  navy: "blue",
  cobalt: "blue",
  charcoal: "grey",
  graphite: "grey",
  silver: "grey",
  lime: "green",
  forest: "green",
  emerald: "green",
  plum: "purple",
};

const pluralAliases = {
  gloves: "glove",
  mitts: "mitt",
  guards: "guard",
  shirts: "shirt",
  tops: "top",
  belts: "belt",
  bags: "bag",
  hoodies: "hoodie",
  products: "product",
};

const strictTokens = new Set([
  "shorts",
  "short",
  "shirt",
  "pants",
  "glove",
  "mitt",
  "guard",
  "belt",
  "bag",
  "hoodie",
  "black",
  "white",
  "grey",
  "red",
  "blue",
  "green",
  "purple",
  "orange",
  "yellow",
  "brown",
  "beige",
]);

export function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeToken(token) {
  if (spellingAliases[token]) return spellingAliases[token];
  if (pluralAliases[token]) return pluralAliases[token];
  return token;
}

function editDistance(left, right) {
  if (Math.abs(left.length - right.length) > 2) return 3;
  const previous = Array.from(
    { length: right.length + 1 },
    (_, index) => index,
  );
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = previous[0];
    previous[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const above = previous[rightIndex];
      previous[rightIndex] = Math.min(
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + 1,
        diagonal + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return previous[right.length];
}

function tokenMatchScore(queryToken, candidateToken) {
  if (queryToken === candidateToken) return 20;
  if (
    (queryToken === "shorts" && candidateToken === "short") ||
    (queryToken === "short" && candidateToken === "shorts")
  )
    return 0;
  if (candidateToken.startsWith(queryToken)) return 14;
  if (queryToken.length >= 4 && candidateToken.includes(queryToken)) return 10;
  if (
    queryToken.length >= 4 &&
    !strictTokens.has(queryToken) &&
    editDistance(queryToken, candidateToken) === 1
  )
    return 7;
  return 0;
}

export function rankProducts(products, rawQuery) {
  const normalizedQuery = normalizeSearchText(rawQuery);
  if (!normalizedQuery) return [...products];

  const queryTokens = [
    ...new Set(normalizedQuery.split(" ")?.map(normalizeToken)),
  ];

  return products
    ?.map((product, originalIndex) => {
      const fields = [
        { value: product.name, weight: 8 },
        { value: product.type, weight: 6 },
        { value: product.subCategory, weight: 5 },
        { value: product.category, weight: 4 },
        { value: product.searchTags?.join(" "), weight: 4 },
        { value: product.features?.join(" "), weight: 2 },
        { value: product.summary, weight: 2 },
        { value: product.materials, weight: 1 },
      ]?.map((field) => ({
        ...field,
        normalized: normalizeSearchText(field.value),
      }));

      const searchableTokens = fields.flatMap((field) =>
        field.normalized.split(" ").filter(Boolean)?.map(normalizeToken),
      );
      let score = 0;
      let matchedTokens = 0;

      for (const queryToken of queryTokens) {
        let bestTokenScore = 0;
        for (const field of fields) {
          for (const candidateToken of field.normalized
            .split(" ")
            ?.map(normalizeToken)) {
            bestTokenScore = Math.max(
              bestTokenScore,
              tokenMatchScore(queryToken, candidateToken) * field.weight,
            );
          }
        }
        if (bestTokenScore > 0) {
          matchedTokens += 1;
          score += bestTokenScore;
        }
      }

      if (matchedTokens !== queryTokens.length) return null;

      for (const field of fields) {
        if (field.normalized === normalizedQuery) score += 180 * field.weight;
        else if (field.normalized.startsWith(normalizedQuery))
          score += 70 * field.weight;
        else if (field.normalized.includes(normalizedQuery))
          score += 35 * field.weight;
      }

      return { product, score, originalIndex };
    })
    .filter(Boolean)
    .sort(
      (left, right) =>
        right.score - left.score || left.originalIndex - right.originalIndex,
    )
    ?.map(({ product }) => product);
}
