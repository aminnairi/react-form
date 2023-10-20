# @aminnairi/react-form

Form utilities for React written in TypeScript

[![version](https://img.shields.io/npm/v/%40aminnairi/react-form)](https://npmjs.com/package/@aminnairi/react-form) [![types](https://img.shields.io/npm/types/%40aminnairi%2Freact-form)](https://github.com/aminnairi/react-form) [![](https://img.shields.io/bundlephobia/minzip/%40aminnairi/react-form)](https://bundlephobia.com/package/@aminnairi/react-form)


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
- Lifted state logic for you with full control over the UI logic
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

## Installation

```bash
npm uninstall @aminnairi/react-form
```

[Go back to summary](#summary)

## Usage

```tsx
import { RefObject, createRef, useCallback, useEffect } from "react";
import { SubmitCallbackInfered, useForm, noValidation, noTransformation } from "@aminnairi/react-form";

// Define your fields as a type
type Fields = {
  readonly name: string,
  readonly country: "fr" | "en" | "es",
  readonly age: number,
  readonly aggreed: boolean,
  readonly avatar: File,
}

// Define the references that will be used to control focus for your fields
type References = {
  readonly name: RefObject<HTMLInputElement>,
  readonly country: RefObject<HTMLSelectElement>,
  readonly age: RefObject<HTMLInputElement>,
  readonly aggreed: RefObject<HTMLInputElement>,
  readonly avatar: RefObject<HTMLInputElement>,
}

export default function App() {
  const { fields, touchedFields, errors, references, set, input, select, file, check, disabled, submit, dirty } = useForm<Fields, References>({
    // Fields must comply with the shape of your data
    fields: {
      // Fields can be strings
      name: "",
      country: "fr",
      // Or numbers
      age: 0,
      // Or boolean
      aggreed: false,
      // Or files (File and FileList)
      avatar: new File([], ""),
    },
    // Validation provide a mechanism for returning errors that you can plug
    // with your favorite data validation library like Zod, Joi, etc...
    validations: {
      // Validation always provide the entire fields object
      name: (value, fields) => {
        // So that you can check for errors with other fields inside one field
        // as well
        if (value === fields.country) {
          return "The name should be different from the country";
        }

        // Return an empty string if you don't have any errors
        return "";
      },
      // You do not need to provide explicit validation for each field
      country: noValidation,
      // But this is a good way of sending feedback via errors
      aggreed: (value) => {
        // Values are correctly infered from the Fields type to prevent typing
        // mistsakes
        if (value !== true) {
          return "You must agree the terms of use"
        }

        // Return an empty string if you don't have any errors
        return "";
      },
      avatar: (value) => {
        const fiftyKb = 50000;

        // You can validate files from the client side
        if (value.size > fiftyKb) {
          // Pretty useful to unload the server, isn't it?
          return "File is too large";
        }

        // Here, no errors so an empty string
        return "";
      },
    },
    // Transformation are useful if you need to restrain the input from a user
    transformations: {
      // You don't need to provide transformation for each field
      name: noTransformation,
      // Fields that have no transformation will simply get the raw value from
      // the user
      country: noTransformation,
      // But this is always a good thing to provide some transformation to
      // prevent user's mistaskes
      age: (value, fields) => {
        // You also have access to all other properties here
        if (fields.country ==== "fr") {
          // So that you can have complex transformation for your field
          if (value < 18) {
            return 18;
          }

          if (value > 50) {
            return 50;
          }
        } 

        // You may want different transformation based on the value of other
        // fields for instance
        if (fields.country === "es") {
          if (value < 16) {
            return 16;
          }

          if (value > 60) {
            return 60;
          }
        }

        return value;
      },
      // Again no explicit transformation is required if you don't want
      aggreed: noTransformation,
      // Simply call this function to disable transformation
      avatar: noTransformation,
    },
    // References are used to focus the first field that has an error when
    // submitting the form, this means that you must not disable the submit
    // button to have this feature
    references: {
      // This is always the same function that is called
      name: createRef(),
      // Because we need to get a reference
      country: createRef(),
      // To those elements
      age: createRef(),
      // In order to trigger the HTMLElement.focus
      aggreed: createRef(),
      // Function and focus the first field that may have an error, you can
      // always disable the submit button whenever the form has errors in order
      // to disable this behavior
      avatar: createRef()
    }
  });

  // Here we use the SubmitCallbackInfered in order to "guess" the fields that
  // are used in this form but this may be a bit overkill if you already defined
  // your fields by hand using the generic argument and you may want to simply
  // create a function that has the Fields as argument without calling this
  // TypeScript utility type
  const request: SubmitCallbackInfered<typeof submit> = useCallback((fields) => {
    // The function is purposely made for requesting data from your server using
    // asynchronous requests sur as Fetch or Axios, and the default behavior of
    // the browser sending an HTTP request is automatically prevented when
    // passing this function to the submit function (see below)
    console.log(fields.age);
  }, []);

  useEffect(() => {
    // Use the set function if you need to manually set fields, this is great
    // for when you want to display a details page with a form to update an item
    // and want to provide the user with some initial data that may be requested
    // from an asynchronous HTTP request, in this case the set function is
    // useful
    set("age", 10);
    set("name", "Jean");
    // Do not put `set` in the dependencies array, otherwise you'll create an
    // infinite loop, you  can disable the
    // eslint-plugin-react-hook/rules-of-hook rule if you'd like
  }, []);

  return (
    <form onSubmit={submit(request)}>
      {/* dirty is a boolean that will be true whenever the user has changed one
      of the field in the form */}
      {dirty && <small>This is a hint information.</small>}
      {/* disabled on the other hand is a boolean that is true whenever one of
      the field has an error, this is pretty useful if you need to disable the
      entire form until the user has made the correct input but remember that by
      doing so, you disable the auto focus feature that allows a user to quickly
      navigate through errors when the form is submitted */}
      {disabled && <small>Form contains error, please check your inputs</small>}
      <div>
        {/* the references property contains all properties defined in the
        References type that allow you to plug a React ref to an element, and
        whenever the user has an error in another field, by typing enter or by
        submitting the form, the reference will be used to focus the field that
        has an error, of course this won't work if you don't add it manually in
        the JSX code so don't forget it! */}
        <input ref={references.name} type="text" value={fields.name} onChange={input("name")} />
        {touchedFields.name && <small style={{ color: "red" }}>{errors.name}</small>}
      </div>
      <div>
        {/* The input function will contain a nice utility function that will
        help you quickly update any field that is an HTMLInputElement, and this
        input will be controlled by its field value here in the fields property */}
        <input ref={references.age} type="number" value={fields.age} onChange={input("age")} />
        {touchedFields.age && <small style={{ color: "red" }}>{errors.age}</small>}
      </div>
      <div>
        <label htmlFor="aggreed">Aggreed</label>
        {/* The check function is another utility function that will help you
        check out checkboxes quickly without the hassle of defining your own
        update function for checkboxes, remember that checkboxes have the
        checked property that will be used instead of the value! */}
        <input ref={references.aggreed} id="aggreed" type="checkbox" checked={fields.aggreed} onChange={check("aggreed")} />
        {/* the touchedFields property is here to help you know whether a field
        has been touched, this is similar to the dirty property, except it is
        used on a per-field basis */}
        {touchedFields.aggreed && <small style={{ color: "red" }}>{errors.aggreed}</small>}
      </div>
      <div>
        {/* The select function is here to help you work with selects in the
        same fashion as the input or check functions, it works solely on select
        fields so that it will update the value correctly for our elements that
        needs selection */}
        <select value={fields.country} onChange={select("country")} ref={references.country}>
          <option value="fr">France</option>
          <option value="es">Spain</option>
          <option value="en">England</option>
        </select>
        {touchedFields.country && <small style={{ color: "red" }}>{errors.country}</small>}
      </div>
      <div>
        {/* You can of course have files in your forms as well! You can use the
        file function for a unique file, or the files function for a list of
        files to upload to your server, watch out for files because you don't
        need to provide a value for these fields, only the onChange function is
        necesssary here */}
        <input type="file" onChange={file("avatar")} ref={references.avatar} />
        {touchedFields.avatar && <small style={{ color: "red" }}>{errors.avatar}</small>}
      </div>
      <button type="submit">
        Submit
      </button>
    </form>
  );
}
```

[Go back to summary](#summary)

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md).

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