import { describe, expect, it } from "vitest";
import { emptyContact, validateContact } from "./contact-validation";
import { topics } from "./site";

const valid = {
  applicantType: "corporate" as const,
  company: "テスト株式会社",
  name: "テスト担当者",
  email: "test@example.com",
  role: "総務",
  topic: topics[0],
  message: "アカウント台帳の整理について相談したいです。",
  consent: true,
};

describe("consultation validation and delivery boundary", () => {
  it("accepts a complete consultation", () =>
    expect(validateContact(valid)).toEqual({}));
  it("defaults to an individual and requires the shared fields", () => {
    expect(emptyContact.applicantType).toBe("individual");
    expect(Object.keys(validateContact(emptyContact))).toHaveLength(5);
  });
  it("does not require company details from individuals", () =>
    expect(validateContact({ ...valid, applicantType: "individual", company: "", role: "" })).toEqual({}));
  it("rejects whitespace-only values, invalid email and unknown topic", () => {
    expect(
      validateContact({
        ...valid,
        company: "　 ",
        message: "\n ",
        email: "wrong@",
        topic: "untrusted",
      }),
    ).toEqual(
      expect.objectContaining({
        company: expect.any(String),
        message: expect.any(String),
        email: expect.any(String),
        topic: expect.any(String),
      }),
    );
  });
  it("enforces lengths even when bypassing browser attributes", () => {
    const errors = validateContact({
      ...valid,
      company: "a".repeat(121),
      name: "a".repeat(81),
      role: "a".repeat(201),
      message: "a".repeat(3001),
      email: `${"a".repeat(245)}@example.com`,
    });
    expect(Object.keys(errors)).toHaveLength(5);
  });
  it("allows boundary lengths and trimmed email", () => {
    expect(
      validateContact({
        ...valid,
        company: "a".repeat(120),
        name: "a".repeat(80),
        role: "a".repeat(200),
        message: "a".repeat(3000),
        email: " test@example.com ",
      }),
    ).toEqual({});
  });
  it("requires privacy consent", () =>
    expect(validateContact({ ...valid, consent: false }).consent).toBeTruthy());
});
