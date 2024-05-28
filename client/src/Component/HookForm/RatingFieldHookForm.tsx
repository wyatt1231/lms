import { FormHelperText } from "@material-ui/core";
import { Rating, RatingProps } from "@material-ui/lab";
import React, { FC, memo } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface RatingHookFormProps {
  RatingProps: RatingProps;
}

export const RatingHookForm: FC<RatingProps> = memo((props) => {
  const { control, errors, getValues } = useFormContext();

  let error = false;
  let error_message = "";

  if (errors && errors?.hasOwnProperty(props?.name)) {
    error = true;
    error_message = errors[props?.name]?.message;
  }

  return (
    <Controller
      name={props.name}
      control={control}
      defaultValue={props.defaultValue}
      render={
        (
          { onChange, onBlur, value, name, ref },
          { invalid, isTouched, isDirty }
        ) => (
          <>
            <Rating
              {...props}
              name={name}
              onBlur={onBlur}
              onChange={onChange}
              defaultValue={props.defaultValue}
              // error={error}
              // helperText={error_message}
              // inputRef={ref}
            />

            {!!error_message && (
              <FormHelperText error={error}>{error_message}</FormHelperText>
            )}
          </>
        )
        // <Rating
        //   {...props}
        //   name={name}
        //   error={error}
        //   defaultValue={value}
        //   onBlur={onBlur}
        //   onChange={onChange}
        //   helperText={error_message}
        //   inputRef={ref}

        // />
      }
    />
  );
});

export default RatingHookForm;
