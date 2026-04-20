import { Column } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TABLE_LABELS } from "@/localization/constants/table-labels";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  // ソート状態に応じたツールチップテキストを生成
  const getSortTooltip = () => {
    const sortState = column.getIsSorted();
    if (sortState === "desc") {
      return `${title}を${TABLE_LABELS.SORT_ASC}`;
    } else if (sortState === "asc") {
      return `${title}を${TABLE_LABELS.SORT_CLEAR}`;
    } else {
      return `${title}を${TABLE_LABELS.SORT_DESC}`;
    }
  };

  // ソート状態に応じたaria-labelを生成
  const getSortAriaLabel = () => {
    const sortState = column.getIsSorted();
    if (sortState === "desc") {
      return `${title}、降順でソート済み。クリックで昇順にソート`;
    } else if (sortState === "asc") {
      return `${title}、昇順でソート済み。クリックでソートをクリア`;
    } else {
      return `${title}、ソートなし。クリックで降順にソート`;
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        title={getSortTooltip()}
        aria-label={getSortAriaLabel()}
      >
        <span>{title}</span>
        {column.getIsSorted() === "desc" ? (
          <ArrowDown className="ml-2 h-4 w-4" aria-hidden="true" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" aria-hidden="true" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}
