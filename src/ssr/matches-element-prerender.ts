import type { PrerenderAdoptionCandidate } from "./prerender-manifest.js";

/** Adopt only the exact single-root HTML shape authored by a standalone widget. */
export function matchesElementPrerender(
  candidate: PrerenderAdoptionCandidate,
  source: string,
): boolean {
  const template =
    candidate.hostElement.ownerDocument.createElement("template");
  template.innerHTML = source.trim();
  const root = template.content.firstElementChild;
  return (
    candidate.rootElement.parentElement === candidate.hostElement &&
    template.content.childNodes.length === 1 &&
    !!root &&
    candidate.hostElement.children.length === 1 &&
    matchesNode(root, candidate.rootElement)
  );
}

function matchesNode(template: Node, rendered: Node): boolean {
  if (
    template.nodeType !== rendered.nodeType ||
    template.nodeName !== rendered.nodeName
  )
    return false;
  if (template.nodeType === Node.TEXT_NODE) {
    return (
      template.textContent?.includes("{{") === true ||
      template.textContent === rendered.textContent
    );
  }
  if (!(template instanceof Element) || !(rendered instanceof Element))
    return false;
  if (
    template.namespaceURI !== rendered.namespaceURI ||
    template.attributes.length !== rendered.attributes.length
  )
    return false;
  for (const attr of Array.from(template.attributes)) {
    const value = rendered.getAttributeNS(attr.namespaceURI, attr.localName);
    if (value === null || (!attr.value.includes("{{") && attr.value !== value))
      return false;
  }
  return (
    template.childNodes.length === rendered.childNodes.length &&
    Array.from(template.childNodes).every((child, index) =>
      matchesNode(child, rendered.childNodes[index]),
    )
  );
}
