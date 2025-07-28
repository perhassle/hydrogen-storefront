import {Link} from 'react-router';
import {generateBreadcrumbStructuredData, type BreadcrumbItem} from '~/lib/seo';

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  includeStructuredData?: boolean;
}

/**
 * Breadcrumb navigation component with structured data support
 */
export function Breadcrumbs({
  items,
  className = '',
  includeStructuredData = true,
}: BreadcrumbsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const structuredData = includeStructuredData 
    ? generateBreadcrumbStructuredData(items)
    : null;

  return (
    <>
      <nav aria-label="Breadcrumb" className={`breadcrumbs ${className}`.trim()}>
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <li key={item.url} className="flex items-center">
                {index > 0 && (
                  <svg
                    className="w-4 h-4 mx-2 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {isLast ? (
                  <span 
                    className="font-medium text-gray-900" 
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link 
                    to={item.url} 
                    className="hover:text-gray-700 transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
    </>
  );
}