"use client"

interface PoolsFiltersProps {
  currentFilter: "all" | "ongoing" | "upcoming" | "pending" | "closed"
  onFilterChange: (filter: PoolsFiltersProps["currentFilter"]) => void
}

const filters = [
  { value: "all", label: "All" },
  { value: "ongoing", label: "Live" },
  { value: "upcoming", label: "Pre Launch" },
  { value: "pending", label: "Pending Resolution" },
  { value: "closed", label: "Ended" },
] as const

export function PoolsFilters({ currentFilter, onFilterChange }: PoolsFiltersProps) {
  return (
    <div className="mb-8 border-b border-white/10">
      <div className="flex items-center gap-6 text-sm">
        {filters.map((filter) => {
          const active = currentFilter === filter.value

          return (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`relative pb-3 transition-colors ${
                active
                  ? "text-green-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.label}

              {active && (
                <span className="absolute left-0 -bottom-px h-0.5 w-full bg-green-400" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
