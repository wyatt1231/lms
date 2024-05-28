import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormControlProps,
  FormGroup,
  FormHelperText,
  FormLabel,
} from "@material-ui/core";
import { useField } from "formik";
import React, { memo } from "react";

interface IOptions {
  id: string | number;
  label: string | number;
}

interface IFormikCheckbox {
  data: Array<IOptions>;
  label: string;
  name: string;
  row?: boolean;
}

const FormikCheckbox: React.FC<IFormikCheckbox & FormControlProps> = memo(
  ({ name, label, row, data, ...props }) => {
    const [field, meta, setters] = useField(name);
    const errorText = meta.error && meta.touched ? meta.error : "";
    return (
      <FormControl error={!!errorText}>
        {label ? (
          <FormLabel key={name} className="checkbox-label">
            {label}
          </FormLabel>
        ) : null}

        <FormGroup row={row}>
          {data &&
            data.map((val, ind) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value.includes(val.id)}
                    name={name}
                    value={val.id}
                    color={props.color}
                    size={props.size}
                    onChange={() => {
                      let nextValue = null;

                      if (field.value.includes(val.id)) {
                        nextValue = field?.value?.filter(
                          (value) => value !== val.id
                        );
                      } else {
                        nextValue = field.value.concat(val.id);
                      }

                      nextValue && setters.setValue(nextValue);
                    }}
                  />
                }
                label={val.label}
              />
            ))}
        </FormGroup>
        <FormHelperText>{errorText}</FormHelperText>
      </FormControl>
    );
  }
);

export default FormikCheckbox;
