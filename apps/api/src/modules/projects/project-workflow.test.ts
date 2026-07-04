import { PermissionAction, ProjectStatus } from "@prisma/client";
import { canTransition, requiredPermissionForTransition } from "./project-workflow";

describe("project workflow transitions", () => {
  it("allows the imposed forward workflow", () => {
    expect(canTransition(ProjectStatus.QUOTE, ProjectStatus.VALIDATED)).toBe(true);
    expect(canTransition(ProjectStatus.VALIDATED, ProjectStatus.IN_PROGRESS)).toBe(true);
    expect(canTransition(ProjectStatus.IN_PROGRESS, ProjectStatus.REVIEW)).toBe(true);
    expect(canTransition(ProjectStatus.REVIEW, ProjectStatus.DELIVERED)).toBe(true);
    expect(canTransition(ProjectStatus.DELIVERED, ProjectStatus.INVOICED)).toBe(true);
    expect(canTransition(ProjectStatus.INVOICED, ProjectStatus.ARCHIVED)).toBe(true);
  });

  it("allows sending a project back to production from review", () => {
    expect(canTransition(ProjectStatus.REVIEW, ProjectStatus.IN_PROGRESS)).toBe(true);
  });

  it("rejects skipping steps", () => {
    expect(canTransition(ProjectStatus.QUOTE, ProjectStatus.IN_PROGRESS)).toBe(false);
    expect(canTransition(ProjectStatus.QUOTE, ProjectStatus.DELIVERED)).toBe(false);
  });

  it("rejects moving backwards outside of the review loop", () => {
    expect(canTransition(ProjectStatus.IN_PROGRESS, ProjectStatus.QUOTE)).toBe(false);
    expect(canTransition(ProjectStatus.DELIVERED, ProjectStatus.REVIEW)).toBe(false);
  });

  it("rejects any transition once archived", () => {
    expect(canTransition(ProjectStatus.ARCHIVED, ProjectStatus.QUOTE)).toBe(false);
  });

  it("requires the VALIDATE permission only to reach the validated status", () => {
    expect(requiredPermissionForTransition(ProjectStatus.VALIDATED)).toBe(PermissionAction.VALIDATE);
    expect(requiredPermissionForTransition(ProjectStatus.IN_PROGRESS)).toBe(PermissionAction.UPDATE);
    expect(requiredPermissionForTransition(ProjectStatus.ARCHIVED)).toBe(PermissionAction.UPDATE);
  });
});
