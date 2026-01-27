"use client"

interface PoolsFiltersProps {
  currentFilter: "all" | "ongoing" | "upcoming" | "pending" | "closed"
  onFilterChange: (filter: PoolsFiltersProps["currentFilter"]) => void
}

const filters = [
  { value: "all", label: "All" },
  { value: "ongoing", label: "Active" },
  { value: "upcoming", label: "Expired" },
  { value: "pending", label: "Resolved" },
] as const

export function PoolsFilters({ currentFilter, onFilterChange }: PoolsFiltersProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center text-sm">
        {filters.map((filter) => {
          const active = currentFilter === filter.value

          return (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`relative p-1 px-5 transition-colors ${
                active
                  ? "text-primary border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.label}

              {/* {active && (
                <span className="absolute left-0 -bottom-px h-0.5 w-full bg-green-400" />
              )} */}
            </button>
          )
        })}
      </div>
    </div>
  )
}
