import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [6, 12, 24],
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) => {
  if (totalItems === 0) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const pageWindow = 2
  const pages: number[] = []
  const from = Math.max(1, currentPage - pageWindow)
  const to = Math.min(totalPages, currentPage + pageWindow)
  for (let i = from; i <= to; i += 1) pages.push(i)

  return (
    <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4">
      <p className="text-xs font-bold text-gray-500">
        Affichage <span className="text-gray-900">{startItem}</span> - <span className="text-gray-900">{endItem}</span> sur{' '}
        <span className="text-gray-900">{totalItems}</span>
      </p>

      <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-gray-500 whitespace-nowrap">Par page</label>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-primary/30"
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center justify-center"
          aria-label="Page précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {from > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-9 h-9 rounded-xl border border-gray-200 text-xs font-black text-gray-700 hover:bg-gray-50"
            >
              1
            </button>
            {from > 2 && <span className="px-1 text-gray-400 text-xs font-bold">…</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-xl text-xs font-black ${
              page === currentPage
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        {to < totalPages && (
          <>
            {to < totalPages - 1 && <span className="px-1 text-gray-400 text-xs font-bold">…</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-9 h-9 rounded-xl border border-gray-200 text-xs font-black text-gray-700 hover:bg-gray-50"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center justify-center"
          aria-label="Page suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
