import * as React from 'react';
import { styled } from '@mui/material/styles';
import { TablePagination } from '@mui/material';

const CustomTablePagination = styled(TablePagination)(({ theme }) => ({
    width: '100%',
    borderTop: `1px solid ${theme.palette.divider}`,
    '& .MuiTablePagination-toolbar': {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing(1.5, 2),
        minHeight: 56,
    },
    '& .MuiTablePagination-spacer': {
        display: 'none',
    },
    '& .MuiTablePagination-selectLabel': {
        margin: 0,
        fontWeight: 600,
    },
    '& .MuiTablePagination-select': {
        fontFamily: 'inherit',
        padding: '4px 8px',
        border: 'none',
        borderRadius: 0,
        backgroundColor: 'transparent',
        color: theme.palette.text.primary,
        transition: 'all 100ms ease',
        '&:hover': {
            backgroundColor: 'transparent',
        },
        '&:focus': {
            backgroundColor: 'transparent',
            outline: 'none',
        },
    },
    '& .MuiTablePagination-displayedRows': {
        margin: 0,
        fontWeight: 500,
        marginLeft: 'auto',
    },
    '& .MuiTablePagination-actions': {
        display: 'flex',
        gap: 6,
        marginLeft: theme.spacing(2),
        '& button': {
            display: 'flex',
            alignItems: 'center',
            padding: 8,
            borderRadius: '50%',
            backgroundColor: 'transparent',
            border: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.primary,
            transition: 'all 100ms ease',
            '&:hover': {
                backgroundColor: theme.palette.action.hover,
                borderColor: theme.palette.primary.main,
            },
            '&:disabled': {
                opacity: 0.3,
                '&:hover': {
                    backgroundColor: 'transparent',
                    borderColor: theme.palette.divider,
                },
            },
            '& svg': {
                fontSize: 20,
            },
        },
    },
}));

interface CustomPaginationProps {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function CustomTablePaginationComponent({
    count,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
}: CustomPaginationProps) {
    return (
        <CustomTablePagination
            count={count}
            page={page}
            onPageChange={onPageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
            showFirstButton
            showLastButton
        />
    );
}
