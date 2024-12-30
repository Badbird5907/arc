"use client";

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { type Cell, type ColumnDef, type ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, type PaginationState, type SortingState, useReactTable, type VisibilityState } from "@tanstack/react-table"
import { ChevronDown } from "lucide-react"
import React, { type Dispatch, type SetStateAction, useEffect, useMemo, type JSX } from "react"
import { Checkbox } from "@/components/ui/checkbox";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
  actionsBar,
  globalFilter,
  paginationData = undefined,
  defaultHiddenColumns = ["id"],
  loading = false,
  hideColumnsDropdown = false,
  allowColumnSelection = false,
}: DataTableProps<TData, TValue> & {
  hideIdDefault?: boolean;
  actionsBar?: JSX.Element | JSX.Element[];
  globalFilter?: string;
  paginationData?: {
    rowCount: number;
    state: [PaginationState, Dispatch<SetStateAction<PaginationState>>]
  }
  defaultHiddenColumns?: string[]
  loading?: boolean
  hideColumnsDropdown?: boolean
  allowColumnSelection?: boolean
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(
      defaultHiddenColumns.reduce((acc, col) => ({ ...acc, [col]: false }), {})
    )
  const [rowSelection, setRowSelection] = React.useState({})
  const actualColumns = useMemo(() => {
    if (allowColumnSelection) {
      return [
        {
          id: "select",
          header: ({ table }) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        },
        ...columns,
      ]
    }
    return columns;
  }, [columns, allowColumnSelection])
  const table = useReactTable({
    data,
    columns: actualColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: (row, colId, filterValue) => {
      const lowerCaseFilterValue = String(filterValue).toLowerCase()
      const cells: Cell<TData, unknown>[] = row.getAllCells();
      const filtered = cells.some((cell) => {
        const value = cell.getValue();
        return value?.toString().toLowerCase().includes(lowerCaseFilterValue);
      });
      return filtered;
    },
    ...(paginationData ? {
      onPaginationChange: paginationData.state?.[1],
      manualPagination: true,
      pageCount: Math.ceil(paginationData.rowCount / paginationData.state?.[0].pageSize),
    } : {}),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      ...(paginationData ? { pagination: paginationData.state?.[0] } : {}),
    },
  });

  useEffect(() => {
    if (globalFilter !== undefined) {
      console.log("Setting global filter", globalFilter)
      table.setGlobalFilter(globalFilter)
    }
  }, [globalFilter, table]);

  return (
    <div className="w-full">
      <div className={cn(
        "flex flex-col md:flex-row items-center",
        actionsBar || !hideColumnsDropdown ? "py-4" : "py-0"
      )}>
        {/*
        <Input
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />*/}
        {actionsBar}
        {!hideColumnsDropdown && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto mt-2 md:mt-0 w-full md:w-fit">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {typeof column.columnDef.header === 'string'
                        ? column.columnDef.header
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex justify-center">
                    {loading ? <Spinner className="w-4 h-4" /> : "No results."}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        {allowColumnSelection && (
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        )}
        <div className="flex-1 text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} (Showing {table.getFilteredRowModel().rows.length} of {paginationData?.rowCount ?? 0} rows)
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}