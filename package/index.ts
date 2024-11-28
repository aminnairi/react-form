import { ChangeEvent, Dispatch, FormEvent, MutableRefObject, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";

export function immediately<Output>(callback: (...input: never[]) => Output): Output {
  return callback();
}

export class ValidationError extends Error {
  public override readonly name = "ValidationError";

  public constructor(public readonly error: Error) {
    super();
  }
}

export class RequiredError extends Error {
  public override readonly name = "RequiredError";
}

export class SubmissionError extends Error {
  public override readonly name = "SubmissionError";

  public constructor(public readonly error: Error) {
    super()
  }
}

export interface UseFormField<GenericValue, GenericEvent, GenericError> {
  value: GenericValue,
  required?: boolean,
  onEvent: (event: GenericEvent) => GenericValue,
  validation?: (options: { value: GenericValue, signal: AbortSignal }) => Promise<GenericError | null>,
  transformation?: (value: GenericValue) => GenericValue
}

export interface FormField<GenericValue, GenericElement, GenericEvent, GenericError> {
  value: GenericValue,
  validating: boolean
  required: boolean,
  error: GenericError | ValidationError | RequiredError | null
  touched: boolean
  setTouched: Dispatch<SetStateAction<boolean>>
  ref: MutableRefObject<GenericElement | null>,
  onChange: (event: GenericEvent) => void
  reset: () => void
  resetError: () => void,
  focus: () => void
}

export const useFormField = <GenericValue, GenericElement, GenericEvent, GenericError = never>(options: UseFormField<GenericValue, GenericEvent, GenericError>): FormField<GenericValue, GenericElement, GenericEvent, GenericError> => {
  const [value, setValue] = useState(options.value);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<GenericError | ValidationError | RequiredError | null>(null);
  const [touched, setTouched] = useState(false);
  const ref: MutableRefObject<GenericElement | null> = useRef(null);
  const abortControllerRef = useRef(new AbortController);

  const onChange = useCallback((event: GenericEvent) => {
    const transformation = options?.transformation ?? (value => value);

    setTouched(true);
    setValue(transformation(options.onEvent(event)));
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setTouched(false);
    setError(null);
    setValue(options.value);
  }, []);

  const focus = useCallback(() => {
    if (ref.current instanceof HTMLInputElement) {
      ref.current.focus();
    }
  }, [ref]);

  useEffect(() => {
    if (options.required && !value) {
      setError(new RequiredError);
      return;
    }

    if (!options.validation) {
      setError(null);
      return;
    }

    setValidating(true);
    abortControllerRef.current = new AbortController;

    options.validation({ value, signal: abortControllerRef.current.signal }).then(result => {
      if (!result) {
        setError(null);
        return;
      }

      setError(result);
    }).catch(error => {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setError(new ValidationError(normalizedError));
    }).finally(() => {
      setValidating(false);
    });

    return () => {
      abortControllerRef.current.abort();
    }
  }, [options.required, value]);

  return {
    value,
    required: options.required ?? false,
    onChange,
    validating,
    error,
    reset,
    resetError,
    touched,
    setTouched,
    ref,
    focus
  };
};

export interface UseTextField<GenericError> extends Omit<UseFormField<string, HTMLInputElement, GenericError>, "onEvent"> { }

export interface TextField<GenericError> extends FormField<string, HTMLInputElement, ChangeEvent<HTMLInputElement>, GenericError> { }

export const useTextField = <GenericError = never>(options: UseTextField<GenericError>): TextField<GenericError> => {
  return useFormField({
    ...options,
    onEvent: event => event.target.value
  });
};

export interface UseNumberField<GenericError> extends Omit<UseFormField<number, HTMLInputElement, GenericError>, "onEvent"> { }

export interface NumberField<GenericError> extends FormField<number, HTMLInputElement, ChangeEvent<HTMLInputElement>, GenericError> { }

export const useNumberField = <GenericError = never>(options: UseNumberField<GenericError>): NumberField<GenericError> => {
  return useFormField({
    ...options,
    onEvent: event => Number(event.target.value) || 0,
  });
};

export interface UseCheckboxField<GenericError> extends Omit<UseFormField<boolean, HTMLInputElement, GenericError>, "onEvent"> { }

export interface CheckboxField<GenericError> extends FormField<boolean, HTMLInputElement, ChangeEvent<HTMLInputElement>, GenericError> { }

export const useCheckboxField = <GenericError = never>(options: UseCheckboxField<GenericError>): CheckboxField<GenericError> => {
  return useFormField({
    ...options,
    onEvent: event => event.target.checked
  });
};

export interface UseDateField<GenericError> extends Omit<UseFormField<Date, HTMLInputElement, GenericError>, "onEvent"> { }

export interface DateField<GenericError> extends FormField<Date, HTMLInputElement, ChangeEvent<HTMLInputElement>, GenericError> { }

export const useDateField = <GenericError = never>(options: UseDateField<GenericError>): DateField<GenericError> => {
  return useFormField({
    ...options,
    onEvent: event => new Date(event.target.value)
  });
};

export function toHtmlDate(date: Date) {
  return date.toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export interface UseFileField<GenericError> extends Omit<UseFormField<File, HTMLInputElement, GenericError>, "onEvent"> { }

export interface FileField<GenericError> extends FormField<File, HTMLInputElement, ChangeEvent<HTMLInputElement>, GenericError> { }

export const useFileField = <GenericError = never>(options: UseFileField<GenericError>): FileField<GenericError> => {
  return useFormField({
    ...options,
    onEvent: event => {
      if (event.target.files) {
        const file = event.target.files[0];

        if (!file) {
          return new File([], "");
        }

        return file;
      }

      return new File([], "");
    }
  });
};

export type FormFields<GenericError> = Record<string, NumberField<GenericError> | TextField<GenericError> | CheckboxField<GenericError> | DateField<GenericError> | FileField<GenericError>>

export interface UseFormOptions<GenericSubmissionError, GenericError, Fields extends FormFields<GenericError>> {
  fields: Fields,
  onSubmit: (fields: FormValues<GenericError, Fields>) => Promise<GenericSubmissionError | SubmissionError | void>
}

export type FormValues<GenericError, Fields extends FormFields<GenericError>> = {
  [Key in keyof Fields]: Fields[Key]["value"]
}

export type FormSubmit = (event: FormEvent) => void

export interface Form<GenericSubmissionError, GenericError, Fields extends FormFields<GenericError>> {
  touched: boolean,
  hasError: boolean,
  validating: boolean,
  reset: () => void,
  resetError: () => void,
  values: FormValues<GenericError, Fields>,
  submit: FormSubmit
  submitting: boolean,
  resetSubmitError: () => void,
  submitError: GenericSubmissionError | SubmissionError | void
}

export const useForm = <GenericSubmissionError, GenericError, Fields extends FormFields<GenericError>>(options: UseFormOptions<GenericSubmissionError, GenericError, Fields>): Form<GenericSubmissionError, GenericError, Fields> => {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<GenericSubmissionError | SubmissionError | void>(undefined);

  const touched = useMemo(() => {
    return Object.values(options.fields).some((field) => {
      return field.touched;
    });
  }, [options.fields]);

  const hasError = useMemo(() => {
    return Object.values(options.fields).some((field) => {
      return field.error !== null;
    });
  }, [options.fields]);

  const validating = useMemo(() => {
    return Object.values(options.fields).some(field => {
      return field.validating;
    });
  }, [options.fields]);

  const reset = useCallback(() => {
    setSubmitError(undefined);

    Object.values(options.fields).forEach(field => {
      field.reset();
    });
  }, [options.fields]);

  const resetError = useCallback(() => {
    Object.values(options.fields).forEach(field => {
      field.resetError();
    });
  }, [options.fields]);

  const resetSubmitError = useCallback(() => {
    setSubmitError(undefined);
  }, []);

  const values = useMemo(() => {
    return Object.fromEntries(Object.entries(options.fields).map(([fieldName, field]) => {
      return [fieldName, field.value];
    })) as FormValues<GenericError, Fields>;
  }, [options.fields]);

  const submit: FormSubmit = useCallback(async (event) => {
    try {
      event.preventDefault();
      setSubmitting(true);
      setSubmitError(undefined);

      Object.values(options.fields).forEach(field => field.setTouched(true));

      const invalidField = Object.values(options.fields).find(field => {
        return field.error;
      });

      if (invalidField) {
        invalidField.focus();
        return;
      }

      const values = Object.fromEntries(Object.entries(options.fields).map(([fieldName, field]) => {
        return [fieldName, field.value];
      })) as FormValues<GenericError, Fields>;

      const error = await options.onSubmit(values);

      if (!error) {
        return;
      }

      setSubmitError(error);
    } catch (error) {
      const normalizedError = error instanceof Error ? new SubmissionError(error) : new SubmissionError(new Error(String(error)));
      setSubmitError(normalizedError);
    } finally {
      setSubmitting(false);
    }
  }, [hasError, options.fields]);

  return {
    touched,
    hasError,
    validating,
    reset,
    resetError,
    values,
    submit,
    submitError,
    submitting,
    resetSubmitError
  };
};

export function useAsyncDebouncedCallback(delay: number) {
  let timeoutIdentifier: number | undefined = undefined;

  return useCallback(<Output>(callback: () => Promise<Output>) => {
    return new Promise<Output>((resolve, reject) => {
      window.clearTimeout(timeoutIdentifier);

      timeoutIdentifier = window.setTimeout(() => {
        callback().then(resolve).catch(reject);
      }, delay);
    });
  }, []);
}
