'use client'

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  RowData,
  SortingState,
  useReactTable
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { copyTableContent, exportTableToExcel } from '@/lib/contextMenuUtils'
import { cn } from '@/lib/utils'
import { Fragment, ReactElement, useMemo, useRef, useState } from 'react'
import { Button } from '../ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '../ui/context-menu'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { DataTablePagination } from './DataTablePagination'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  renderSubComponent?: (props: { row: Row<TData> }) => ReactElement
  getRowCanExpand?: (row: Row<TData>) => boolean
  getPagination?: boolean
  enableRowSelection?: boolean // Optional: Enable selection
  onRowSelectionChange?: (updaterOrValue: any) => void // Pass state setter
  rowSelection?: any // Pass state
  // Server-side pagination
  manualPagination?: boolean
  pageCount?: number
  pageIndex?: number
  pageSize?: number
  onPaginationChange?: (updater: any) => void
}

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    colsPan?: number
    filterVariant?: 'text' | 'range' | 'date' | 'select'
    className?: string
    filterable?: boolean
    filterPlaceholder?: string
    filterOptions?: Array<{ label: string; value: string }>
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  renderSubComponent,
  getRowCanExpand,
  getPagination,
  enableRowSelection,
  onRowSelectionChange,
  rowSelection,
  manualPagination,
  pageCount,
  onPaginationChange
}: Readonly<DataTableProps<TData, TValue>>) {
  const HEADER_ROW_PX = 44
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getRowCanExpand,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPagination ? getPaginationRowModel() : undefined,
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(manualPagination ? { manualPagination: true } : {}),
    ...(pageCount === undefined ? {} : { pageCount }),
    ...(onPaginationChange ? { onPaginationChange } : {}),
    onRowSelectionChange: (updater) => {
      // Handle both functional updates and direct values
      if (typeof onRowSelectionChange === 'function') {
        onRowSelectionChange(updater)
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      rowSelection: rowSelection || {},
      sorting,
      columnFilters
    },
    enableRowSelection: enableRowSelection
  })

  const tableRef = useRef<HTMLTableElement>(null)

  const handleExportExcel = () => {
    if (!tableRef.current) return
    exportTableToExcel(tableRef.current, 'tabla.xlsx')
  }

  const handleCopyTableContent = () => {
    if (!tableRef.current) return
    copyTableContent(tableRef.current)
  }

  const leafHeaders = useMemo(() => {
    const groups = table.getHeaderGroups()
    if (!groups.length) return []
    return groups[groups.length - 1].headers
  }, [table])

  const showColumnFilters = useMemo(() => {
    return leafHeaders.some((h) => h.column.columnDef.meta?.filterable)
  }, [leafHeaders])

  const renderFilter = (header: (typeof leafHeaders)[number]) => {
    if (header.isPlaceholder) return null

    const meta = header.column.columnDef.meta as
      | {
          filterable?: boolean
          filterPlaceholder?: string
          filterVariant?: 'text' | 'select'
          filterOptions?: Array<{ label: string; value: string }>
        }
      | undefined

    if (!meta?.filterable || !header.column.getCanFilter()) return null

    const variant = meta.filterVariant ?? 'text'
    const value = (header.column.getFilterValue() ?? '') as string

    if (variant === 'select' && meta.filterOptions?.length) {
      const ALL = '__all__'
      return (
        <Select
          value={value || ALL}
          onValueChange={(v) =>
            header.column.setFilterValue(v === ALL ? undefined : v)
          }
        >
          <SelectTrigger size='sm' className='w-full justify-center text-xs'>
            <SelectValue placeholder={meta.filterPlaceholder ?? 'Todos'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            {meta.filterOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    return (
      <Input
        value={value}
        onChange={(e) => header.column.setFilterValue(e.target.value)}
        placeholder={meta.filterPlaceholder ?? 'Filtrar...'}
        className='h-8 text-xs'
      />
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className='w-full space-y-2'>
          <div className='rounded-md border overflow-x-auto max-h-none sm:max-h-[calc(100vh-13rem)] overflow-y-auto'>
            {/* <div className=''> */}
            {showColumnFilters && columnFilters.length ? (
              <div className='flex items-center justify-end'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-8 px-2 text-xs'
                  onClick={() => setColumnFilters([])}
                >
                  Limpiar filtros
                </Button>
              </div>
            ) : null}
            <Table ref={tableRef}>
              <TableHeader className='sticky top-0 z-10 font-medium bg-muted'>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className={cn(
                            '',
                            header.column.columnDef.meta?.className ?? ''
                          )}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
                {showColumnFilters ? (
                  <TableRow
                    className='sticky z-20 bg-card border-b'
                    style={{
                      top: table.getHeaderGroups().length * HEADER_ROW_PX
                    }}
                  >
                    {leafHeaders.map((header) => (
                      <TableHead
                        key={header.id}
                        className={cn(
                          header.column.columnDef.meta?.className ?? '',
                          'bg-card px-2 py-2'
                        )}
                      >
                        {renderFilter(header)}
                      </TableHead>
                    ))}
                  </TableRow>
                ) : null}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    return (
                      <Fragment key={row.id}>
                        <TableRow
                          data-state={row.getIsSelected() && 'selected'}
                          className='text-center'
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className={cn(
                                'p-2 border-b border-border',
                                cell.column.columnDef.meta?.className ?? ''
                              )}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                        {row.getIsExpanded() && (
                          <TableRow
                            data-state={row.getIsSelected() && 'selected'}
                            className='text-center whitespace-nowrap'
                          >
                            <TableCell colSpan={row.getVisibleCells().length}>
                              <div className='max-w-[calc(100vw-6rem)]'>
                                {renderSubComponent
                                  ? renderSubComponent({ row })
                                  : null}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center'
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              {table
                .getFooterGroups()
                .some((footerGroup) =>
                  footerGroup.headers.some(
                    (header) => header.column.columnDef.footer
                  )
                ) && (
                <TableFooter className='sticky bottom-0 z-10 bg-muted font-semibold'>
                  {table.getFooterGroups().map((footerGroup) => (
                    <TableRow key={footerGroup.id}>
                      {footerGroup.headers.map((header) => (
                        <TableCell
                          key={header.id}
                          className={cn(
                            'border px-4 py-2 font-bold text-center',
                            header.column.columnDef.meta?.className ?? ''
                          )}
                          style={{
                            width: header.column.getSize()
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.footer,
                            header.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableFooter>
              )}
            </Table>
          </div>
          {getPagination && <DataTablePagination table={table} />}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={handleCopyTableContent}>
          Copiar Tabla
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleExportExcel}>
          Exportar a Excel
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
