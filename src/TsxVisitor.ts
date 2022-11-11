import { Visitor } from "@swc/core/Visitor";
import {
  FunctionDeclaration,
  JSXOpeningElement,
  ObjectExpression,
  TsType,
  VariableDeclarator,
} from "@swc/core";

type BaseInfo = {
  name: string;
};
type ElementInfo = BaseInfo & {
  attrs: string[];
};
type ComponentInfo = BaseInfo & {
  props: string[];
};

// extract property names array from expression
const extractProps = (e: ObjectExpression): string[] =>
  e?.properties?.map(({ key }: any) => key.value);

export class TsxVisitor extends Visitor {
  // Tree traversal using this Visitor pattern is synchronous, therefore we can simply store a state
  // of the component that we are currently traversing.
  // We add the current component to the componentsMap if we find any JSX element while traversing it.
  currentComponent: ComponentInfo = {
    name: "",
    props: [],
  };

  // using a Map since multiple components can't share the same name
  componentsMap = new Map<ComponentInfo["name"], ComponentInfo>();

  // list of elements that are found while traversing the tree
  elements: ElementInfo[] = [];

  // components list shorthand
  get components() {
    return Array.from(this.componentsMap.values());
  }

  // must be implemented, otherwise throws error
  visitTsType(n: TsType) {
    return n;
  }

  // members like "function MyComponent() { ... }"
  visitFunctionDeclaration(n: FunctionDeclaration) {
    if (n.params && n.identifier) {
      this.currentComponent = {
        name: n.identifier.value,
        // ignoring the type mismatch because React components should always have object params
        props: extractProps(n.params[0]?.pat as ObjectExpression),
      };
    }
    return super.visitFunctionDeclaration(n);
  }

  // members like "const MyComponent = () => { ... }"
  visitVariableDeclarator(n: VariableDeclarator) {
    if (n.init && "params" in n.init && "value" in n.id && n.id.value) {
      this.currentComponent = {
        name: String(n.id.value),
        // ignoring the type mismatch because React components should always have object params
        props: extractProps(n.init.params[0] as ObjectExpression),
      };
    }
    return super.visitVariableDeclarator(n);
  }

  // JSX elements
  visitJSXOpeningElement(n: JSXOpeningElement) {
    const { attributes, name } = n;

    const attrs: string[] = [];
    if (attributes?.length) {
      attributes.forEach((attr) => {
        if (attr.type === "JSXAttribute" && "value" in attr.name) {
          attrs.push(attr.name.value);
        }
      });
    }

    if ("value" in name && name.value) {
      const elementInfo = { name: name.value, attrs };

      // store the element
      this.elements.push(elementInfo);

      // store the current component if it hasn't yet been added to the map
      if (
        this.currentComponent.name &&
        !this.componentsMap.has(this.currentComponent.name)
      ) {
        this.componentsMap.set(
          this.currentComponent.name,
          this.currentComponent
        );
      }
    }
    return super.visitJSXOpeningElement(n);
  }
}
