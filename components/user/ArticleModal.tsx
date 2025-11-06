'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { EducationArticle } from '@/types/education';
import { X } from 'lucide-react';

interface ArticleModalProps {
  article: EducationArticle | null;
  open: boolean;
  onClose: () => void;
}

export function ArticleModal({ article, open, onClose }: ArticleModalProps) {
  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${article.bgColor}`}>
                <span className="text-2xl">{article.icon}</span>
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {article.title}
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">{article.subtitle}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-1">
              📚 {article.difficulty.charAt(0).toUpperCase() + article.difficulty.slice(1)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              ⏱️ {article.readTime} min read
            </span>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Introduction */}
          <div className="text-gray-700 leading-relaxed">
            {article.content.introduction}
          </div>

          {/* Main Content Sections */}
          {article.content.sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                {section.heading}
              </h2>
              <p className="text-gray-700 leading-relaxed">{section.content}</p>
              
              {/* Subsections */}
              {section.subsections && section.subsections.length > 0 && (
                <div className="space-y-4 ml-4">
                  {section.subsections.map((subsection, subIndex) => (
                    <div key={subIndex} className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {subsection.heading}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{subsection.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Key Takeaways */}
          <div className="rounded-xl bg-purple-50 border border-purple-200 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
              <span>💡</span>
              Key Takeaways
            </h2>
            <ul className="space-y-2">
              {article.content.keyTakeaways.map((takeaway, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-purple-600 mt-1">→</span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Steps */}
          {article.content.nextSteps && article.content.nextSteps.length > 0 && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-6 space-y-3">
              <h2 className="text-lg font-semibold text-green-900 flex items-center gap-2">
                <span>✅</span>
                Your Next Steps
              </h2>
              <ol className="space-y-2">
                {article.content.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-200 text-green-800 text-xs font-semibold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
              {article.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
          <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700">
            Done Reading
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

