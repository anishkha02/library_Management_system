import { Chip, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { useConfirm } from "material-ui-confirm";
import { useEffect, useMemo, useState } from "react";
import server from "../../HTTP/httpCommonParam";
import TimeFormat from "../../utils/TimeFormat";

// comparator
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: "title",
    disablePadding: true,
    label: "Title of the Book",
    align: "left",
  },
  {
    id: "edition",
    disablePadding: false,
    label: "Edition",
    align: "right",
  },
  {
    id: "fineDate",
    disablePadding: false,
    label: "Fined on",
    align: "right",
  },
  {
    id: "paymentDate",
    disablePadding: false,
    label: "Paid on",
    align: "right",
  },
  {
    id: "amount",
    disablePadding: false,
    label: "Amount",
    align: "right",
  },
  {
    id: "status",
    disablePadding: false,
    label: "Status",
    align: "center",
  },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding="normal"
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function EnhancedTableToolbar() {
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
      }}
    >
      {
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h2"
          id="tableTitle"
          component="div"
        >
          My Fine History
        </Typography>
      }
    </Toolbar>
  );
}

export default function MyDueList() {
  const confirm = useConfirm();
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("title");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState([]);

  const getMyDueList = async () => {
    try {
      const response = await server.get("/my-fine-history");
      console.log(response.data);

      const newRows = response.data.map((row) => {
        return {
          editionId: row.EDITION_ID,
          rentHistoryId: row.RENT_HISTORY_ID,
          title: row.TITLE,
          edition: row.EDITION_NUM,
          fineDate: TimeFormat(row.START_DATE),
          paymentDate: row.PAYMENT_DATE ? TimeFormat(row.PAYMENT_DATE) : "-",
          amount: row.FEE_AMOUNT,
          status: row.PAYMENT_DATE ? "Paid" : "Not Paid",
          isbn: row.ISBN,
        };
      });
      console.log(newRows);
      setRows(newRows);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getMyDueList();
    console.log(emptyRows);
  }, []);
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = useMemo(
    () =>
      // TODO :   sorting query here.
      stableSort(rows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [order, rows, orderBy, page, rowsPerPage]
  );

  const payNowHandler = (isbn) => {
    console.log(isbn);
    confirm({
      title: (
        <Typography variant="h4">Are you sure you want to pay now?</Typography>
      ),
      description: "This action cannot be undone",
    })
      .then(() => {
        // TODO :   pay now query here.
        console.log(isbn);
      })
      .catch(() => {
        console.log(isbn);
      });
  };
  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar />
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table
            stickyHeader
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow hover tabIndex={-1} key={row.isbn}>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="normal"
                    >
                      {row.title}
                    </TableCell>
                    <TableCell align={headCells[1].align}>
                      {row.edition}
                    </TableCell>
                    <TableCell align={headCells[2].align}>
                      {row.fineDate}
                    </TableCell>
                    <TableCell align={headCells[3].align}>
                      {row.paymentDate}
                    </TableCell>
                    <TableCell align={headCells[4].align}>
                      {row.amount}
                    </TableCell>
                    <TableCell align={headCells[5].align}>
                      {row.status === "Paid" ? (
                        <Chip label={row.status} color="success" />
                      ) : (
                        <Tooltip title="Pay Now">
                          <Chip
                            label={row.status}
                            onClick={() => {
                              payNowHandler(row.isbn);
                            }}
                            color="error"
                            variant="outlined"
                          />
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
