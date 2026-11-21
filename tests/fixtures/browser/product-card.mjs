import { bootstrapElement } from "../../../dist/bootstrap.js";

import { template } from "./product-card-template.mjs";

await bootstrapElement("pick-product-card", (ctx) => {
  ctx.state({ productId: "", count: 0 });
  ctx.html(template);
  ctx.listen("button", "click", function () {
    this.count++;
  });
});
