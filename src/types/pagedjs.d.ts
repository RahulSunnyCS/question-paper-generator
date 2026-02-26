declare module 'pagedjs' {
  export class Previewer {
    preview(content: Element, stylesheets?: string[], renderTo?: Element): Promise<unknown>;
  }
}
