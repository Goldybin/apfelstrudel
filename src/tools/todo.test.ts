import { describe, it, expect, beforeEach } from "bun:test";
import { manageTodoTool, resetTodoState } from "./todo.ts";

describe("manageTodoTool", () => {
  beforeEach(() => {
    resetTodoState();
  });

  describe("list action", () => {
    it("returns empty message when no todos", async () => {
      const result = await manageTodoTool({ action: "list" });
      expect(result.output).toBe("No todos yet.");
    });

    it("lists all todos after adding some", async () => {
      await manageTodoTool({ action: "add", title: "First task" });
      await manageTodoTool({ action: "add", title: "Second task" });
      const result = await manageTodoTool({ action: "list" });
      expect(result.output).toContain("1. [not-started] First task");
      expect(result.output).toContain("2. [not-started] Second task");
    });
  });

  describe("add action", () => {
    it("adds a todo with auto-incrementing id", async () => {
      const result1 = await manageTodoTool({ action: "add", title: "Task A" });
      expect(result1.output).toContain("Added 1. Task A");

      const result2 = await manageTodoTool({ action: "add", title: "Task B" });
      expect(result2.output).toContain("Added 2. Task B");
    });

    it("returns error when title is missing", async () => {
      const result = await manageTodoTool({ action: "add" });
      expect(result.error).toBe(true);
      expect(result.output).toContain("title is required");
    });
  });

  describe("done action", () => {
    it("marks a todo as done", async () => {
      await manageTodoTool({ action: "add", title: "Complete me" });
      const result = await manageTodoTool({ action: "done", id: 1 });
      expect(result.output).toContain("Completed 1. Complete me");

      const list = await manageTodoTool({ action: "list" });
      expect(list.output).toContain("[done]");
    });

    it("returns error for non-existent todo", async () => {
      const result = await manageTodoTool({ action: "done", id: 999 });
      expect(result.error).toBe(true);
      expect(result.output).toContain("not found");
    });
  });

  describe("set_status action", () => {
    it("updates status of a todo", async () => {
      await manageTodoTool({ action: "add", title: "Progress me" });
      const result = await manageTodoTool({
        action: "set_status",
        id: 1,
        status: "in-progress",
      });
      expect(result.output).toContain("Updated 1. Progress me → in-progress");

      const list = await manageTodoTool({ action: "list" });
      expect(list.output).toContain("[in-progress]");
    });

    it("returns error for non-existent todo", async () => {
      const result = await manageTodoTool({
        action: "set_status",
        id: 999,
        status: "done",
      });
      expect(result.error).toBe(true);
      expect(result.output).toContain("not found");
    });
  });

  describe("unknown action", () => {
    it("returns error for unknown action", async () => {
      const result = await manageTodoTool({ action: "delete" });
      expect(result.error).toBe(true);
      expect(result.output).toContain("Unknown action: delete");
    });
  });
});
