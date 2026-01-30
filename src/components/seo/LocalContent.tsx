'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * LocalContent Component
 * Displays city-specific expertise and local SEO content from database
 * Renders markdown content with styled headings and paragraphs
 */

interface LocalContentProps {
  content?: string;
  cityName: string;
}

export function LocalContent({ content, cityName }: LocalContentProps) {
  // Don't render if no content available
  if (!content) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto space-y-4">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="text-3xl font-bold mt-8 mb-4 text-gray-900 scroll-mt-8">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-2xl font-bold mt-6 mb-3 text-gray-800">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1 ml-2">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="text-gray-700">
                  {children}
                </li>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </section>
  );
}

export default LocalContent;
