import type { ToolDefinition } from "../shared/types.ts";
import type { ToolHandler } from "./shared.ts";

type TodoStatus = "not-started" | "in-progress" | "done";

interface TodoItem {
  id: number;
  title: string;
  status: TodoStatus;
}

interface TodoState {
  nextId: number;
  items: TodoItem[];
}

// In-memory todo storage (per session)
let todoState: TodoState = {
  nextId: 1,
  items: [],
};

export const manageTodoDefinition: ToolDefinition = {
  name: "manage_todo",
  description: "Manage a todo list for tracking multi-step composition tasks",
  parameters: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["list", "add", "done", "set_status"],
        description: "Action to perform",
      },
      title: {
        type: "string",
        description: "Title for new todo (required for add)",
      },
      id: {
        type: "number",
        description: "Todo ID (required for done/set_status)",
      },
      status: {
        type: "string",
        enum: ["not-started", "in-progress", "done"],
        description: "New status (for set_status)",
      },
    },
    required: ["action"],
  },
};

export const manageTodoTool: ToolHandler = async (args) => {
  const action = args.action as string;

  switch (action) {
    case "list": {
      if (todoState.items.length === 0) {
        return { id: "manage_todo", output: "No todos yet." };
      }
      const list = todoState.items
        .map((item) => `${item.id}. [${item.status}] ${item.title}`)
        .join("\n");
      return { id: "manage_todo", output: list };
    }

    case "add": {
      const title = args.title as string;
      if (!title) {
        return { id: "manage_todo", output: "Error: title is required for add", error: true };
      }
      const newItem: TodoItem = {
        id: todoState.nextId++,
        title,
        status: "not-started",
      };
      todoState.items.push(newItem);
      return { id: "manage_todo", output: `Added ${newItem.id}. ${newItem.title}` };
    }

    case "done": {
      const id = args.id as number;
      const item = todoState.items.find((i) => i.id === id);
      if (!item) {
        return { id: "manage_todo", output: `Error: todo ${id} not found`, error: true };
      }
      item.status = "done";
      return { id: "manage_todo", output: `Completed ${item.id}. ${item.title}` };
    }

    case "set_status": {
      const id = args.id as number;
      const status = args.status as TodoStatus;
      const item = todoState.items.find((i) => i.id === id);
      if (!item) {
        return { id: "manage_todo", output: `Error: todo ${id} not found`, error: true };
      }
      item.status = status;
      return { id: "manage_todo", output: `Updated ${item.id}. ${item.title} → ${status}` };
    }

    default:
      return { id: "manage_todo", output: `Unknown action: ${action}`, error: true };
  }
};

/**
 * Reset todo state (useful for testing or new sessions)
 */
export function resetTodoState(): void {
  todoState = { nextId: 1, items: [] };
}
