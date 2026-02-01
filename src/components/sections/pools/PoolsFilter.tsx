"use client"

import type { PoolStatus } from "@/lib/types/models"

interface PoolsFiltersProps {
  currentFilter: PoolStatus | "active"
  onFilterChange: (filter: PoolStatus | "active") => void
}

const filters = [
  // { value: "all", label: "All Pools" },
  { value: "active", label: "Active" },
  { value: "resolved", label: "Resolved" },
  { value: "settled", label: "Settled" },
  { value: "closed", label: "Closed" },
] as const


export function PoolsFilters({ currentFilter, onFilterChange }: PoolsFiltersProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {filters.map((filter) => {
          const active = currentFilter === filter.value

          return (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`px-4 py-2 text-xs md:text-sm rounded-lg transition-all font-medium ${
                active
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
