# Why Pick Components Exists

Web frontend is not my full-time work. But every now and then I end up building something for the web — a personal project, something small, or a tool for a friend — and every time I step into that world I get the same feeling: too many layers, too many frameworks, too many libraries piled on top of each other, and not enough sense that I can still see the project from the ground up. At some point, it starts to feel like something is off.

Pick Components came from that feeling. It did not come from “I want to build another framework”, and it definitely did not come from any desire to compete with React, Angular, or Vue. It came from wanting something useful for my own needs: a way to build native Web Components with clearer boundaries, controlled templates, and less dependence on large runtimes.

This idea is older than this repository. More than five years ago, in `FieldDocumentMaker`, inside `FieldDocumentMaker.Editor/src/components`, I had a base component that already contained the first rough shape of this idea. One intuition from that code never really left me: in JavaScript, `a.b` and `a["b"]` are just two ways of reaching the same property. That changed how I thought about UI. Less “just run code here”, more “resolve this from structure”.

That old component already had early versions of ideas that later became central to this project: `{{...}}` template bindings, property-based bindings, reactive DOM updates, and a small DOM/template compilation step. What it still lacked was a cleaner architecture and a harder line around what templates were allowed to do.

Over time, that became a design rule. I wanted expressions in templates, but I did not want `eval`, `new Function`, or arbitrary JavaScript running inside templates. That decision pushed the project toward parsing a limited expression language, building an AST, and evaluating it under explicit rules. A lot of what Pick Components is today comes from taking that idea seriously instead of treating templates as a place where anything goes.

Language models helped a lot while building this. Not just as code generators — which they also were, and invaluably so — but for exploring architecture, testing ideas, refactoring, formalizing vague intuitions, and speeding up implementation and documentation. The direction still had to come from me, but they made it much easier to iterate on the design of the framework.

That is why I built Pick Components: to build native Web Components with a more explicit internal architecture, controlled templates, reactive state, a clear lifecycle, and less dependence on large runtimes. If that sounds useful, try it, read the code, question the design, open issues, and contribute if you want to help shape it.