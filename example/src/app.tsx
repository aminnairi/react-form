import { SyntheticEvent, useMemo } from "react";
import { immediately, useAsyncDebouncedCallback, useForm, useCheckboxField, useNumberField, useTextField } from "@aminnairi/react-form";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormHelperText from "@mui/material/FormHelperText";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

class EmailInvalidError extends Error {
  public override readonly name = "EmailInvalidError";
}

class EmailAlreadyTakenError extends Error {
  public override readonly name = "EmailAlreadyTakenError";
}

class PasswordTooShortError extends Error {
  public override readonly name = "PasswordTooShortError";
}

class AgeTooLowError extends Error {
  public override readonly name = "AgeTooLowError";
}

class AgeTooHighError extends Error {
  public override readonly name = "AgeTooHighError";
}

class BadStatusError extends Error {
  public override readonly name = "BadStatusError";
}

export const App = () => {
  const debounceOneSecond = useAsyncDebouncedCallback(1000);

  const email = useTextField({
    value: "",
    required: true,
    transformation: email => email.trim().toLowerCase(),
    validation: async ({ value, signal }) => {
      if (!value.endsWith(".io")) {
        return new EmailInvalidError(value)
      }

      return debounceOneSecond(async () => {
        const response = await fetch("https://jsonplaceholder.typicode.com/users", { signal });
        const users = await response.json() as {email: string}[];
        const emailAlreadyTaken = users.find((user) => user.email === value);

        if (Math.random() > 0.5 || emailAlreadyTaken) {
          return new EmailAlreadyTakenError;
        }

        return null;
      });
    }
  });

  const emailError = useMemo<string>(() => {
    if (!email.touched) {
      return "Email address with extension .io";
    }

    if (email.validating) {
      return "Validating...";
    }

    if (!email.error) {
      return "";
    }

    switch (email.error.name) {
      case "EmailAlreadyTakenError":
        return "Email is already taken"

      case "EmailInvalidError":
        return "Email should end with .io"

      case "ValidationError":
        return "Validation failed"

      case "RequiredError":
        return "Email is mandatory"
    }
  }, [email.validating, email.error, email.touched]);

  const country = useTextField({
    value: "",
    required: true
  });

  const countryHelperText = useMemo<string>(() => {
    if (!country.touched || !country.error) {
      return "";
    }

    switch (country.error.name) {
      case "RequiredError":
        return "Country is required"

      case "ValidationError":
        return "Error while validating"
    }
  }, [country.error, country.touched]);

  const firstname = useTextField({
    value: "",
    transformation: value => value.trim()
  });

  const firstnameError = useMemo<string>(() => {
    if (!firstname.error) {
      return "";
    }

    switch (firstname.error.name) {
      case "RequiredError":
        return "First name is mandatory"

      case "ValidationError":
        return "";
    }
  }, [firstname.error]);

  const lastname = useTextField({
    value: "",
    transformation: value => value.trim(),
    required: firstname.value.trim().length !== 0
  });

  const lastnameError = useMemo<string>(() => {
    if (!lastname.error) {
      return "Adresse email valide";
    }

    switch (lastname.error.name) {
      case "ValidationError":
        return ""

      case "RequiredError":
        return "Last name is mandatory if the first name is filled"
    }
  }, [lastname.error]);

  const plan = useTextField({
    value: "",
    required: true
  });

  const planHelperText = useMemo<string>(() => {
    if (!plan.touched || !plan.error) {
      return "Select one plan";
    }

    switch (plan.error.name) {
      case "RequiredError":
        return "Plan type is mandatory";

      case "ValidationError":
        return "";
    }
  }, [plan.touched, plan.error]);

  const password = useTextField({
    value: "",
    required: true,
    validation: async ({ value }) => {
      if (value.length < 8) {
        return new PasswordTooShortError
      }

      return null;
    }
  });

  const passwordHelperText = useMemo<string>(() => {
    if (!password.touched || !password.error) {
      return "At least 8 characters long";
    }

    switch (password.error.name) {
      case "ValidationError":
        return "";

      case "RequiredError":
        return "Password is mandatory";

      case "PasswordTooShortError":
        return "Password is not long enough";
    }
  }, [password.touched, password.error]);

  const age = useNumberField({
    value: 0,
    validation: async ({ value }) => {
      if (value < 18) {
        return new AgeTooLowError
      }

      if (value > 60) {
        return new AgeTooHighError
      }

      return null;
    }
  });

  const ageHelperText = useMemo(() => {
    if (!age.touched || !age.error) {
      return "Must be between 18 and 60";
    }

    switch(age.error.name) {
      case "AgeTooHighError":
        return "Age cannot be greater than 60"

      case "AgeTooLowError":
        return "Age cannot be lower than 18"

      case "RequiredError":
        return "Age is mandatory"

      case "ValidationError":
        return ""
    }
  }, [age.touched, age.error]);

  const termsAccepted = useCheckboxField({
    value: false,
    required: true
  });

  const termsAcceptedHelperText = useMemo(() => {
    if (!termsAccepted.touched || !termsAccepted.error) {
      return "You must read the terms and conditions";
    }

    switch (termsAccepted.error.name) {
      case "RequiredError":
        return "Terms & conditions must be accepted"

      case "ValidationError":
        return ""
    }
  }, [termsAccepted.error, termsAccepted.touched]);

  const form = useForm({
    fields: {
      email,
      password,
      age,
      termsAccepted,
      plan,
      country
    },
    onSubmit: async () => {
      const response = await new Promise<Response>(resolve => {
        setTimeout(() => {
          if (Math.random() > 0.5) {
            resolve(new Response(null, {
              status: 400
            }));
          }

          resolve(new Response(null, {
            status: 200
          }));
        }, 5000);
      });

      if (!response.ok) {
        return new BadStatusError;
      }
    }
  });

  return (
    <Container>
      <Stack spacing={3}>
        {form.submitError !== undefined && (
          <Alert severity="error">
            {immediately<string>(() => {
              if (!form.submitError) {
                return ""
              }

              switch (form.submitError.name) {
                case "BadStatusError":
                  return "Bad status from the server"

                case "SubmissionError":
                  return "Error while submitting the form"
              }
            })}
          </Alert>
        )}
        <Stack component="form" onSubmit={form.submit} spacing={3}>
          <TextField
            label="First Name"
            value={firstname.value}
            onChange={firstname.onChange}
            inputRef={firstname.ref}
            disabled={form.submitting}
            error={!!firstname.error}
            helperText={firstnameError}
          />
          <TextField
            label="Last Name"
            value={lastname.value}
            onChange={lastname.onChange}
            inputRef={lastname.ref}
            disabled={form.submitting}
            error={!!lastname.error}
            helperText={lastnameError}
          />
          <TextField
            label="Email"
            value={email.value}
            onChange={email.onChange}
            inputRef={email.ref}
            disabled={form.submitting}
            error={!email.validating && email.touched && !!email.error}
            helperText={emailError}
          />
          <TextField
            label="Password"
            type="password"
            value={password.value}
            onChange={password.onChange}
            inputRef={password.ref}
            disabled={form.submitting}
            error={password.touched && !!password.error}
            helperText={passwordHelperText}
          />
          <TextField
            label="Age"
            type="number"
            value={age.value}
            onChange={age.onChange}
            inputRef={age.ref}
            disabled={form.submitting}
            error={age.touched && !!age.error}
            helperText={ageHelperText}
          />
          <FormControl error={!!termsAccepted.error}>
            <FormControlLabel
              label="Terms & Conditions Accepted"
              checked={termsAccepted.value}
              onChange={termsAccepted.onChange as (event: SyntheticEvent<Element, Event>) => void}
              control={<Checkbox />}
              inputRef={termsAccepted.ref} />
            <FormHelperText>{termsAcceptedHelperText}</FormHelperText>
          </FormControl>
          <FormControl error={plan.touched && !!plan.error} disabled={form.submitting}>
            <FormLabel id="plan-label">Plan Type</FormLabel>
            <RadioGroup name="plan" value={plan.value} onChange={plan.onChange}>
              <FormControlLabel label="Free" value="free" control={<Radio />} inputRef={plan.ref} />
              <FormControlLabel label="Paid" value="paid" control={<Radio />} />
              <FormControlLabel label="Premium" value="premium" control={<Radio />} />
            </RadioGroup>
            <FormHelperText>{planHelperText}</FormHelperText>
          </FormControl>
          <FormControl disabled={form.submitting} error={country.touched && !!country.error}>
            <FormHelperText>
              {countryHelperText}
            </FormHelperText>
            <FormControlLabel 
              label="Country" 
              control={
                <Select value={country.value} onChange={country.onChange as (event: SelectChangeEvent) => void} inputRef={country.ref}>
                  <MenuItem value="fr">
                    France
                  </MenuItem>
                  <MenuItem value="es">
                    Spain
                  </MenuItem>
                  <MenuItem value="en">
                    England
                  </MenuItem>
                </Select>
              }
            />
          </FormControl>
          <Button type="submit" disabled={form.submitting} variant="contained" sx={{ alignSelf: "center" }}>Login</Button>
        </Stack>
      </Stack>
    </Container >
  );
};
