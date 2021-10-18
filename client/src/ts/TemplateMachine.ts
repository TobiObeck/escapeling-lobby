import { Machine } from "xstate";

interface TemplateSchema {
  states: {
    idle: {};
    opened: {};
    closed: {};
  };
}

// The events that the machine handles
type TemplateEvent = { type: "OPEN" } | { type: "CLOSE" };

// The context (extended state) of the machine
interface TemplateContext {
  someContextVar: number;
}

export const templateMachine = Machine<TemplateContext, TemplateSchema, TemplateEvent>({
  id: "Template",
  initial: "idle",
  context: {
    someContextVar: 0
  },
  states: {
    idle: {
      on: {
        OPEN: {
          target: "opened",
          actions: () => (document.getElementById("modal").style.display = "block")
        }
      }
    },
    opened: {
      on: {
        CLOSE: "closed"
      }
    },
    closed: {
      on: {
        OPEN: "opened"
      }
    }
  }
});
