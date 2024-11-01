import { type CategoryTree, type SlimCategory, type SlimProduct } from "@/types"
import { mergeCategoriesAndProducts } from "@/utils/helpers/products"
import { deepStrictEqual } from "assert";

console.log("Hi. I'm going to kms")
export const expected: CategoryTree = [
  {
      id: "b341df73-c718-480e-80fc-71be221b6866",
      name: "Base",
      parentCategoryId: null,
      __category: true,
      products: [
          {
              id: "2ec69d50-8ba7-4c66-a06c-e71e40d613ae",
              name: "Test 1",
              hidden: true,
              categoryId: "b341df73-c718-480e-80fc-71be221b6866",
              __product: true
          }
      ],
      children: [
          {
              id: "e0a421c7-892e-437b-85a3-66b3b63f5f8e",
              name: "Child 1",
              parentCategoryId: "b341df73-c718-480e-80fc-71be221b6866",
              __category: true,
              children: [],
              products: []
          },
          {
              id: "cd8b5d44-63ab-4665-a42c-00ef6d036359",
              name: "Child 2",
              parentCategoryId: "b341df73-c718-480e-80fc-71be221b6866",
              __category: true,
              products: [
                {
                  id: "84445c24-a3e2-49a1-9a70-a2c6ccb164d4",
                  name: "Test 2",
                  hidden: true,
                  categoryId: "cd8b5d44-63ab-4665-a42c-00ef6d036359",
                  __product: true
                },
              ],
              children: []
          },
          {
            id: "493dab74-f736-4105-b32e-bf361437166c",
            name: "Child 3",
            parentCategoryId: "b341df73-c718-480e-80fc-71be221b6866",
            __category: true,
            children: [],
            products: []
        },
      ],
  },
  {
    id: "c1c280c5-d5b5-4475-9423-cbea3bdc1844",
    name: "Base 2",
    parentCategoryId: null,
    __category: true,
    products: [],
    children: [],
  },
  { // this is a product!
      id: "07d4f432-6fc3-4b6a-abfa-37b81a0eb147",
      name: "Orphaned Product",
      __product: true,
      hidden: false,
      categoryId: null
  }
];
const categories: SlimCategory[] = [
  {
    id: "c1c280c5-d5b5-4475-9423-cbea3bdc1844",
    name: "Base 2",
    parentCategoryId: null,
    __category: true,
  },
  {
    id: "e0a421c7-892e-437b-85a3-66b3b63f5f8e",
    name: "Child 1",
    parentCategoryId: "b341df73-c718-480e-80fc-71be221b6866",
    __category: true,
  },
  {
    id: "493dab74-f736-4105-b32e-bf361437166c",
    name: "Child 3",
    parentCategoryId: "b341df73-c718-480e-80fc-71be221b6866",
    __category: true,
  },
  {
    id: "cd8b5d44-63ab-4665-a42c-00ef6d036359",
    name: "Child 2",
    parentCategoryId: "b341df73-c718-480e-80fc-71be221b6866",
    __category: true,
  },
  {
    id: "b341df73-c718-480e-80fc-71be221b6866",
    name: "Base",
    parentCategoryId: null,
    __category: true,
  },
]

const products: SlimProduct[] = [
  {
    id: "2ec69d50-8ba7-4c66-a06c-e71e40d613ae",
    name: "Test 1",
    hidden: true,
    categoryId: "b341df73-c718-480e-80fc-71be221b6866",
    __product: true
  },
  {
    id: "84445c24-a3e2-49a1-9a70-a2c6ccb164d4",
    name: "Test 2",
    hidden: true,
    categoryId: "cd8b5d44-63ab-4665-a42c-00ef6d036359",
    __product: true
  },
  { // this is a product!
    id: "07d4f432-6fc3-4b6a-abfa-37b81a0eb147",
    name: "Orphaned Product",
    __product: true,
    hidden: false,
    categoryId: null
  }
]
const tree = mergeCategoriesAndProducts(categories, products);
console.log("=================");
console.dir(tree, { depth: 5 });

try {
  deepStrictEqual(tree, expected);
  console.log("IT FUCKING WORKS LFGGG");
} catch {
  console.error("KILLING MYSELF");
}