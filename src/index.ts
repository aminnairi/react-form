import { ChangeEventHandler, FormEventHandler, RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { D as Dict, A as List } from "@mobily/ts-belt";

export type Validations<Fields extends object> = {
  readonly [Key in keyof Fields]?: (value: Fields[Key], fields: Fields) => string | null
}

export type Transformations<Fields extends object> = {
  readonly [Key in keyof Fields]?: (value: Fields[Key]) => Fields[Key]
}

export type Refs<Fields extends object> = undefined | {
  readonly [Key in keyof Fields]?: RefObject<HTMLElement>
}

export interface Options<Fields extends Readonly<object>, FieldsRefs extends Refs<Fields>> {
  fields: Fields
  transformations?: Transformations<Fields>
  validations?: Validations<Fields>,
  refs?: FieldsRefs
}

export const useForm = <Fields extends object, FieldsRefs extends Refs<Fields> = undefined>(options: Options<Fields, FieldsRefs>) => {
  const [fields, setFields] = useState(options.fields);

  const [touched, setTouched] = useState(() => {
    return Dict.fromPairs(List.map(Dict.toPairs(options.fields), ([fieldName]) => {
      return [
        fieldName,
        false
      ];
    })) as Record<keyof Fields, boolean>;
  });

  const [errors, setErrors] = useState(() => {
    return Dict.fromPairs(List.map(Dict.toPairs(options.fields), ([fieldName]): [string, string | null] => {
      return [
        fieldName,
        null
      ];
    }));
  });

  const untouched = useMemo(() => {
    return Dict.fromPairs(List.map(Dict.toPairs(touched), ([fieldName, fieldTouched]) => {
      return [
        fieldName,
        !fieldTouched
      ];
    })) as Record<keyof Fields, boolean>;
  }, [touched]);

  const dirty = useMemo(() => {
    return List.some(Dict.values(touched), touchedField => touchedField);
  }, [touched]);

  const pristine = useMemo(() => !dirty, [dirty]);

  const disabled = useMemo(() => {
    return Object.values(errors).some((error) => {
      return typeof error === "string" && error.trim().length !== 0;
    });
  }, [errors]);

  const hasError = useMemo<Record<keyof Fields, boolean>>(() => {
    return Dict.fromPairs(List.map(Dict.toPairs(errors), ([fieldName, error]) => {
      return [
        fieldName,
        typeof error === "string"
      ];
    })) as Record<keyof Fields, boolean>;
  }, [errors]);

  const reset = useCallback(() => {
    setFields(options.fields);
  }, []);

  const set = useCallback((fieldName: keyof Fields, value: Fields[typeof fieldName]) => {
    setFields(oldField => {
      return {
        ...oldField,
        [fieldName]: value
      }
    });
  }, []);

  const focus = useCallback((fieldName: keyof Fields) => {
    options?.refs?.[fieldName as keyof Fields]?.current?.focus();
  }, [options.refs]);

  const change = useCallback((field: keyof Fields): ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> => event => {
    setTouched(oldTouched => {
      return {
        ...oldTouched,
        [field]: true
      };
    });

    setFields(oldFields => {
      const value = event.target.value as Fields[keyof Fields];
      const defaultTransformation = (value: unknown) => value;
      const transformation = options?.transformations?.[field] || defaultTransformation;

      return {
        ...oldFields,
        [field]: transformation(value)
      };
    });
  }, [options.transformations]);

  const store = useCallback((field: keyof Fields): ChangeEventHandler<HTMLInputElement> => event => {
    setTouched(oldTouched => {
      return {
        ...oldTouched,
        [field]: true
      };
    });

    setFields(oldFields => {
      const value = event.target.files as Fields[keyof Fields];
      const defaultTransformation = (value: unknown) => value;
      const transformation = options?.transformations?.[field] || defaultTransformation;

      return {
        ...oldFields,
        [field]: transformation(value)
      };
    });
  }, [options.transformations]);

  const select = useCallback((field: keyof Fields): ChangeEventHandler<HTMLSelectElement> => event => {
    setTouched(oldTouched => {
      return {
        ...oldTouched,
        [field]: true
      };
    });

    setFields(oldFields => {
      const value = event.target.value as Fields[keyof Fields];
      const defaultTransformation = (value: unknown) => value;
      const transformation = options?.transformations?.[field] || defaultTransformation;

      return {
        ...oldFields,
        [field]: transformation(value)
      };
    });
  }, [options.transformations]);

  const check = useCallback((field: keyof Fields): ChangeEventHandler<HTMLInputElement> => event => {
    setTouched(oldTouched => {
      return {
        ...oldTouched,
        [field]: true
      };
    });

    setFields(oldFields => {
      const value = event.target.checked as Fields[keyof Fields];
      const defaultTransformation = (value: unknown) => value;
      const transformation = options?.transformations?.[field] || defaultTransformation;

      return {
        ...oldFields,
        [field]: transformation(value)
      };
    });
  }, [options.transformations]);

  const onSubmit = useCallback((callback: (fields: Fields) => void): FormEventHandler => (event) => {
    event.preventDefault();

    setErrors(() => {
      setTouched(oldTouched => {
        return Dict.fromPairs(List.map(Dict.toPairs(oldTouched), ([fieldName]) => {
          return [
            fieldName,
            true
          ];
        })) as Record<keyof Fields, boolean>;
      });

      const newErrors = Dict.fromPairs(List.map(Dict.toPairs(fields), ([fieldName]) => {
        const value = fields[fieldName as keyof Fields];
        const defaultTransformation = () => null;
        const transformation = options?.validations?.[fieldName as keyof Fields] ?? defaultTransformation;

        return [
          fieldName,
          transformation(value, fields)
        ];
      })) as Record<keyof Fields, string | null>;

      const foundFieldWithError = List.find(Dict.toPairs(newErrors), ([, error]) => {
        return error !== null;
      });

      if (foundFieldWithError) {
        focus(foundFieldWithError[0] as keyof Fields);
      } else {
        callback(fields);
      }

      return newErrors;
    });

  }, [fields, options.validations, options.refs]);

  useEffect(() => {
    setErrors(Dict.fromPairs(List.map(Dict.toPairs(fields), ([fieldName, fieldValue]) => {
      const value = fieldValue as Fields[keyof Fields];
      const defaultValidation = () => null;
      const validation = options?.validations?.[fieldName as keyof Fields] ?? defaultValidation;

      return [
        fieldName,
        validation(value, fields)
      ];
    })));
  }, [fields, options.validations]);

  return {
    fields,
    errors,
    refs: options.refs,
    disabled,
    hasError,
    touched,
    untouched,
    change,
    check,
    select,
    store,
    onSubmit,
    dirty,
    pristine,
    reset,
    set,
    focus
  };
};

export type OnSubmitCallback<OnSubmit> = OnSubmit extends (callback: (fields: infer Fields) => void) => FormEventHandler ? (fields: Fields) => void : never