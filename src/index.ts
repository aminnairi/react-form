import { ChangeEvent, ChangeEventHandler, FormEventHandler, RefObject, useCallback, useMemo, useState } from "react";

export type UseFormFields = Record<string, string | number | boolean | File | FileList>

export type UseFormValidations<Fields> = {
  readonly [Key in keyof Fields]: (value: Fields[Key], fields: Fields) => string
}

export type UseFormErrors<Fields> = Exclude<{
  readonly [Key in keyof Fields]: string
}, void>

export type UseFormTransformations<Fields> = {
  readonly [Key in keyof Fields]: (value: Fields[Key], fields: Fields) => Fields[Key]
}

export type UseFormReferences<Fields, Reference> = {
  readonly [Key in keyof Fields]: RefObject<Reference>
}

export type UseFormTouchedFields<Fields> = Exclude<{
  readonly [Key in keyof Fields]: boolean
}, void>

export type SubmitCallbackInfered<SubmitCallback> = SubmitCallback extends (callback: (fields: infer Fields) => void) => FormEventHandler ? (fields: Fields) => void : never;

export type UseFormOptions<Fields, References> = {
  fields: Fields,
  references: References,
  validations: UseFormValidations<Fields>,
  transformations: UseFormTransformations<Fields>,
}

export const useForm = <Fields extends UseFormFields, References extends UseFormReferences<Fields, Reference>, Reference extends HTMLElement = HTMLElement>(options: UseFormOptions<Fields, References>) => {
  const [fields, setFields] = useState(options.fields);

  const errors = useMemo(<Key extends keyof Fields>() => {
    const entries = Object.entries(fields) as [Key, Fields[Key]][];
    const errorsEntries = entries.map(([key, value]) => [key, options.validations[key](value, fields)]);
    const errors = Object.fromEntries(errorsEntries) as UseFormErrors<Fields>;
    
    return errors;
  }, [fields, options.validations]);

  const disabled = useMemo(() => {
    const errorsValues = Object.values(errors)
    const disabled = errorsValues.some(error => error)
    return disabled;
  }, [errors]);

  const [touchedFields, setTouchedFields] = useState(<Key extends keyof Fields>() => {
    const entries = Object.keys(fields) as Key[];
    const touchedEntries = entries.map((key) => [key, false]) as [Key, boolean][];
    const touched = Object.fromEntries(touchedEntries) as UseFormTouchedFields<Fields>;

    return touched;
  });

  const dirty = useMemo(() => {
    const touchedFieldsValues = Object.values(touchedFields);
    const dirty = touchedFieldsValues.some((touchedField) => touchedField);

    return dirty;
  }, [touchedFields]);

  const set = useCallback(<Key extends keyof Fields>(key: Key, value: Fields[Key]) => {
    const transformation = options.transformations[key];

    setFields(oldFields => ({
      ...oldFields,
      [key]: transformation(value, oldFields)
    }));
  }, [options.transformations]);

  const focus = useCallback(<Key extends keyof Fields>(key: Key) => {
    options.references[key].current?.focus();
  }, [options.references]);

  const input = useCallback(<Key extends keyof Fields>(key: Key) => (event: ChangeEvent<HTMLInputElement>) => {
    const transformation = options.transformations[key];
    const value = event.target.value as Fields[Key];

    setFields(oldFields => ({
      ...oldFields,
      [key]: transformation(value, oldFields)
    }));

    setTouchedFields(oldTouchedFields => ({
      ...oldTouchedFields,
      [key]: true
    }))
  }, [options.transformations]);

  const select = useCallback(<Key extends keyof Fields>(key: Key) => (event: ChangeEvent<HTMLSelectElement>) => {
    const transformation = options.transformations[key];
    const value = event.target.value as Fields[Key];

    setFields(oldFields => ({
      ...oldFields,
      [key]: transformation(value, oldFields)
    }));

    setTouchedFields(oldTouchedFields => ({
      ...oldTouchedFields,
      [key]: true
    }))
  }, [options.transformations]);
  
  const check = useCallback(<Key extends keyof Fields>(key: Key) => (event: ChangeEvent<HTMLInputElement>) => {
    const transformation = options.transformations[key];
    const value = event.target.checked as Fields[Key];

    setFields(oldFields => ({
      ...oldFields,
      [key]: transformation(value, oldFields)
    }));

    setTouchedFields(oldTouchedFields => ({
      ...oldTouchedFields,
      [key]: true
    }))
  }, [options.transformations]);

  const file = useCallback(<Key extends keyof Fields>(key: Key) => (event: ChangeEvent<HTMLInputElement>) => {
    const transformation = options.transformations[key];
    const value = (event.target.files?.[0] ?? new File([], "")) as Fields[Key]

    setFields(oldFields => ({
      ...oldFields,
      [key]: transformation(value, oldFields)
    }));

    setTouchedFields(oldTouchedFields => ({
      ...oldTouchedFields,
      [key]: true
    }))
  }, [options.transformations]);

  const files = useCallback(<Key extends keyof Fields>(key: Key): ChangeEventHandler<HTMLInputElement> => (event) => {
    const transformation = options.transformations[key];
    const value = event.target.files as Fields[Key];

    setFields(oldFields => ({
      ...oldFields,
      [key]: transformation(value, oldFields)
    }));

    setTouchedFields(oldTouchedFields => ({
      ...oldTouchedFields,
      [key]: true
    }))
  }, [options.transformations]);

  const submit = useCallback(<Key extends keyof Fields>(callback: (fields: Fields) => void): FormEventHandler<HTMLFormElement> => event => {
    event.preventDefault();

    setTouchedFields(oldTouchedFields => {
      const oldTouchedFieldsEntries = Object.entries(oldTouchedFields) as [Key, Fields[Key]][];
      const oldTouchedFieldsEntriesEnabled = oldTouchedFieldsEntries.map(([key]) => [key, true]) as [Key, boolean][];
      const newTouchedFields = Object.fromEntries(oldTouchedFieldsEntriesEnabled) as UseFormTouchedFields<Fields>;

      return newTouchedFields;
    })

    if (disabled) {
      const errorsEntries = Object.entries(errors) as [Key, string][];
      const firstErrorFound = errorsEntries.find(([, error]) => !!error);

      
      if (firstErrorFound) {
        const [key] = firstErrorFound;

        focus(key);
      }

      return;
    }

    callback(fields);

  }, [disabled, fields, errors, focus]);

  return {
    fields,
    touchedFields,
    dirty,
    disabled,
    errors,
    references: options.references,
    set,
    input,
    select,
    check,
    file,
    files,
    focus,
    submit
  };
};

export const noValidation = () => "";

export const noTransformation = <Value>(value: Value) => value;