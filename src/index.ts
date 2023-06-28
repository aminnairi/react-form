import { ChangeEvent, useState, useMemo, useCallback, useRef, RefObject } from "react";

export type FormErrors<FormFields> = { [Key in keyof FormFields]: string }

export type FormRefs<FormFields> = { [Key in keyof FormFields]: RefObject<any> }

export const useForm = <FormFields extends object>(initialFields: FormFields) => {
  const [pristine, setPristine] = useState(true);
  const [fields, setFields] = useState(initialFields);

  const dirty = useMemo(() => !pristine, [pristine]);

  const [errors, setErrors] = useState(Object.fromEntries(Object.entries(initialFields).map(([fieldKey]) => {
    return [
      fieldKey,
      ""
    ]
  })) as FormErrors<FormFields>);

  const refs = Object.fromEntries(Object.entries(initialFields).map(([fieldKey]) => {
    return [
      [fieldKey],
      useRef(null)
    ];
  })) as FormRefs<FormFields>

  const hasErrors = useMemo(() => {
    return Object.values(errors).some(error => error !== "");
  }, [errors]);

  const hasErrorForField = useCallback((fieldName: keyof FormFields) => {
    return errors[fieldName].trim() !== "";
  }, [errors]);

  const setErrorForField = useCallback((fieldName: keyof FormFields, error: string) => {
    setErrors(oldErrors => ({
      ...oldErrors,
      [fieldName]: error
    }));
  }, []);

  const resetErrors = useCallback(() => {
    setErrors(Object.fromEntries(Object.entries(initialFields).map(([fieldKey]) => {
      return [
        fieldKey,
        ""
      ]
    })) as FormErrors<FormFields>);
  }, []);

  const onInputChangeForField = useCallback((fieldName: keyof FormFields) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setPristine(false);

      setFields(oldFields => ({
        ...oldFields,
        [fieldName]: event.target.value
      }));
    };
  }, [])

  const onCheckboxChangeForField = useCallback((fieldName: keyof FormFields) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setPristine(false);

      setFields(oldFields => ({
        ...oldFields,
        [fieldName]: event.target.checked
      }));
    };
  }, [])

  const onTextareaChangeForField = useCallback((fieldName: keyof FormFields) => {
    return (event: ChangeEvent<HTMLTextAreaElement>) => {
      setPristine(false);

      setFields(oldFields => ({
        ...oldFields,
        [fieldName]: event.target.value
      }));
    };
  }, []);

  const onFileChangeForField = useCallback((fieldName: keyof FormFields) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setPristine(false);

      setFields(oldFields => ({
        ...oldFields,
        [fieldName]: event.target.files
      }));
    };
  }, []);

  const onSelectChangeForField = useCallback((fieldName: keyof FormFields) => {
    return (event: ChangeEvent<HTMLSelectElement>) => {
      setPristine(false);

      setFields(oldFields => ({
        ...oldFields,
        [fieldName]: event.target.value
      }));
    };
  }, []);

  const focusField = useCallback((fieldName: keyof FormFields) => {
    refs[fieldName]?.current?.focus();
  }, [refs]);

  return {
    fields,
    errors,
    pristine,
    dirty,
    refs,
    hasErrors,
    hasErrorForField,
    setErrorForField,
    setPristine,
    setErrors,
    resetErrors,
    onInputChangeForField,
    onCheckboxChangeForField,
    onTextareaChangeForField,
    onFileChangeForField,
    onSelectChangeForField,
    focusField,
    setFields
  };
};
