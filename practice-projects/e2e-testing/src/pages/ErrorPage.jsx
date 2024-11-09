import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
    const error = useRouteError();
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

    return (
        <div id="error-page">
        <h1>Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <p>
            <i>{errorText}</i>
        </p>
        </div>
    );
}