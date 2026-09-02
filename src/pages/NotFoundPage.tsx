import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="page">
      <h1>Page not found</h1>
      <Link to="/" className="button-primary">
        Back to shop
      </Link>
    </div>
  );
}
