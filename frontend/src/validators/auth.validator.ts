import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .pipe(z.email("Please enter a valid email")),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;


export const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name cannot exceed 50 characters"),

    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required")
      .max(50, "Last name cannot exceed 50 characters"),

    email: z
      .string()
      .min(1, "Email is required")
      .pipe(z.email("Please enter a valid email")),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password cannot exceed 100 characters"),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;


/*
.refine() — Theory
Used for custom validation rules not covered by built-in Zod validators.
Especially useful when validation depends on multiple fields.
Example: password === confirmPassword.
.refine() makes the check part of the Zod validation process.
Normal comparison can check the condition, but you must manually handle the error.
.refine() automatically produces a Zod validation error when the condition fails.
message defines the error message.
path specifies which field gets the error.
Keeps all validation rules centralized inside the schema.
In short: .refine() = custom condition + built-in validation/error handling.
So all form rules stay in one place — the schema.

Also, your form library can receive the Zod error and show it directly against confirmPassword.

Important distinction

refine() is not needed because JavaScript can't compare passwords.

JavaScript can absolutely do:

password === confirmPassword

We use .refine() because:

"This comparison is a rule that must be satisfied before the form is considered valid."
*/

/*
export type LoginFormData = z.infer<typeof loginSchema>;

**What it does:** Automatically creates a **TypeScript type from your Zod schema**.

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

Zod automatically produces:

type LoginFormData = {
  email: string;
  password: string;
};

### `z.infer<typeof loginSchema>`

Means:

> **"Take the TypeScript type represented by `loginSchema`."**

### `export type LoginFormData = ...`

Means:

> **"Give that generated type the name `LoginFormData` and make it available to other files."**

### Flow

```text
Zod schema
    ↓
z.infer
    ↓
TypeScript type
    ↓
LoginFormData

Example:

const handleLogin = (data: LoginFormData) => {
  // data.email → string
  // data.password → string
};

**Main benefit:** You don't write the same type manually. The **Zod schema and TypeScript type stay synchronized**.

*/