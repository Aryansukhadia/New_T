import { Box, Card, CardContent, Typography, Grid, Chip } from '@mui/material';
import type { PaginationMeta } from '../../Services/ApiServices';
import CustomTablePaginationComponent from './CustomTablePagination';

export interface CardField<T> {
  id: string;
  label: string;
  render: (item: T) => React.ReactNode;
  showLabel?: boolean;
}

export interface CardAction<T> {
  id: string;
  render: (item: T) => React.ReactNode;
}

interface DataCardGridProps<T> {
  data: T[];
  getCardTitle: (item: T) => string;
  getCardSubtitle?: (item: T) => string;
  fields: CardField<T>[];
  actions: CardAction<T>[];
  getRowKey: (item: T) => string | number;
  paginationMeta?: PaginationMeta | null;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  showPagination?: boolean;
  searchTerm?: string;
  columns?: number; // Number of columns in grid (default: 3)
}

function DataCardGrid<T>({
  data,
  getCardTitle,
  getCardSubtitle,
  fields,
  actions,
  getRowKey,
  paginationMeta,
  currentPage = 0,
  pageSize = 10,
  onPageChange,
  onRowsPerPageChange,
  showPagination = true,
  searchTerm = '',
  columns = 3,
}: DataCardGridProps<T>) {
  return (
    <>
      <Grid container spacing={3}>
        {data.map((item) => (
          <Grid item xs={12} sm={6} md={12 / columns} key={getRowKey(item)}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {getCardTitle(item)}
                </Typography>
                {getCardSubtitle && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {getCardSubtitle(item)}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                  {fields.map((field) => (
                    <Box key={field.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {field.showLabel !== false && (
                        <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 80 }}>
                          {field.label}:
                        </Typography>
                      )}
                      <Box sx={{ flexGrow: 1 }}>{field.render(item)}</Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
              {actions.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    p: 2,
                    pt: 0,
                    borderTop: '1px solid #f0f0f0',
                    justifyContent: 'flex-end',
                  }}
                >
                  {actions.map((action) => (
                    <Box key={action.id}>{action.render(item)}</Box>
                  ))}
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      {showPagination && !searchTerm && paginationMeta && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <CustomTablePaginationComponent
            count={paginationMeta.totalCount}
            page={currentPage}
            rowsPerPage={pageSize}
            onPageChange={onPageChange || (() => {})}
            onRowsPerPageChange={onRowsPerPageChange || (() => {})}
          />
        </Box>
      )}
    </>
  );
}

export default DataCardGrid;

