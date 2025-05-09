import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Page not found
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        Go back home
      </Link>
    </div>
  );
}