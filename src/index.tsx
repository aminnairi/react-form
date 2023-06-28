import React, { FormEvent, useCallback } from "react";
import { useForm } from ".";

interface CountryFormFields {
  country: string;
}

export const App = () => {
  const {
    fields,
    onSelectChangeForField,
  } = useForm<CountryFormFields>({
    country: ""
  });

  const onSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();

    console.log("TODO: handle fields");
    console.log({ fields });
  }, [fields]);

  return (
    <form onSubmit={onSubmit}>
      <select
        value={fields.country}
        onChange={onSelectChangeForField("country")}>
        <option value="fr">France</option>
        <option value="us">USA</option>
        <option value="de">Germany</option>
      </select>
      <button type="submit">
        Login
      </button>
    </form>
  );
};
