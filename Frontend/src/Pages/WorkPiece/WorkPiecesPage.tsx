import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
} from '@mui/material';
import MUICustomBtn from '../../Components/Common/MUICustomBtn';
import {
  Build as BuildIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import {
  getAllWorkPiecesService,
  type WorkPieceListItem,
} from '../../Services/ApiServices/workPieceServices';
import { useToast } from '../../Utils/ToastContext';
import { useTranslation } from '../../hooks/useTranslation';
import DataTable, { type Column } from '../../Components/Common/DataTable';
import DataCardGrid, { type CardField, type CardAction } from '../../Components/Common/DataCardGrid';
import type { PaginationMeta } from '../../Services/ApiServices';
import { getAvailableWorkPieceStatus, getStatusColor, formatStatus } from '../../Utils/WorkPiece';
import { getUserInfo } from '../../Services/ApiServices';

const WorkPiecesPage = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const { t } = useTranslation();
  const userInfo = getUserInfo();
  const userRole = userInfo?.role || '';

  const [workPieces, setWorkPieces] = useState<WorkPieceListItem[]>([]);
  const [filteredWorkPieces, setFilteredWorkPieces] = useState<WorkPieceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [currentPage, setCurrentPage] = useState(0); // 0-based for MUI TablePagination
  const [pageSize, setPageSize] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  // Generate status options based on user role
  const statusOptions = useMemo(() => {
    const availableStatuses = getAvailableWorkPieceStatus(userRole);
    const options = [{ value: '', label: 'All Statuses' }];

    availableStatuses.forEach((status) => {
      options.push({
        value: status,
        label: formatStatus(status)
      });
    });

    return options;
  }, [userRole]);

  const fetchWorkPieces = useCallback(async (page: number = 0, status?: string) => {
    try {
      setLoading(true);
      const apiPage = page + 1; // Convert 0-based to 1-based for API
      const response = await getAllWorkPiecesService(apiPage, pageSize, status || undefined);
      if (response.success === 200 && response.data) {
        const { workPieces: workPiecesData, pagination } = response.data;
        setWorkPieces(workPiecesData);
        setPaginationMeta(pagination);
        setCurrentPage(page);
      } else {
        showError(response.message || 'Failed to load work pieces', 'Error');
      }
    } catch (err: unknown) {
      console.error('Error fetching work pieces:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        showError(axiosError.response?.data?.message || 'Failed to load work pieces', 'Error');
      } else {
        showError('Failed to load work pieces. Please try again.', 'Error');
      }
    } finally {
      setLoading(false);
    }
  }, [showError, pageSize]);

  useEffect(() => {
    fetchWorkPieces(currentPage, statusFilter);
  }, [fetchWorkPieces, currentPage, statusFilter]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredWorkPieces(workPieces);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = workPieces.filter(
      (wp) =>
        wp.id.toLowerCase().includes(term) ||
        (wp.productItem?.name && wp.productItem.name.toLowerCase().includes(term)) ||
        (wp.assignedTo?.fullName && wp.assignedTo.fullName.toLowerCase().includes(term)) ||
        wp.currentStatus.toLowerCase().includes(term)
    );
    setFilteredWorkPieces(filtered);
  }, [searchTerm, workPieces]);

  const handleViewWorkPieceDetails = (workpieceId: string) => {
    navigate(`/dashboard/workpiece/${workpieceId}`);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
    setCurrentPage(0);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Table columns configuration
  const columns: Column<WorkPieceListItem>[] = [
    {
      id: 'workpieceId',
      label: 'Workpiece ID',
      render: (wp) => wp.id.substring(0, 8) + '...',
    },
    {
      id: 'productItem',
      label: 'Product Item',
      render: (wp) => wp.productItem?.name || '—',
    },
    {
      id: 'status',
      label: t('common.status'),
      render: (wp) => (
        <Chip
          label={formatStatus(wp.currentStatus)}
          color={getStatusColor(wp.currentStatus)}
          size="small"
          sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}
        />
      ),
    },
    {
      id: 'assignedTo',
      label: 'Assigned To',
      render: (wp) => wp.assignedTo?.fullName || '—',
    },
    {
      id: 'createdAt',
      label: 'Created At',
      render: (wp) => formatDate(wp.createdAt),
    },
    {
      id: 'actions',
      label: t('common.actions'),
      render: (wp) => (
        <MUICustomBtn
          size="small"
          onClick={() => handleViewWorkPieceDetails(wp.id)}
          tooltip="View Details"
          variant="contained"
          sx={{
            bgcolor: '#e3f2fd',
            color: '#1976d2',
            minWidth: 32,
            width: 32,
            height: 32,
            padding: 0,
            '&:hover': {
              bgcolor: '#bbdefb',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(25, 118, 210, 0.2)',
            },
          }}
        >
          <VisibilityIcon />
        </MUICustomBtn>
      ),
    },
  ];

  // Card fields configuration
  const cardFields: CardField<WorkPieceListItem>[] = [
    {
      id: 'productItem',
      label: 'Product Item',
      render: (wp) => <Typography variant="body2">{wp.productItem?.name || '—'}</Typography>,
    },
    {
      id: 'status',
      label: t('common.status'),
      render: (wp) => (
        <Chip
          label={formatStatus(wp.currentStatus)}
          color={getStatusColor(wp.currentStatus)}
          size="small"
          sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}
        />
      ),
    },
    {
      id: 'assignedTo',
      label: 'Assigned To',
      render: (wp) => (
        <Typography variant="body2" color="text.secondary">
          {wp.assignedTo?.fullName || '—'}
        </Typography>
      ),
    },
    {
      id: 'createdAt',
      label: 'Created At',
      render: (wp) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(wp.createdAt)}
        </Typography>
      ),
    },
  ];

  // Card actions configuration
  const cardActions: CardAction<WorkPieceListItem>[] = [
    {
      id: 'view',
      render: (wp) => (
        <MUICustomBtn
          size="small"
          onClick={() => handleViewWorkPieceDetails(wp.id)}
          tooltip="View Details"
          variant="contained"
          sx={{
            bgcolor: '#e3f2fd',
            color: '#1976d2',
            minWidth: 32,
            width: 32,
            height: 32,
            padding: 0,
            '&:hover': {
              bgcolor: '#bbdefb',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(25, 118, 210, 0.2)',
            },
          }}
        >
          <VisibilityIcon fontSize="small" />
        </MUICustomBtn>
      ),
    },
  ];

  return (
    <Card sx={{ borderRadius: 1.5, p: { xs: 2, sm: 3 } }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2
      }}>
        <Typography variant="h5" sx={{
          fontWeight: 700,
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}>
          Work Pieces
        </Typography>
        <Box sx={{
          display: 'flex',
          gap: 1.5,
          flexWrap: 'wrap',
          width: { xs: '100%', sm: 'auto' },
          alignItems: 'center'
        }}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilter(!showFilter)}
            sx={{
              borderColor: showFilter ? '#667eea' : '#ccc',
              color: showFilter ? '#667eea' : '#666',
              '&:hover': {
                borderColor: '#667eea',
                bgcolor: 'rgba(102, 126, 234, 0.04)',
                transform: 'translateY(-2px)',
              },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 2,
              py: 1,
              borderRadius: 1.5,
            }}
          >
            {showFilter ? 'Hide Filter' : 'Show Filter'}
          </Button>
          <Button
            variant="outlined"
            startIcon={viewMode === 'table' ? <ViewModuleIcon /> : <ViewListIcon />}
            onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
            sx={{
              borderColor: '#ccc',
              color: '#666',
              '&:hover': {
                borderColor: '#667eea',
                bgcolor: 'rgba(102, 126, 234, 0.04)',
                transform: 'translateY(-2px)',
              },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 2,
              py: 1,
              borderRadius: 1.5,
              display: { xs: 'none', lg: 'flex' },
            }}
          >
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </Button>
        </Box>
      </Box>

      {showFilter && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by ID, product item, or assigned user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: 300 },
              maxWidth: { xs: '100%', sm: 400 },
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }
            }}
          />
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredWorkPieces.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <BuildIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="body1">
            {searchTerm || statusFilter ? 'No work pieces found matching your filters' : 'No work pieces available'}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Desktop view - show table or card based on viewMode */}
          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
            {viewMode === 'table' ? (
              <DataTable
                columns={columns}
                data={filteredWorkPieces}
                getRowKey={(wp) => wp.id}
                paginationMeta={paginationMeta}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={(_event, page) => setCurrentPage(page)}
                onRowsPerPageChange={(event) => {
                  const newRowsPerPage = parseInt(event.target.value, 10);
                  const actualRowsPerPage = newRowsPerPage === -1 ? 10000 : newRowsPerPage;
                  setPageSize(actualRowsPerPage);
                  setCurrentPage(0);
                }}
                searchTerm={searchTerm}
              />
            ) : (
              <DataCardGrid
                data={filteredWorkPieces}
                getCardTitle={(wp) => `${wp.productItem?.name || 'Work Piece'}`}
                getCardSubtitle={(wp) => wp.id.substring(0, 12) + '...'}
                fields={cardFields}
                actions={cardActions}
                getRowKey={(wp) => wp.id}
                paginationMeta={paginationMeta}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={(_event, page) => setCurrentPage(page)}
                onRowsPerPageChange={(event) => {
                  const newRowsPerPage = parseInt(event.target.value, 10);
                  const actualRowsPerPage = newRowsPerPage === -1 ? 10000 : newRowsPerPage;
                  setPageSize(actualRowsPerPage);
                  setCurrentPage(0);
                }}
                searchTerm={searchTerm}
                columns={3}
              />
            )}
          </Box>

          {/* Mobile/Tablet view - always show card view on screens < 1024px */}
          <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
            <DataCardGrid
              data={filteredWorkPieces}
              getCardTitle={(wp) => `${wp.productItem?.name || 'Work Piece'}`}
              getCardSubtitle={(wp) => wp.id.substring(0, 12) + '...'}
              fields={cardFields}
              actions={cardActions}
              getRowKey={(wp) => wp.id}
              paginationMeta={paginationMeta}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={(_event, page) => setCurrentPage(page)}
              onRowsPerPageChange={(event) => {
                const newRowsPerPage = parseInt(event.target.value, 10);
                const actualRowsPerPage = newRowsPerPage === -1 ? 10000 : newRowsPerPage;
                setPageSize(actualRowsPerPage);
                setCurrentPage(0);
              }}
              searchTerm={searchTerm}
              columns={1}
            />
          </Box>
        </>
      )}
    </Card>
  );
};

export default WorkPiecesPage;

