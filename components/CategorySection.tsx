import React from 'react';
import { LinkItem } from '../types';
import LinkCard from './LinkCard';

interface CategorySectionProps {
  category: string;
  links: LinkItem[];
  viewMode: 'grid' | 'list';
  onEdit: (link: LinkItem) => void;
  isDeleteModeActive: boolean;
  selectedLinkIds: string[];
  onSelect: (id: string) => void;
  showCategoryTitle: boolean;
  animationStartIndex: number;
  onCopyToClipboard: (text: string, message: string) => void;
  multiOpenSelectedIds: string[];
  onMultiOpenSelect: (id: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  links,
  viewMode,
  onEdit,
  isDeleteModeActive,
  selectedLinkIds,
  onSelect,
  showCategoryTitle,
  animationStartIndex,
  onCopyToClipboard,
  multiOpenSelectedIds,
  onMultiOpenSelect,
}) => {
  const viewWrapperClasses = viewMode === 'grid'
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
    : 'flex flex-col gap-2';
  
  return (
    <section className="mb-8">
      {showCategoryTitle && (
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b-2 border-sky-500/30 dark:border-sky-500/40">
          {category}
        </h2>
      )}
      <div className={viewWrapperClasses}>
        {links.map((link, index) => (
          <LinkCard
            key={link.id}
            link={link}
            viewMode={viewMode}
            onEdit={onEdit}
            isDeleteModeActive={isDeleteModeActive}
            isSelected={selectedLinkIds.includes(link.id)}
            onSelect={onSelect}
            animationIndex={animationStartIndex + index}
            onCopyToClipboard={onCopyToClipboard}
            isMultiOpenSelected={multiOpenSelectedIds.includes(link.id)}
            onMultiOpenSelect={onMultiOpenSelect}
          />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
