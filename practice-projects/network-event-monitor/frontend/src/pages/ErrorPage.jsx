import { Typography, Box } from "@mui/material";
import { useRouteError } from "react-router-dom";

export default function ErrorPage({ error, resetErrorBoundary}) {
    const RouteError = useRouteError();
    let errorText = "Unknown details"

    if (!error) errorText = "Unknown error";
    else if (error instanceof Error) errorText = error.message;
    else if (typeof error === "string") errorText = error;
    else if (
        typeof error === "object" 
        && "statusText" in error 
        && typeof error.statusText === "string"
    ) {
        errorText = error.statusText;
    }

    console.log("ErrorPage: errorText:", errorText);

    return (
        <Box textAlign="center" mt={5}>
            <Typography variant="h1" component="h1" gutterBottom>
                Oops!
            </Typography>
            <Typography variant="body1" gutterBottom>
                Sorry, an unexpected error has occurred.
            </Typography>
            <Typography variant="body2" color="textSecondary">
                <Typography variant="body2" sx={{fontStyle: "italic"}}>
                    {errorText}
                </Typography>
            </Typography>
        </Box>
    );
}