import * as Yup from "yup";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,25}$/;

const errorMessage = "Use Lowercase, uppercase and digits";

const loginSchema = Yup.object().shape({
  username: Yup.string().min(5).max(30).required("Username is required"),
  password: Yup.string()
    .min(8)
    .max(25)
    .matches(passwordPattern, { message: errorMessage })
    .required("Password is required"),
});

export default loginSchema;
