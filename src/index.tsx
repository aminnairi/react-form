import React from "react";
import { useForm } from ".";

export const App = () => {
  const { fields, change } = useForm({
    fields: {
      email: "",
      password: ""
    },
    transformations: {
      email: value => {
        return value.trim().toLowerCase();
      }
    }
  });

  return (
    <form>
      <input
        type="email"
        value={fields.email}
        onChange={change("email")} />
      <input
        type="password"
        value={fields.password}
        onChange={change("password")} />
      <button type="submit">
        Login
      </button>
    </form>
  );
}