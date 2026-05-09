import { bootstrapFramework, Services, Pick } from "pick-components";

await bootstrapFramework(Services);

@Pick("hello-compat", (ctx) => {
  ctx.html(`<p data-testid="output">Hello Pick Components</p>`);
})
class HelloCompat {}
