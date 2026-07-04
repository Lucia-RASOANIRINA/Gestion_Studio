import { ClientSegment } from "@prisma/client";
import { createClientSchema } from "./clients.validation";

describe("createClientSchema", () => {
  it("accepts a minimal valid client with default segment", () => {
    const result = createClientSchema.safeParse({ name: "Studio Antsahavola" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.segment).toBe(ClientSegment.OTHER);
    }
  });

  it("accepts a valid Malagasy phone number", () => {
    const result = createClientSchema.safeParse({ name: "Artiste Test", phone: "+261340000099" });
    expect(result.success).toBe(true);
  });

  it("rejects a phone number without the +261 prefix", () => {
    const result = createClientSchema.safeParse({ name: "Artiste Test", phone: "0340000099" });
    expect(result.success).toBe(false);
  });

  it("rejects a phone number with the wrong number of digits", () => {
    const result = createClientSchema.safeParse({ name: "Artiste Test", phone: "+26134000009" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = createClientSchema.safeParse({ name: "Label Test", email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a name that is too short", () => {
    const result = createClientSchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
  });
});
