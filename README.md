# @aminnairi/react-form

Form utilities for React written in TypeScript

```typescript
import React, { FormEvent, useCallback } from "react";
import { useForm } from "@aminnairi/react-form";

interface LoginFormFields {
  email: string;
  password: string;
}

export const App = () => {
  const {
    fields,
    onInputChangeForField,
  } = useForm<LoginFormFields>({
    email: "",
    password: ""
  });

  const onSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();

    console.log("TODO: handle the orm fields");
    console.log({ fields });
  }, [fields]);

  return (
    <form onSubmit={onSubmit}>
      <input
        type="email"
        value={fields.email}
        onChange={onInputChangeForField("email")} />
      <input
        type="password"
        value={fields.password}
        onChange={onInputChangeForField("password")} />
      <button type="submit">
        Login
      </button>
    </form>
  );
};
```

## Requirements

- [Node](https://nodejs.org/en)
- [NPM](https://npmjs.com/)

## Installation

```bash
npm install @aminnairi/react-form
```

## Example

### Handle inputs

```typescript
import React, { FormEvent, useCallback } from "react";
import { useForm } from "@aminnairi/react-form";

interface LoginFormFields {
  email: string;
  password: string;
}

export const App = () => {
  const {
    fields,
    onInputChangeForField,
  } = useForm<LoginFormFields>({
    email: "",
    password: ""
  });

  const onSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();

    console.log("TODO: handle fields");
    console.log({ fields });
  }, [fields]);

  return (
    <form onSubmit={onSubmit}>
      <input
        type="email"
        value={fields.email}
        onChange={onInputChangeForField("email")} />
      <input
        type="password"
        value={fields.password}
        onChange={onInputChangeForField("password")} />
      <button type="submit">
        Login
      </button>
    </form>
  );
};
```

### Handle checkboxes

```typescript
import React, { FormEvent, useCallback } from "react";
import { useForm } from "@aminnairi/react-form";

interface MotorcycleFormFields {
  hasLicence: boolean;
}

export const App = () => {
  const {
    fields,
    onCheckboxChangeForField,
  } = useForm<MotorcycleFormFields>({
    hasLicence: false
  });

  const onSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();

    console.log("TODO: handle fields");
    console.log({ fields });
  }, [fields]);

  return (
    <form onSubmit={onSubmit}>
      <input
        type="checkbox"
        checked={fields.hasLicence}
        onChange={onCheckboxChangeForField("hasLicence")} />
      <button type="submit">
        Login
      </button>
    </form>
  );
};
```

### Handle textarea

```typescript
import React, { FormEvent, useCallback } from "react";
import { useForm } from "@aminnairi/react-form";

interface CommentFormFields {
  comment: string;
}

export const App = () => {
  const {
    fields,
    onTextareaChangeForField,
  } = useForm<CommentFormFields>({
    comment: ""
  });

  const onSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();

    console.log("TODO: handle fields");
    console.log({ fields });
  }, [fields]);

  return (
    <form onSubmit={onSubmit}>
      <textarea onChange={onTextareaChangeForField("comment")}>
        {fields.comment}
      </textarea>
      <button type="submit">
        Login
      </button>
    </form>
  );
};
```

### Handle selects

```typescript
import React, { FormEvent, useCallback } from "react";
import { useForm } from "@aminnairi/react-form";

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
```

### Handle files

```typescript
import React, { FormEvent, useCallback } from "react";
import { useForm } from "@aminnairi/react-form";

interface ProfileFormFields {
  picture: FileList | null;
}

export const App = () => {
  const {
    fields,
    onFileChangeForField,
  } = useForm<ProfileFormFields>({
    picture: null
  });

  const onSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();

    console.log("TODO: handle fields");
    console.log({ fields });
  }, [fields]);

  return (
    <form onSubmit={onSubmit}>
      <input type="file" onChange={onFileChangeForField("picture")} />
      <button type="submit">
        Login
      </button>
    </form>
  );
};
```

### Handle errors

```typescript
import React, { FormEvent, useCallback } from "react";
import { useForm } from "@aminnairi/react-form";

interface LoginFormFields {
  email: string;
  password: string;
}

export const App = () => {
  const {
    fields,
    errors,
    setErrorForField,
    resetErrors,
    onInputChangeForField,
    hasErrorForField
  } = useForm<LoginFormFields>({
    email: "",
    password: ""
  });

  const onSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();
    resetErrors();

    if (!fields.email.includes("@")) {
      setErrorForField("email", "Must be a valid email address");
    }

    if (fields.password.length < 8) {
      setErrorForField("password", "Must be at least 8 characters");
    }
  }, [fields]);

  return (
    <form onSubmit={onSubmit}>
      <input
        type="email"
        value={fields.email}
        onChange={onInputChangeForField("email")} />
      {hasErrorForField("email") && (
        <small>
          {errors.email}
        </small>
      )}
      <input
        type="password"
        value={fields.password}
        onChange={onInputChangeForField("password")} />
      {hasErrorForField("email") && (
        <small>
          {errors.email}
        </small>
      )}
      <button type="submit">
        Login
      </button>
    </form>
  );
};
```

### Handle initial pristine state

This will let you control the display whenever the form is pristine. A pristine form is a form whose fields have not been updated yet by the user.

```typescript
import React, { FormEvent, useCallback } from "react";
import { useForm } from "@aminnairi/react-form";

interface LoginFormFields {
  email: string;
  password: string;
}

export const App = () => {
  const {
    fields,
    pristine,
    onInputChangeForField,
  } = useForm<LoginFormFields>({
    email: "",
    password: ""
  });

  const onSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();

    console.log("TODO: handle fields");
    console.log({ fields });
  }, [fields]);

  return (
    <form onSubmit={onSubmit}>
      <input
        type="email"
        value={fields.email}
        onChange={onInputChangeForField("email")} />
      <input
        type="password"
        value={fields.password}
        onChange={onInputChangeForField("password")} />
      <button type="submit" disabled={pristine}>
        Login
      </button>
    </form>
  );
};
```

### Handle dirty state

This will let you control the display whenever the form is dirty. A dirty form is a form whose fields have been updated by the user.

```typescript
import React, { FormEvent, useCallback } from "react";
import { useForm } from "@aminnairi/react-form";

interface LoginFormFields {
  email: string;
  password: string;
}

export const App = () => {
  const {
    fields,
    dirty,
    errors,
    onInputChangeForField,
    setErrorForField,
    hasErrorForField
  } = useForm<LoginFormFields>({
    email: "",
    password: ""
  });

  const onSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();

    if (!fields.email.includes("@")) {
      setErrorForField("email", "Email must include @");
    }

    if (fields.password.length < 8) {
      setErrorForField("password", "Password must be at least 8 characters");
    }
  }, [fields]);

  return (
    <form onSubmit={onSubmit}>
      <input
        type="email"
        value={fields.email}
        onChange={onInputChangeForField("email")} />
      {dirty && hasErrorForField("email") && (
        <small>
          {errors.email}
        </small>
      )}
      <input
        type="password"
        value={fields.password}
        onChange={onInputChangeForField("password")} />
      {dirty && hasErrorForField("password") && (
        <small>
          {errors.password}
        </small>
      )}
      <button type="submit">
        Login
      </button>
    </form>
  );
};
```

### Handle focus

This lets you focus a field programmatically. Useful for when an error occurs in one field to help the user get to the field quickly.

```typescript

import React, { FormEvent, useCallback } from "react";
import { useForm } from "@aminnairi/react-form";

interface LoginFormFields {
  email: string;
  password: string;
}

export const App = () => {
  const {
    fields,
    errors,
    refs,
    onInputChangeForField,
    setErrorForField,
    hasErrorForField,
    focusField
  } = useForm<LoginFormFields>({
    email: "",
    password: ""
  });

  const onSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();

    if (!fields.email.includes("@")) {
      setErrorForField("email", "Email must include @");
      focusField("email");
    }

    if (fields.password.length < 8) {
      setErrorForField("password", "Password must be at least 8 characters");
      focusField("password");
    }
  }, [fields]);

  return (
    <form onSubmit={onSubmit}>
      <input
        type="email"
        value={fields.email}
        onChange={onInputChangeForField("email")}
        ref={refs.email} />
      {hasErrorForField("email") && (
        <small>
          {errors.email}
        </small>
      )}
      <input
        type="password"
        value={fields.password}
        onChange={onInputChangeForField("password")}
        ref={refs.password} />
      {hasErrorForField("password") && (
        <small>
          {errors.password}
        </small>
      )}
      <button type="submit">
        Login
      </button>
    </form>
  );
};
```
