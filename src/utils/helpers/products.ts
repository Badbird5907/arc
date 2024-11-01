import { type TreeNode } from "@/components/tree";
import { type CategoryTreeNode, type CategoryAndSlimProducts, type CategoryTree, type SlimCategory, type SlimProduct } from "@/types";


export const mergeCategoriesAndProducts = (categories: SlimCategory[], products: SlimProduct[]): CategoryTree => { // flat list of categories (incl children) | flat list of products
  console.dir(categories, { depth: null });
  console.dir(products, { depth: null }); 
  // we want to put the products into the categories, and put the children into the parent categories
  const categoryMap = new Map<string, CategoryAndSlimProducts>(); // using map for quick O(1) lookups
  const productMap = new Map<string, SlimProduct>(); // WE ARE NOT USING THIS IN THE FINAL TREE, JUST FOR QUICK O(1) LOOKUPS
  const orphans: SlimProduct[] = [];
  const rootCategories: CategoryAndSlimProducts[] = [];
  const pendingParentMap = new Map<string, CategoryAndSlimProducts[]>(); // we need to keep track of parents that we haven't seen yet
  const processCategory = (category: SlimCategory) => {
    const categoryWithProducts = { ...category, products: [], children: [] } as CategoryAndSlimProducts;
    categoryMap.set(category.id, categoryWithProducts); // add to the map w/ no products/children
    if (category.parentCategoryId) { // if it has a parent
      const parent = categoryMap.get(category.parentCategoryId);
      if (parent) {
        parent.children.push(categoryWithProducts); // add to the parent's children
      } else {
        const pending = pendingParentMap.get(category.parentCategoryId) ?? [];
        pending.push(categoryWithProducts); // add to pending
        pendingParentMap.set(category.parentCategoryId, pending);
      }
    } else {
      rootCategories.push(categoryWithProducts); // add to the root categories (this is a parent)
    }

    const pending = pendingParentMap.get(category.id) ?? [] as CategoryAndSlimProducts[]; // get the children that were pending
    pending.forEach((child: CategoryAndSlimProducts) => {
      categoryWithProducts.children.push(child); // add the children that were pending
    });
  }
  categories.forEach((category) => {
    processCategory(category);
    if ("children" in category) {
      (category as { children: SlimCategory[] }).children.forEach((child) => {
        processCategory(child);
      });
    }
  });

  products.forEach((product) => {
    productMap.set(product.id, product); // add to the map
    const parent = product.categoryId && categoryMap.get(product.categoryId); // get the parent category (if it exists)
    if (parent) {
      parent.products.push(product); // add the product to the parent
    } else {
      orphans.push(product); // add to orphans
    }
  });

  // now we put them together
  const tree: CategoryTree = [];
  rootCategories.forEach((category) => { // push root categories on
    tree.push(category); // this includes all the children!! (since we added them to the parent)
  });
  orphans.forEach((product) => {
    tree.push(product); // push orphans on
  });
  // sort the tree by name
  const sortTree = (node: CategoryAndSlimProducts | SlimProduct) => {
    if ("children" in node) {
      node.children.sort((a, b) => a.name.localeCompare(b.name));
      node.children.forEach((child) => {
        sortTree(child);
      });
    }
    if ("products" in node) {
      node.products.sort((a, b) => a.name.localeCompare(b.name));
    }
    if ("__product" in node) { // leaf node
      return;
    }
  }
  tree.forEach((node) => {
    sortTree(node);
  });
  tree.sort((a, b) => a.name.localeCompare(b.name));
  
  // console.dir(tree, { depth: null });
  return tree;
}

export const convertToTreeData = (tree: CategoryTree): TreeNode[] => {
  const nodes: TreeNode[] = [];
  const map = new Map<string, TreeNode>();
  const handleNode = (node: CategoryTreeNode) => {
    // console.log(node);
    if ("__product" in node) {
      // leaf node
      return {
        id: node.id,
        parentId: node.categoryId,
        data: node, // SlimProduct
      }
    }
    const treeNode: TreeNode = {
      id: node.id,
      parentId: node.parentCategoryId,
      children: [],
      data: node, // CategoryAndSlimProducts
      defaultOpen: true,
    }
    if (node.children) {
      node.children.forEach((child) => {
        treeNode.children!.push(handleNode(child));
      })
    }
    if (node.products) {
      node.products.forEach((product) => {
        treeNode.children!.push({ // LEAF
          id: product.id,
          parentId: node.id,
          data: product,
        })
      })
    }
    return treeNode;
  }

  tree.forEach((node) => {
    const treeNode = handleNode(node);
    nodes.push(treeNode);
    map.set(node.id, treeNode);
  });

  nodes.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      const parent = map.get(node.parentId)!;
      parent.children!.push(node);
    } else if (node.parentId) {
      console.warn("Parent not found for node", node);
    }
  })
  return nodes;
}