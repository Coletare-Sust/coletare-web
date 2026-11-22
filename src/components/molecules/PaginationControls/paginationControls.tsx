"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import Button from "@/components/atoms/Button/button";

interface PaginationControlsProps {
  page: number;
  totalPages?: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  page,
  totalPages = 0,
  isLoading = false,
  onPageChange
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        buttonType="button"
        disabled={page === 0 || isLoading}
        onClick={() => onPageChange(Math.max(page - 1, 0))}
        className="px-3"
      >
        <span className="flex items-center gap-2" aria-label="Página anterior">
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Anterior</span>
        </span>
      </Button>
      <span className="text-sm font-medium text-greenBlue-1000">
        {page + 1} de {totalPages}
      </span>
      <Button
        buttonType="button"
        disabled={page >= totalPages - 1 || isLoading}
        onClick={() => onPageChange(Math.min(page + 1, totalPages - 1))}
        className="px-3"
      >
        <span className="flex items-center gap-2" aria-label="Próxima página">
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight size={18} />
        </span>
      </Button>
    </div>
  );
}
