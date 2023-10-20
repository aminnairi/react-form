# @aminnairi/react-form

Form utilities for React written in TypeScript

## Summary

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
  - [Fields](#fields)
  - [Inputs](#inputs)
  - [Submission](#submission)
  - [Errors](#errors)
  - [Transformations](#transformations)
  - [References](#references)
  - [Programmatic Value Setting](#programmatic-value-setting)
  - [Form status](#form-status)
- [Contributing](#contributing)
- [License](#license)
- [Code Of Conduct](#code-of-conduct)
- [Security](#security)



## Features

- Written in TypeScript from the ground up
- Convenience functions & properties allowing you to quickly scafold forms in seconds
- Sane default behavior for a better user experience
- Enough control to allow you to use your own components and styling without having to write all the logic down
- Best developer experience when used with TypeScript
- No assumptions made when validating data: use your library of choice, whether it is Zod, Joi, Yup, etc... No 

[Go back to summary](#summary)

## Requirements

- [Node](https://nodejs.org/en)
- [NPM](https://npmjs.com/)

[Go back to summary](#summary)

## Installation

```bash
npm install @aminnairi/react-form
```

[Go back to summary](#summary)

## Usage

### Fields

Fields represent the data within your form, which can encompass various types such as strings, numbers, booleans, or files. You can employ these fields in controlled form elements within your JSX to mirror the field's value and keep it in sync with the useForm hook.

```tsx
import React from "react";
import { useForm } from "@aminnairi/react-form";

export const App = () => {
  const { fields } = useForm({
    fields: {
      email: "",
      password: ""
    }
  });

  return (
    <form>
      <input
        type="email"
        value={fields.email} />
      <input
        type="password"
        value={fields.password} />
    </form>
  );
}
```

[Go back to summary](#summary)

### Inputs

To modify the values of fields, you can utilize the change, select, check, or store functions. Be sure to choose the one that aligns with the specific field you are updating.

```tsx
import React from "react";
import { useForm } from "@aminnairi/react-form";

export const App = () => {
  const { fields, change, select, check } = useForm({
    fields: {
      email: "",
      password: "",
      country: "fr",
      termsOfUseAccepted: false
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
      <select value={fields.country} onChange={select("country")}>
        <option value="fr">
          France
        </option>
        <option value="de">
          Germany
        </option>
        <option value="es">
          Spain 
        </option>
      </select>
      <input
        type="checkbox"
        checked={fields.termsOfUseAccepted}
        onChange={check("termsOfUseAccepted")} />
      <button type="submit">
        Login
      </button>
    </form>
  );
}
```

[Go back to summary](#summary)

### Submission

Submission enables you to trigger the default HTML behavior for forms. For example, you can press the Enter key to submit a form when a text field is in focus, providing a quick submission method without the need to manually click the submit button. The onSubmit function empowers you to prevent the browser's default behavior, which involves sending an HTTP request and completely reloading the page. This functionality ensures that you retain the JavaScript values entered in the form, enhancing the user experience. Additionally, the OnSubmitCallback is a TypeScript utility type designed to dynamically compute the form's defined fields, thus reducing the risk of errors, such as unintentionally removing a field in the near future.

```tsx
import React, { useCallback } from "react";
import { OnSubmitCallback, useForm } from "@aminnairi/react-form";

export const App = () => {
  const { fields, change, onSubmit } = useForm({
    fields: {
      email: "",
      password: ""
    }
  });

  const login: OnSubmitCallback<typeof onSubmit> = useCallback((fields) => {
    console.log(fields);
  }, []);

  return (
    <form onSubmit={onSubmit(login)}>
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
```

[Go back to summary](#summary)

### Errors

Errors provides users with quick feedback regarding issues with one or more fields in the form. By supplying the useForm with a validations property for each field defined in the fields property, you can populate the errors property with custom error messages at your convenience. Each validation is a function that takes the current value and the entire set of fields as input, enabling you to create pure functions for field validation. If a validation function returns null, it indicates that no errors have been detected for the current working field. You can retrieve errors using the errors property.

The `hasError` property is an object that includes keys corresponding to the fields defined in the fields property of the useForm hook. It allows you to determine whether a field has an error or not.

The `disabled` property is a convenient feature that lets you disable an HTML element if one or more errors are present in the form

```tsx
import React from "react";
import { useForm } from "@aminnairi/react-form";

export const App = () => {
  const { fields, change, errors, hasError, disabled } = useForm({
    fields: {
      email: "",
      password: ""
    },
    validations: {
      email: value => {
        if (!value.includes("@")) {
          return "Should contains an @ symbol";
        }

        return null;
      },
      password: (value, fields) => {
        if (value === fields.email) {
          return "Should not equal to the email";
        }

        return null;
      }
    }
  });

  return (
    <form>
      <input
        type="email"
        value={fields.email}
        onChange={change("email")} />
      {hasError.email && (
        <small>
          {errors.email}
        </small>
      )}
      <input
        type="password"
        value={fields.password}
        onChange={change("password")} />
      {hasError.password && (
        <small>
          {errors.password}
        </small>
      )}
      <button disabled={disabled}>
        Login
      </button>
    </form>
  );
}
```

### Transformations

Transformations prove valuable when you need to modify user inputs, such as enforcing lowercase characters for an email field or restricting a credit card input to a specific range of numbers. All you need to do is supply the useForm hook with a transformations property that specifies the transformation to apply for each field. The hook takes care of the rest, automatically applying these transformations to your field values, eliminating the need for any additional manual steps.

```tsx
import React from "react";
import { useForm } from "@aminnairi/react-form";

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
```

[Go back to summary](#summary)

### References

References offer a convenient way to highlight fields with errors. For example, when a user submits the form, whether by clicking a submit button or pressing Enter in a text field, the hook will automatically focus on the first field with an error if you've associated that field with a reference. You can create a reference using React's `createRef` function, specifying the reference type in its generic argument. Once you've set up the reference, simply attach it to your JSX, and the hook will take care of the rest. Additionally, you can programmatically focus on a field by providing its name using the `focus` function exported from the `useForm` hook.

```tsx
import React, { createRef, useEffect } from "react";
import { useForm } from "@aminnairi/react-form";

export const App = () => {
  const { fields, change, errors, refs, focus } = useForm({
    fields: {
      email: "",
      password: ""
    },
    refs: {
      email: createRef<HTMLInputElement>(),
      password: createRef<HTMLInputElement>()
    },
    validations: {
      email: value => {
        if (!value.includes("@")) {
          return "Should contains an @ symbol";
        }

        return null;
      },
      password: (value, fields) => {
        if (value === fields.email) {
          return "Should not equal to the email";
        }

        return null;
      }
    }
  });

  useEffect(() => {
    focus("email");
  }, []);

  return (
    <form>
      <input
        type="email"
        value={fields.email}
        onChange={change("email")}
        ref={refs?.email} />
      <small>
        {errors.email}
      </small>
      <input
        type="password"
        value={fields.password}
        onChange={change("password")}
        ref={refs?.password} />
      <small>
        {errors.password}
      </small>
      <button>
        Login
      </button>
    </form>
  );
}
```

[Go back to summary](#summary)

### Programmatic Value Setting

Occasionally, you may wish to prefill your form with data that arrives later, perhaps via an HTTP request. In such situations, you should consider utilizing the `set` function exported from the `useForm` hook. This function takes two arguments: the name of the field and the new value for that field. Additionally, you can reset the entire form to its initial state, which is specified in the fields property of the `useForm` hook, by invoking the `reset` function also exported by the hook.

```tsx
import React, { useEffect } from "react";
import { useForm } from "@aminnairi/react-form";

export const App = () => {
  const { fields, change, set, reset } = useForm({
    fields: {
      email: "",
      password: "",
    }
  });

  useEffect(() => {
    const email = window.localStorage.getItem("email");

    if (typeof email === "string") {
      set("email", email);
    }
  }, []);

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
      <button onClick={reset}>
        Reset
      </button>
    </form>
  );
}
```

[Go back to summary](#summary)

### Form status

Fields and the form itself have associated states. You can determine if a field has been interacted with by using the `touched` and `untouched` properties, which are exported from the `useForm` hook. A "touched" field is one that has been altered by the user, meaning its value has changed through one of the following functions: `change`, `select`, `check`, or `store`. 

In a similar manner, you can assess whether the entire form has been touched using the `pristine` and `dirty` properties, also exported from the `useForm` hook. The `pristine` property is `true` when any of the fields have been touched, and conversely, the `dirty` property is `true` when there has been interaction with any part of the form.

```tsx
import React from "react";
import { useForm } from ".";

export const App = () => {
  const { fields, change, errors, hasError, disabled, touched, untouched, dirty, pristine } = useForm({
    fields: {
      email: "",
      password: ""
    },
    validations: {
      email: value => {
        if (!value.includes("@")) {
          return "Should contains an @ symbol";
        }

        return null;
      },
      password: (value, fields) => {
        if (value === fields.email) {
          return "Should not equal to the email";
        }

        return null;
      }
    }
  });

  return (
    <form>
      {dirty && (
        <p>
          Hint: your login informations have been sent by email.
        </p>
      )}
      <input
        type="email"
        value={fields.email}
        onChange={change("email")} />
      {touched.email && hasError.email && (
        <small>
          {errors.email}
        </small>
      )}
      <input
        type="password"
        value={fields.password}
        onChange={change("password")} />
      {!untouched.password && hasError.password && (
        <small>
          {errors.password}
        </small>
      )}
      <button disabled={pristine || disabled}>
        Login
      </button>
    </form>
  );
}
```

[Go back to summary](#summary)

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

[Go back to summary](#summary)

## License

See [`LICENSE`](./LICENSE).

[Go back to summary](#summary)

## Code Of Conduct

See [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

[Go back to summary](#summary)

## Security

See [`SECURITY.md`](./SECURITY.md).

[Go back to summary](#summary)