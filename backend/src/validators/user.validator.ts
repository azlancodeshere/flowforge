import { z} from "zod"



export const registerSchema = z.object({
    username: z
    .string()
    .trim()
    .min(1,"Username must be atleast 1 character")
    .max(50, "Username cannot excedd 50 character"),


 email: z
  .string()
  .trim()
  .pipe(z.email("Please enter a valid email"))
  .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),


}).refine(
    (data)=>
        data.username !== undefined ||
        data.email !== undefined,
        {
            message:"At least one field is required"
        }
)

export const loginSchema = z.object({
             
             username:z
             .string()
             .trim()
             .min(1, "Username cannot be empty")
              .optional(),

              email: z
      .string()
      .trim()
      .pipe(z.email("Please enter a valid email"))
      .transform((value) => value.toLowerCase())
      .optional(),

       password: z
      .string()
      .min(1, "Password is required"),

}).refine(
    (data)=>Boolean(data.email || data.username),
    {
        message: "Email or username is required",
        path:["email"]
    }
)


export const updateAccountSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, "Username cannot be empty")
      .max(50, "Username cannot exceed 50 characters")
      .optional(),

    email: z
      .string()
      .trim()
      .pipe(z.email("Please enter a valid email"))
      .transform((value) => value.toLowerCase())
      .optional(),
  })
  .refine(
    (data) =>
      data.username !== undefined ||
      data.email !== undefined,
    {
      message: "At least one field is required",
    }
  );
