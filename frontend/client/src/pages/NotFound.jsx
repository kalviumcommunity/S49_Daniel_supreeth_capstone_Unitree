import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page text-center py-24">
      <p className="text-6xl font-bold text-blue-600 mb-4">404</p>
      <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
      <p className="text-gray-500 mb-8">The page you are looking for doesn&apos;t exist or was moved.</p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  );
}
