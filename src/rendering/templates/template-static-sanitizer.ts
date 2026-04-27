import {
  defaultAttributeBindingPolicy,
  type IAttributeBindingPolicy,
} from "./attribute-binding-policy.js";

export interface ITemplateStaticSanitizer {
  sanitize(root: DocumentFragment | Element): void;
}

const DANGEROUS_STATIC_ELEMENTS = new Set([
  "animate",
  "animatemotion",
  "animatetransform",
  "applet",
  "base",
  "embed",
  "foreignobject",
  "frame",
  "frameset",
  "iframe",
  "link",
  "meta",
  "object",
  "script",
  "set",
]);

const SHOW_ELEMENT = 1;

export class TemplateStaticSanitizer implements ITemplateStaticSanitizer {
  constructor(
    private readonly attributePolicy: IAttributeBindingPolicy = defaultAttributeBindingPolicy,
  ) {}

  sanitize(root: DocumentFragment | Element): void {
    if (!root) return;

    const elements = this.collectElements(root);
    if (this.isElement(root)) {
      elements.unshift(root);
    }

    for (const element of elements) {
      this.sanitizeElement(element);
    }
  }

  private collectElements(root: DocumentFragment | Element): Element[] {
    const elements: Element[] = [];
    const walker = root.ownerDocument.createTreeWalker(root, SHOW_ELEMENT);

    while (walker.nextNode()) {
      elements.push(walker.currentNode as Element);
    }

    return elements;
  }

  private sanitizeElement(element: Element): void {
    const tagName = element.tagName.toLowerCase();
    if (DANGEROUS_STATIC_ELEMENTS.has(tagName)) {
      element.remove();
      return;
    }

    for (const attr of Array.from(element.attributes)) {
      if (attr.name.toLowerCase() === "data-preset-template") {
        element.setAttribute(
          attr.name,
          this.sanitizeHtmlFragmentValue(element, attr.value),
        );
        continue;
      }

      const sanitized = this.attributePolicy.sanitizeStaticAttribute(
        attr.name,
        attr.value,
        element,
      );

      if (sanitized === null) {
        element.removeAttribute(attr.name);
      } else if (sanitized !== attr.value) {
        element.setAttribute(attr.name, sanitized);
      }
    }

    if (this.isTemplateElement(element)) {
      this.sanitize(element.content);
    }
  }

  private isElement(root: DocumentFragment | Element): root is Element {
    return "tagName" in root;
  }

  private isTemplateElement(element: Element): element is HTMLTemplateElement {
    return element.tagName.toLowerCase() === "template" && "content" in element;
  }

  private sanitizeHtmlFragmentValue(element: Element, value: string): string {
    const template = element.ownerDocument.createElement("template");
    template.innerHTML = value;
    this.sanitize(template.content);
    return template.innerHTML;
  }
}
