import { topics } from "./site";

export type ContactValues = {
  applicantType: "individual" | "corporate" | "";
  company: string;
  name: string;
  email: string;
  role: string;
  topic: string;
  message: string;
  consent: boolean;
};
export type ContactErrors = Partial<Record<keyof ContactValues, string>>;
export const emptyContact: ContactValues = {
  applicantType: "individual",
  company: "",
  name: "",
  email: "",
  role: "",
  topic: "",
  message: "",
  consent: false,
};

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (!(["individual", "corporate"] as const).includes(values.applicantType as "individual" | "corporate"))
    errors.applicantType = "申込区分を選んでください。";
  const fields = [
    ["name", "氏名", 80],
    ["message", "相談内容", 3000],
  ] as const;
  if (values.applicantType === "corporate") {
    if (!values.company.trim()) errors.company = "会社名を入力してください。";
    else if (values.company.length > 120) errors.company = "会社名は120文字以内で入力してください。";
    if (!values.role.trim()) errors.role = "立場・担当業務を入力してください。";
    else if (values.role.length > 200) errors.role = "立場・担当業務は200文字以内で入力してください。";
  }
  for (const [field, label, max] of fields) {
    if (!values[field].trim()) errors[field] = `${label}を入力してください。`;
    else if (values[field].length > max)
      errors[field] = `${label}は${max}文字以内で入力してください。`;
  }
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()) ||
    values.email.length > 254
  )
    errors.email = "有効なメールアドレスを入力してください。";
  if (!(topics as readonly string[]).includes(values.topic))
    errors.topic = "相談したい内容を選んでください。";
  if (!values.consent)
    errors.consent = "プライバシーポリシーを確認し、同意してください。";
  return errors;
}
