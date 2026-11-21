import { test as base } from "@playwright/test";
import { JSDOM } from "jsdom";

// Native element constructors are evaluated once per worker and belong to a
// specific window. Register them in that window for its entire lifetime.
export const test = base.extend<object, { customElementDom: JSDOM }>({
  customElementDom: [
    async ({}, use) => {
      const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
      try {
        await use(dom);
      } finally {
        dom.window.close();
      }
    },
    { scope: "worker" },
  ],
});
