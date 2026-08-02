import Link from "next/link";
import { rdxCategories } from "@/data/rdxCategories";

export default function SubCategorySidebar({
  selectedCategory,
  selectedSubCategory,
}) {
  const activeCategory =
    rdxCategories.find(
      (category) => category.name === selectedCategory
    ) || rdxCategories[0];

  return (
    <aside className="subcategorySidebar">
      <div className="subcategorySidebarHeader">
        <span>Browse catalogue</span>
        <h2>{activeCategory.name}</h2>
      </div>

      <div className="sidebarCategories">
          
        {rdxCategories
          .filter(
            (category) =>
              category.groups.length > 0 &&
              !["sale", "gift-card", "collections"].includes(
                category.slug
              )
          )
          .map((category) => {
            const isActive =
              category.name === activeCategory.name;

            return (
              <div
                key={category.slug}
                className={`sidebarCategory ${
                  isActive ? "active" : ""
                }`}
              >
                <Link
                  scroll={true}
                  href={`/products?category=${encodeURIComponent(
                    category.name
                  )}`}
                  className="sidebarCategoryTitle"
                >
                  {category.name}
                  <span>→</span>
                </Link>

                {isActive && (
                  <div className="sidebarSubcategories">
                    <Link
                      scroll={true}
                      href={`/products?category=${encodeURIComponent(
                        category.name
                      )}`}
                      className={
                        !selectedSubCategory ? "active" : ""
                      }
                    >
                      All {category.name}
                    </Link>

                    {category.groups.map((group) => (
                      <Link
                        scroll={true}
                        key={group.name}
                        href={`/products?category=${encodeURIComponent(
                          category.name
                        )}&subCategory=${encodeURIComponent(
                          group.name
                        )}`}
                        className={
                          selectedSubCategory === group.name
                            ? "active"
                            : ""
                        }
                      >
                        {group.name}
                        <span>→</span>
                        {/* <span>{group.items.length}</span> */}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </aside>
  );
}