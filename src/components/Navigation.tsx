import { NavLink } from 'react-router-dom';
import { Book, BookOpen, Bookmark, PenTool, Headphones, Type, GitCompare as Compare } from 'lucide-react';

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-around py-4">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
              }`
            }
          >
            <Bookmark className="h-6 w-6" />
            <span className="text-sm mt-1">Dashboard</span>
          </NavLink>
          
          <NavLink
            to="/topics"
            className={({ isActive }) =>
              `flex flex-col items-center ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
              }`
            }
          >
            <Book className="h-6 w-6" />
            <span className="text-sm mt-1">Topics</span>
          </NavLink>
          
          <NavLink
            to="/study"
            className={({ isActive }) =>
              `flex flex-col items-center ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
              }`
            }
          >
            <BookOpen className="h-6 w-6" />
            <span className="text-sm mt-1">Study</span>
          </NavLink>
          
          <NavLink
            to="/practice"
            className={({ isActive }) =>
              `flex flex-col items-center ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
              }`
            }
          >
            <PenTool className="h-6 w-6" />
            <span className="text-sm mt-1">Practice</span>
          </NavLink>

          <NavLink
            to="/comparison"
            className={({ isActive }) =>
              `flex flex-col items-center ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
              }`
            }
          >
            <Compare className="h-6 w-6" />
            <span className="text-sm mt-1">Compare</span>
          </NavLink>

          <NavLink
            to="/generate"
            className={({ isActive }) =>
              `flex flex-col items-center ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
              }`
            }
          >
            <Type className="h-6 w-6" />
            <span className="text-sm mt-1">Generate</span>
          </NavLink>

          <NavLink
            to="/podcast"
            className={({ isActive }) =>
              `flex flex-col items-center ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
              }`
            }
          >
            <Headphones className="h-6 w-6" />
            <span className="text-sm mt-1">Podcast</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}