import { TextField } from "@mui/material";

export function MyNumberInput({
    value = "",
    onChange = "",
    name = "",
    sx = {},
    min = undefined,
    max = undefined,
    ...otherProps
}) {
    function handleChange(e) {
        let val = e.target.value;
        if (val === "") {
            runOnChange(val);
            return;
        }
        val = Number(val);

        if (Number.isNaN(Number(val))) return; // verify the value is a number, if it isn't don't change the value
        else if (max && val > max) val = max; // verify the value is less than the max
        else if (min && val < min) val = min; // verify the value is greater than the min
        else if (val % 1 != 0) val = Math.round(val); // verify the value is a whole number
        runOnChange(val);
    }

    function runOnChange(val) {
        console.log(val);
        onChange({
            target: {
                name: name,
                value: val,
                type: "number",
            },
        });
    }

    function handleKeyPress(e) {
        if (e.key === "ArrowUp") {
            handleChange({ target: { value: Number(value) + 1 } });
        } else if (e.key === "ArrowDown") {
            handleChange({ target: { value: Number(value) - 1 } });
        }
    }

    const NewSX = {
        width: "5rem",
        ...sx,
    };

    return (
        <TextField
            label="#"
            variant="standard"
            value={value}
            onChange={handleChange}
            sx={NewSX}
            onKeyDown={handleKeyPress}
            {...otherProps}
        />
    );
}
